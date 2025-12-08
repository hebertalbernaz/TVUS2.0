/**
 * TVUSVET V2.0 - RxDB Schemas (Final V7 - With Professional Ophthalmo)
 */

// --- SETTINGS ---
export const SettingsSchema = {
  title: 'settings schema',
  version: 2,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    clinic_name: { type: 'string' },
    veterinarian_name: { type: 'string' },
    crmv: { type: 'string' },
    active_profile_id: { type: 'string' },
    active_profile_name: { type: 'string' },
    clinic_address: { type: 'string' },
    professional_email: { type: 'string' },
    professional_phone: { type: 'string' },
    letterhead_path: { type: 'string' },
    signature_path: { type: 'string' },
    letterhead_margins_mm: { type: 'object' },
    practice_type: { type: 'string', enum: ['vet', 'human'], default: 'vet' },
    active_modules: { type: 'array', items: { type: 'string' }, default: ['core'] },
    theme: { type: 'string', default: 'light' }
  },
  required: ['id']
};

// --- PATIENTS ---
export const PatientSchema = {
  title: 'patient schema',
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    species: { type: 'string' }, 
    breed: { type: 'string' },
    size: { type: 'string' },
    owner_name: { type: 'string' },
    ownerPhone: { type: 'string' },
    document: { type: 'string' }, 
    birth_date: { type: 'string', format: 'date' },
    birth_year: { type: 'string' },
    weight: { type: 'number' },
    sex: { type: 'string', enum: ['M', 'F', 'male', 'female'] },
    is_neutered: { type: 'boolean' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    practice: { type: 'string' }
  },
  required: ['id', 'name']
};

// --- EXAMS (FINAL V3) ---
export const ExamSchema = {
  title: 'exam schema',
  version: 3,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    patient_id: { type: 'string' },
    exam_type: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
    exam_weight: { type: 'number' },
    referring_vet: { type: 'string' },
    
    organs_data: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                organ_name: { type: 'string' },
                report_text: { type: 'string' },
                measurements: { type: 'object', additionalProperties: true },
                visual_data: { 
                    oneOf: [
                        { type: 'string' },
                        { type: 'object', additionalProperties: true },
                        { type: 'array' },
                        { type: 'null' }
                    ]
                }
            }
        }
    },

    report_content: { type: 'string' },
    conclusion: { type: 'string' },
    
    images: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                filename: { type: 'string' },
                data: { type: 'string' },
                originalData: { type: 'string' },
                mimeType: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } }
            }
        }
    },
    
    status: { type: 'string', enum: ['draft', 'finalized'] }
  },
  required: ['id', 'patient_id']
};

// --- TEMPLATES ---
export const TemplateSchema = {
  title: 'template schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    title: { type: 'string' },
    text: { type: 'string' },
    organ: { type: 'string' },
    lang: { type: 'string', default: 'pt' }
  },
  required: ['id', 'title', 'text']
};

// --- REFERENCE VALUES ---
export const ReferenceValueSchema = {
  title: 'reference value schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    species: { type: 'string' },
    organ: { type: 'string' },
    parameter: { type: 'string' },
    min_value: { type: 'number' },
    max_value: { type: 'number' },
    unit: { type: 'string' },
    size: { type: 'string' }
  },
  required: ['id', 'organ']
};

// --- PROFILES ---
export const ProfileSchema = {
  title: 'profile schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    clinic_name: { type: 'string' },
    clinic_address: { type: 'string' },
    veterinarian_name: { type: 'string' },
    crmv: { type: 'string' },
    professional_email: { type: 'string' },
    professional_phone: { type: 'string' },
    letterhead_path: { type: 'string' },
    signature_path: { type: 'string' },
    letterhead_margins_mm: { type: 'object' }
  },
  required: ['id', 'name']
};

// --- DRUGS ---
export const DrugSchema = {
  title: 'drug schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    type: { type: 'string', enum: ['vet', 'human'] },
    default_dosage: { type: 'string' }
  },
  required: ['id', 'name']
};

// --- PRESCRIPTIONS ---
export const PrescriptionSchema = {
  title: 'prescription schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    patient_id: { type: 'string' },
    doctor_name: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
    items: { type: 'array', items: { type: 'object' } },
    notes: { type: 'string' }
  },
  required: ['id', 'patient_id']
};

// Helper schema for eye data (used in OphthalmoSchema)
const EyeDataProperties = {
  // Visual Acuity
  visual_acuity: { type: 'string' },
  visual_acuity_corrected: { type: 'string' },
  
  // Intraocular Pressure
  iop: { type: 'number' },
  iop_method: { type: 'string' },
  
  // Biomicroscopy (Anterior Segment)
  biomicroscopy: {
    type: 'object',
    properties: {
      lids: { type: 'string' },
      conjunctiva: { type: 'string' },
      cornea: { type: 'string' },
      anterior_chamber: { type: 'string' },
      iris: { type: 'string' },
      pupil: { type: 'string' },
      lens: { type: 'string' }
    }
  },
  
  // Fundoscopy (Posterior Segment)
  fundoscopy: {
    type: 'object',
    properties: {
      vitreous: { type: 'string' },
      optic_disc: { type: 'string' },
      cup_disc_ratio: { type: 'string' },
      macula: { type: 'string' },
      retina: { type: 'string' },
      vessels: { type: 'string' },
      choroid: { type: 'string' }
    }
  },
  
  // Visual Data (Base64 drawings)
  eye_fundus_drawing: { type: 'string' },
  campimetry_grid: { 
    oneOf: [
      { type: 'array', items: { type: 'number' } },
      { type: 'string' },
      { type: 'null' }
    ]
  },
  
  // Diagnosis and Conduct per eye
  diagnosis: { type: 'string' },
  conduct: { type: 'string' }
};

// --- OPHTHALMO (Professional Version V1) ---
export const OphthalmoSchema = {
  title: 'ophthalmo exam schema',
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    patient_id: { type: 'string' },
    patient_name: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
    doctor_name: { type: 'string' },
    requesting_doctor: { type: 'string' },
    
    // Clinical History
    chief_complaint: { type: 'string' },
    clinical_history: { type: 'string' },
    current_medications: { type: 'string' },
    allergies: { type: 'string' },
    
    // Right Eye (OD - Oculus Dexter)
    right_eye: {
      type: 'object',
      properties: EyeDataProperties
    },
    
    // Left Eye (OS - Oculus Sinister)
    left_eye: {
      type: 'object',
      properties: EyeDataProperties
    },
    
    // General Diagnosis & Plan
    general_diagnosis: { type: 'string' },
    treatment_plan: { type: 'string' },
    follow_up: { type: 'string' },
    notes: { type: 'string' },
    
    // Status
    status: { type: 'string', enum: ['draft', 'finalized'], default: 'draft' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    finalized_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'patient_id']
};

// --- FINANCIAL ---
export const FinancialSchema = {
  title: 'financial schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    type: { type: 'string', enum: ['income', 'expense'] },
    category: { type: 'string' },
    amount: { type: 'number' },
    date: { type: 'string', format: 'date-time' },
    description: { type: 'string' },
    patient_id: { type: 'string' }
  },
  required: ['id', 'type', 'amount', 'date']
};

// --- LAB EXAMS ---
export const LabExamSchema = {
  title: 'lab exam schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    patient_id: { type: 'string' },
    patient_name: { type: 'string' },
    patient_species: { type: 'string' },
    owner_name: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
    veterinarian_name: { type: 'string' },
    requesting_vet: { type: 'string' },
    exam_type: { type: 'string' },
    exam_type_label: { type: 'string' },
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          parameter: { type: 'string' },
          value: { type: 'string' },
          unit: { type: 'string' },
          ref_min: { type: 'number' },
          ref_max: { type: 'number' },
          flag: { type: 'string', enum: ['low', 'normal', 'high', 'critical_low', 'critical_high', ''] },
          category: { type: 'string' }
        }
      }
    },
    conclusion: { type: 'string' },
    notes: { type: 'string' },
    clinical_history: { type: 'string' },
    status: { type: 'string', enum: ['draft', 'pending_review', 'finalized'], default: 'draft' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    finalized_at: { type: 'string', format: 'date-time' },
    finalized_by: { type: 'string' }
  },
  required: ['id', 'patient_id', 'exam_type', 'date']
};
