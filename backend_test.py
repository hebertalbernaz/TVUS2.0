#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for TVUSVET
Tests all CRUD operations for patients, exams, and image management
"""

import requests
import json
import io
import sys
from datetime import datetime
from typing import Dict, Any, Optional


class TVUSVETAPITester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            "patients": [],
            "exams": [],
            "images": []
        }

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED {details}")
        else:
            print(f"❌ {name}: FAILED {details}")
        return success

    def run_request(self, method: str, endpoint: str, **kwargs) -> tuple[bool, Dict[str, Any], int]:
        """Execute HTTP request and return success, response data, status code"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        try:
            response = requests.request(method, url, timeout=30, **kwargs)
            
            # Try to parse JSON response
            try:
                data = response.json()
            except:
                data = {"raw_response": response.text}
            
            return response.status_code < 400, data, response.status_code
            
        except Exception as e:
            return False, {"error": str(e)}, 0

    def test_health_check(self) -> bool:
        """Test health endpoint"""
        success, data, status = self.run_request("GET", "/api/health")
        
        if success and data.get("status") == "healthy" and data.get("db") == "ok":
            return self.log_test("Health Check", True, f"Status: {status}")
        else:
            return self.log_test("Health Check", False, f"Status: {status}, Data: {data}")

    def test_root_endpoint(self) -> bool:
        """Test root endpoint"""
        success, data, status = self.run_request("GET", "/")
        
        if success and data.get("status") == "online":
            return self.log_test("Root Endpoint", True, f"Status: {status}")
        else:
            return self.log_test("Root Endpoint", False, f"Status: {status}, Data: {data}")

    def test_create_patient(self) -> Optional[str]:
        """Test patient creation"""
        patient_data = {
            "name": f"Test Patient {datetime.now().strftime('%H%M%S')}",
            "species": "Canine",
            "owner_name": "Test Owner",
            "notes": "Test patient for API testing"
        }
        
        success, data, status = self.run_request(
            "POST", "/api/patients", 
            json=patient_data,
            headers={"Content-Type": "application/json"}
        )
        
        if success and status == 200 and "patient_id" in data:
            patient_id = data["patient_id"]
            self.created_resources["patients"].append(patient_id)
            
            # Verify no _id field is present
            has_mongo_id = "_id" in data
            if has_mongo_id:
                self.log_test("Create Patient - No ObjectId", False, "Found _id field in response")
            else:
                self.log_test("Create Patient - No ObjectId", True, "No _id field found")
            
            return self.log_test("Create Patient", True, f"ID: {patient_id}") and patient_id
        else:
            self.log_test("Create Patient", False, f"Status: {status}, Data: {data}")
            return None

    def test_get_patient(self, patient_id: str) -> bool:
        """Test get single patient"""
        success, data, status = self.run_request("GET", f"/api/patients/{patient_id}")
        
        if success and data.get("patient_id") == patient_id:
            # Verify no _id field
            has_mongo_id = "_id" in data
            if has_mongo_id:
                self.log_test("Get Patient - No ObjectId", False, "Found _id field in response")
            else:
                self.log_test("Get Patient - No ObjectId", True, "No _id field found")
            
            return self.log_test("Get Patient", True, f"Retrieved patient: {data.get('name')}")
        else:
            return self.log_test("Get Patient", False, f"Status: {status}, Data: {data}")

    def test_list_patients(self) -> bool:
        """Test list patients"""
        success, data, status = self.run_request("GET", "/api/patients")
        
        if success and isinstance(data, list):
            # Check if any patient has _id field
            has_mongo_ids = any("_id" in patient for patient in data)
            if has_mongo_ids:
                self.log_test("List Patients - No ObjectId", False, "Found _id fields in response")
            else:
                self.log_test("List Patients - No ObjectId", True, "No _id fields found")
            
            return self.log_test("List Patients", True, f"Found {len(data)} patients")
        else:
            return self.log_test("List Patients", False, f"Status: {status}, Data: {data}")

    def test_update_patient(self, patient_id: str) -> bool:
        """Test patient update"""
        update_data = {
            "notes": f"Updated at {datetime.now().isoformat()}"
        }
        
        success, data, status = self.run_request(
            "PATCH", f"/api/patients/{patient_id}",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        
        if success and data.get("patient_id") == patient_id:
            # Verify no _id field
            has_mongo_id = "_id" in data
            if has_mongo_id:
                self.log_test("Update Patient - No ObjectId", False, "Found _id field in response")
            else:
                self.log_test("Update Patient - No ObjectId", True, "No _id field found")
            
            return self.log_test("Update Patient", True, f"Updated notes: {data.get('notes')}")
        else:
            return self.log_test("Update Patient", False, f"Status: {status}, Data: {data}")

    def test_create_exam(self, patient_id: str) -> Optional[str]:
        """Test exam creation"""
        exam_data = {
            "patient_id": patient_id,
            "exam_type": "ultrasound_abd",
            "status": "draft",
            "organs_data": [{"organ": "liver", "findings": "normal"}],
            "notes": "Test exam for API testing"
        }
        
        success, data, status = self.run_request(
            "POST", "/api/exams",
            json=exam_data,
            headers={"Content-Type": "application/json"}
        )
        
        if success and status == 200 and "exam_id" in data:
            exam_id = data["exam_id"]
            self.created_resources["exams"].append(exam_id)
            
            # Verify no _id field
            has_mongo_id = "_id" in data
            if has_mongo_id:
                self.log_test("Create Exam - No ObjectId", False, "Found _id field in response")
            else:
                self.log_test("Create Exam - No ObjectId", True, "No _id field found")
            
            return self.log_test("Create Exam", True, f"ID: {exam_id}") and exam_id
        else:
            self.log_test("Create Exam", False, f"Status: {status}, Data: {data}")
            return None

    def test_get_exam(self, exam_id: str) -> bool:
        """Test get single exam"""
        success, data, status = self.run_request("GET", f"/api/exams/{exam_id}")
        
        if success and data.get("exam_id") == exam_id:
            # Verify no _id field
            has_mongo_id = "_id" in data
            if has_mongo_id:
                self.log_test("Get Exam - No ObjectId", False, "Found _id field in response")
            else:
                self.log_test("Get Exam - No ObjectId", True, "No _id field found")
            
            return self.log_test("Get Exam", True, f"Retrieved exam type: {data.get('exam_type')}")
        else:
            return self.log_test("Get Exam", False, f"Status: {status}, Data: {data}")

    def test_list_exams(self, patient_id: str) -> bool:
        """Test list exams with patient filter"""
        success, data, status = self.run_request("GET", f"/api/exams?patient_id={patient_id}")
        
        if success and isinstance(data, list):
            # Check if any exam has _id field
            has_mongo_ids = any("_id" in exam for exam in data)
            if has_mongo_ids:
                self.log_test("List Exams - No ObjectId", False, "Found _id fields in response")
            else:
                self.log_test("List Exams - No ObjectId", True, "No _id fields found")
            
            return self.log_test("List Exams", True, f"Found {len(data)} exams for patient")
        else:
            return self.log_test("List Exams", False, f"Status: {status}, Data: {data}")

    def test_update_exam(self, exam_id: str) -> bool:
        """Test exam update"""
        update_data = {
            "status": "final",
            "notes": f"Finalized at {datetime.now().isoformat()}"
        }
        
        success, data, status = self.run_request(
            "PATCH", f"/api/exams/{exam_id}",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        
        if success and data.get("exam_id") == exam_id:
            # Verify no _id field
            has_mongo_id = "_id" in data
            if has_mongo_id:
                self.log_test("Update Exam - No ObjectId", False, "Found _id field in response")
            else:
                self.log_test("Update Exam - No ObjectId", True, "No _id field found")
            
            return self.log_test("Update Exam", True, f"Status: {data.get('status')}")
        else:
            return self.log_test("Update Exam", False, f"Status: {status}, Data: {data}")

    def test_upload_image(self, patient_id: str, exam_id: str) -> Optional[str]:
        """Test image upload"""
        # Create a small test PNG image (1x1 pixel)
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xdd\x8d\xb4\x1c\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {
            'file': ('test_image.png', io.BytesIO(png_data), 'image/png')
        }
        
        params = {
            'patient_id': patient_id,
            'exam_id': exam_id,
            'tags': 'test,api'
        }
        
        success, data, status = self.run_request(
            "POST", "/api/images",
            files=files,
            params=params
        )
        
        if success and status == 200 and "image_id" in data:
            image_id = data["image_id"]
            self.created_resources["images"].append(image_id)
            
            # Verify no _id field
            has_mongo_id = "_id" in data
            if has_mongo_id:
                self.log_test("Upload Image - No ObjectId", False, "Found _id field in response")
            else:
                self.log_test("Upload Image - No ObjectId", True, "No _id field found")
            
            return self.log_test("Upload Image", True, f"ID: {image_id}") and image_id
        else:
            self.log_test("Upload Image", False, f"Status: {status}, Data: {data}")
            return None

    def test_get_image_meta(self, image_id: str) -> bool:
        """Test get image metadata"""
        success, data, status = self.run_request("GET", f"/api/images/{image_id}")
        
        if success and data.get("image_id") == image_id:
            # Verify no _id field
            has_mongo_id = "_id" in data
            if has_mongo_id:
                self.log_test("Get Image Meta - No ObjectId", False, "Found _id field in response")
            else:
                self.log_test("Get Image Meta - No ObjectId", True, "No _id field found")
            
            return self.log_test("Get Image Meta", True, f"Size: {data.get('size_bytes')} bytes")
        else:
            return self.log_test("Get Image Meta", False, f"Status: {status}, Data: {data}")

    def test_get_image_content(self, image_id: str) -> bool:
        """Test get image content"""
        url = f"{self.base_url}/api/images/{image_id}/content"
        
        try:
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200 and response.headers.get('content-type') == 'image/png':
                return self.log_test("Get Image Content", True, f"Content-Type: {response.headers.get('content-type')}")
            else:
                return self.log_test("Get Image Content", False, f"Status: {response.status_code}")
                
        except Exception as e:
            return self.log_test("Get Image Content", False, f"Error: {str(e)}")

    def test_exam_image_linking(self, exam_id: str) -> bool:
        """Test that image was properly linked to exam"""
        success, data, status = self.run_request("GET", f"/api/exams/{exam_id}")
        
        if success and "images" in data and len(data["images"]) > 0:
            return self.log_test("Exam Image Linking", True, f"Found {len(data['images'])} linked images")
        else:
            return self.log_test("Exam Image Linking", False, f"No images linked to exam")

    def test_delete_image(self, image_id: str, exam_id: str) -> bool:
        """Test image deletion and exam unlinking"""
        success, data, status = self.run_request("DELETE", f"/api/images/{image_id}")
        
        if success and data.get("deleted") is True:
            # Verify image was removed from exam
            exam_success, exam_data, exam_status = self.run_request("GET", f"/api/exams/{exam_id}")
            
            if exam_success:
                remaining_images = [img for img in exam_data.get("images", []) if img.get("image_id") == image_id]
                if len(remaining_images) == 0:
                    self.log_test("Image Unlinked from Exam", True, "Image reference removed")
                else:
                    self.log_test("Image Unlinked from Exam", False, "Image reference still present")
            
            return self.log_test("Delete Image", True, f"Deleted image: {image_id}")
        else:
            return self.log_test("Delete Image", False, f"Status: {status}, Data: {data}")

    def test_seed_templates_initial(self) -> Dict[str, Any]:
        """Test initial template seeding"""
        success, data, status = self.run_request("POST", "/api/templates/seed")
        
        if success and status == 200:
            initial_count = data.get("total_templates", 0)
            inserted = data.get("inserted", 0)
            updated = data.get("updated", 0)
            
            self.log_test("Seed Templates Initial", True, 
                         f"Total: {initial_count}, Inserted: {inserted}, Updated: {updated}")
            return data
        else:
            self.log_test("Seed Templates Initial", False, f"Status: {status}, Data: {data}")
            return {}

    def test_seed_templates_idempotency(self) -> bool:
        """Test template seeding idempotency (should not create duplicates)"""
        # First call
        success1, data1, status1 = self.run_request("POST", "/api/templates/seed")
        if not success1:
            return self.log_test("Seed Templates Idempotency", False, f"First call failed: {status1}")
        
        initial_total = data1.get("total_templates", 0)
        
        # Second call - should be idempotent
        success2, data2, status2 = self.run_request("POST", "/api/templates/seed")
        if not success2:
            return self.log_test("Seed Templates Idempotency", False, f"Second call failed: {status2}")
        
        second_total = data2.get("total_templates", 0)
        second_inserted = data2.get("inserted", 0)
        
        # Should have same total count and 0 new insertions
        if second_total == initial_total and second_inserted == 0:
            return self.log_test("Seed Templates Idempotency", True, 
                               f"No duplicates created. Total remained: {second_total}")
        else:
            return self.log_test("Seed Templates Idempotency", False, 
                               f"Expected same total ({initial_total}) and 0 insertions, got total: {second_total}, inserted: {second_inserted}")

    def test_get_templates_by_exam_type(self) -> bool:
        """Test template filtering by exam_type"""
        exam_types = ["radiography", "tomography", "ophthalmo_human", "ultrasound_abd"]
        all_passed = True
        
        for exam_type in exam_types:
            success, data, status = self.run_request("GET", f"/api/templates?exam_type={exam_type}")
            
            if success and isinstance(data, list):
                # Verify all returned templates have the correct exam_type
                correct_type = all(template.get("exam_type") == exam_type for template in data)
                
                # Verify no _id fields and template_id present
                no_mongo_ids = all("_id" not in template for template in data)
                has_template_ids = all("template_id" in template for template in data)
                
                if correct_type and no_mongo_ids and has_template_ids:
                    self.log_test(f"Get Templates - {exam_type}", True, 
                                f"Found {len(data)} templates, no _id fields, all have template_id")
                else:
                    self.log_test(f"Get Templates - {exam_type}", False, 
                                f"Issues: correct_type={correct_type}, no_mongo_ids={no_mongo_ids}, has_template_ids={has_template_ids}")
                    all_passed = False
            else:
                self.log_test(f"Get Templates - {exam_type}", False, f"Status: {status}, Data type: {type(data)}")
                all_passed = False
        
        return all_passed

    def test_get_all_templates(self) -> bool:
        """Test getting all templates without filters"""
        success, data, status = self.run_request("GET", "/api/templates")
        
        if success and isinstance(data, list) and len(data) > 0:
            # Verify no _id fields and template_id present
            no_mongo_ids = all("_id" not in template for template in data)
            has_template_ids = all("template_id" in template for template in data)
            
            # Check for expected exam types
            exam_types = set(template.get("exam_type") for template in data)
            expected_types = {"radiography", "tomography", "ophthalmo_human", "ultrasound_abd", "ecg", "echocardiogram", None}
            has_expected_types = expected_types.intersection(exam_types)
            
            if no_mongo_ids and has_template_ids and has_expected_types:
                # Sort exam types, handling None values
                sorted_types = sorted([t for t in exam_types if t is not None]) + ([None] if None in exam_types else [])
                return self.log_test("Get All Templates", True, 
                                   f"Found {len(data)} templates, exam types: {sorted_types}")
            else:
                return self.log_test("Get All Templates", False, 
                                   f"Issues: no_mongo_ids={no_mongo_ids}, has_template_ids={has_template_ids}, exam_types={list(exam_types)}")
        else:
            return self.log_test("Get All Templates", False, f"Status: {status}, Data: {type(data)}, Length: {len(data) if isinstance(data, list) else 'N/A'}")

    def test_template_response_format(self) -> bool:
        """Test that template responses have correct format"""
        success, data, status = self.run_request("GET", "/api/templates?limit=5")
        
        if success and isinstance(data, list) and len(data) > 0:
            template = data[0]
            
            # Required fields
            required_fields = ["template_id", "organ", "title", "text", "lang", "created_at", "updated_at"]
            has_required = all(field in template for field in required_fields)
            
            # Should not have _id
            no_mongo_id = "_id" not in template
            
            # Check data types
            correct_types = (
                isinstance(template.get("template_id"), str) and
                isinstance(template.get("organ"), str) and
                isinstance(template.get("title"), str) and
                isinstance(template.get("text"), str) and
                isinstance(template.get("lang"), str)
            )
            
            if has_required and no_mongo_id and correct_types:
                return self.log_test("Template Response Format", True, 
                                   f"All required fields present, no _id, correct types")
            else:
                return self.log_test("Template Response Format", False, 
                                   f"Issues: has_required={has_required}, no_mongo_id={no_mongo_id}, correct_types={correct_types}")
        else:
            return self.log_test("Template Response Format", False, f"Status: {status}, No templates found")

    def test_create_custom_template(self) -> Optional[str]:
        """Test creating a custom template"""
        template_data = {
            "organ": "Test Organ",
            "title": f"Test Template {datetime.now().strftime('%H%M%S')}",
            "text": "This is a test template for API testing",
            "lang": "pt",
            "exam_type": "ultrasound_abd"
        }
        
        success, data, status = self.run_request(
            "POST", "/api/templates",
            json=template_data,
            headers={"Content-Type": "application/json"}
        )
        
        if success and status == 200 and "template_id" in data:
            template_id = data["template_id"]
            
            # Verify no _id field
            has_mongo_id = "_id" in data
            if has_mongo_id:
                self.log_test("Create Template - No ObjectId", False, "Found _id field in response")
            else:
                self.log_test("Create Template - No ObjectId", True, "No _id field found")
            
            return self.log_test("Create Custom Template", True, f"ID: {template_id}") and template_id
        else:
            self.log_test("Create Custom Template", False, f"Status: {status}, Data: {data}")
            return None

    def test_get_template(self, template_id: str) -> bool:
        """Test get single template"""
        success, data, status = self.run_request("GET", f"/api/templates/{template_id}")
        
        if success and data.get("template_id") == template_id:
            # Verify no _id field
            has_mongo_id = "_id" in data
            if has_mongo_id:
                self.log_test("Get Template - No ObjectId", False, "Found _id field in response")
            else:
                self.log_test("Get Template - No ObjectId", True, "No _id field found")
            
            return self.log_test("Get Template", True, f"Retrieved template: {data.get('title')}")
        else:
            return self.log_test("Get Template", False, f"Status: {status}, Data: {data}")

    def test_delete_template(self, template_id: str) -> bool:
        """Test template deletion"""
        success, data, status = self.run_request("DELETE", f"/api/templates/{template_id}")
        
        if success and data.get("deleted") is True:
            return self.log_test("Delete Template", True, f"Deleted template: {template_id}")
        else:
            return self.log_test("Delete Template", False, f"Status: {status}, Data: {data}")

    def cleanup_resources(self):
        """Clean up created test resources"""
        print("\n🧹 Cleaning up test resources...")
        
        # Delete images first
        for image_id in self.created_resources["images"]:
            self.run_request("DELETE", f"/api/images/{image_id}")
        
        # Delete exams
        for exam_id in self.created_resources["exams"]:
            self.run_request("DELETE", f"/api/exams/{exam_id}")
        
        # Delete patients (cascade deletes exams and images)
        for patient_id in self.created_resources["patients"]:
            self.run_request("DELETE", f"/api/patients/{patient_id}")

    def run_all_tests(self) -> Dict[str, Any]:
        """Run comprehensive test suite"""
        print("🚀 Starting TVUSVET Backend API Tests\n")
        
        # Basic connectivity tests
        self.test_root_endpoint()
        self.test_health_check()
        
        # Template seeding and management tests (focus of this iteration)
        print("\n📝 Testing Template Management...")
        self.test_seed_templates_initial()
        self.test_seed_templates_idempotency()
        self.test_get_templates_by_exam_type()
        self.test_get_all_templates()
        self.test_template_response_format()
        
        # Custom template CRUD
        template_id = self.test_create_custom_template()
        if template_id:
            self.test_get_template(template_id)
            self.test_delete_template(template_id)
        
        # Patient CRUD tests
        print("\n👤 Testing Patient Management...")
        patient_id = self.test_create_patient()
        if not patient_id:
            return self.get_results("Failed to create patient - stopping tests")
        
        self.test_get_patient(patient_id)
        self.test_list_patients()
        self.test_update_patient(patient_id)
        
        # Exam CRUD tests
        print("\n🔬 Testing Exam Management...")
        exam_id = self.test_create_exam(patient_id)
        if not exam_id:
            return self.get_results("Failed to create exam - stopping tests")
        
        self.test_get_exam(exam_id)
        self.test_list_exams(patient_id)
        self.test_update_exam(exam_id)
        
        # Image management tests
        print("\n🖼️ Testing Image Management...")
        image_id = self.test_upload_image(patient_id, exam_id)
        if image_id:
            self.test_get_image_meta(image_id)
            self.test_get_image_content(image_id)
            self.test_exam_image_linking(exam_id)
            self.test_delete_image(image_id, exam_id)
        
        # Cleanup
        self.cleanup_resources()
        
        return self.get_results()

    def run_template_focused_tests(self) -> Dict[str, Any]:
        """Run template-focused tests as requested by main agent"""
        print("🚀 Starting TVUSVET Template-Focused Backend Tests\n")
        
        # Basic connectivity
        self.test_root_endpoint()
        self.test_health_check()
        
        # Template seeding and management tests
        print("\n📝 Testing Template Seeding and Management...")
        seed_result = self.test_seed_templates_initial()
        self.test_seed_templates_idempotency()
        self.test_get_templates_by_exam_type()
        self.test_get_all_templates()
        self.test_template_response_format()
        
        # Custom template CRUD to verify endpoints work
        template_id = self.test_create_custom_template()
        if template_id:
            self.test_get_template(template_id)
            self.test_delete_template(template_id)
        
        return self.get_results()

    def get_results(self, error_msg: str = None) -> Dict[str, Any]:
        """Get test results summary"""
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed ({success_rate:.1f}%)")
        
        if error_msg:
            print(f"❌ Critical Error: {error_msg}")
        
        return {
            "tests_run": self.tests_run,
            "tests_passed": self.tests_passed,
            "success_rate": success_rate,
            "error": error_msg
        }


def main():
    """Main test execution"""
    tester = TVUSVETAPITester()
    results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    if results["success_rate"] < 100:
        sys.exit(1)
    else:
        print("✅ All tests passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()