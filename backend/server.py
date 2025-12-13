import hashlib
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

from dotenv import load_dotenv
from fastapi import (
    Body,
    FastAPI,
    File,
    HTTPException,
    Query,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from pymongo import ASCENDING
from pymongo.errors import DuplicateKeyError

# Async Mongo
from motor.motor_asyncio import AsyncIOMotorClient
from bson.binary import Binary


load_dotenv()  # loads /app/backend/.env if present


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def new_uuid(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex}"


class Settings(BaseModel):
    mongo_url: str = Field(default_factory=lambda: os.environ.get("MONGO_URL") or "")
    app_url: str = Field(default_factory=lambda: os.environ.get("APP_URL") or "")


settings = Settings()


def build_cors_origins(app_url: str) -> List[str]:
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    if app_url:
        origins.append(app_url)
    # de-dup
    return sorted(list({o for o in origins if o}))


app = FastAPI(title="TVUSVET Backend", version="0.2.0")

cors_origins = build_cors_origins(settings.app_url)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins else ["*"],
    allow_credentials=True if cors_origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Pydantic Models (API Contract)
# -----------------------------

class ApiError(BaseModel):
    detail: str


class PatientBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    species: Optional[str] = Field(default=None, max_length=80)
    owner_name: Optional[str] = Field(default=None, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=4000)


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    species: Optional[str] = Field(default=None, max_length=80)
    owner_name: Optional[str] = Field(default=None, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=4000)


class Patient(PatientBase):
    patient_id: str
    created_at: datetime
    updated_at: datetime


class ExamBase(BaseModel):
    patient_id: str
    exam_type: str = Field(default="ultrasound_abd", max_length=80)
    exam_date: Optional[datetime] = None
    status: Literal["draft", "final"] = "draft"
    organs_data: List[Dict[str, Any]] = Field(default_factory=list)
    notes: Optional[str] = Field(default=None, max_length=10000)


class ExamCreate(ExamBase):
    pass


class ExamUpdate(BaseModel):
    exam_type: Optional[str] = Field(default=None, max_length=80)
    exam_date: Optional[datetime] = None
    status: Optional[Literal["draft", "final"]] = None
    organs_data: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = Field(default=None, max_length=10000)


class ImageRef(BaseModel):
    image_id: str
    filename: str
    mime_type: str
    size_bytes: int
    created_at: datetime
    tags: List[str] = Field(default_factory=list)


class Exam(ExamBase):
    exam_id: str
    date: datetime
    images: List[ImageRef] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class ImageMeta(BaseModel):
    image_id: str
    filename: str
    mime_type: str
    size_bytes: int
    sha256: str
    created_at: datetime
    updated_at: datetime
    tags: List[str] = Field(default_factory=list)
    patient_id: Optional[str] = None
    exam_id: Optional[str] = None
    kind: Literal["png", "jpg", "jpeg", "dicom", "other"] = "other"
    dicom_meta: Optional[Dict[str, Any]] = None



class TemplateBase(BaseModel):
    organ: str = Field(default="", max_length=120, description="Estrutura/órgão/segmento do exame")
    title: str = Field(min_length=1, max_length=120, description="Nome curto do modelo (ex: Normal)")
    text: str = Field(min_length=1, max_length=20000)
    lang: Literal["pt", "en"] = "pt"
    exam_type: Optional[str] = Field(default=None, max_length=80, description="Opcional: tipo de exame (ex: ultrasound_abd)")


class TemplateCreate(TemplateBase):
    pass


class TemplateUpdate(BaseModel):
    organ: Optional[str] = Field(default=None, max_length=120)
    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    text: Optional[str] = Field(default=None, min_length=1, max_length=20000)
    lang: Optional[Literal["pt", "en"]] = None
    exam_type: Optional[str] = Field(default=None, max_length=80)


class Template(TemplateBase):
    template_id: str
    created_at: datetime
    updated_at: datetime



# -----------------------------
# Mongo helpers
# -----------------------------

def _mongo_db(client: AsyncIOMotorClient):
    # If db is included in URL, motor sets default_database.
    # IMPORTANT: Database objects do not support truthiness checks, so compare with None.
    default_db = client.get_default_database()
    return default_db if default_db is not None else client["tvusvet"]


async def _ensure_indexes(db):
    await db.patients.create_index([("patient_id", ASCENDING)], unique=True)
    await db.exams.create_index([("exam_id", ASCENDING)], unique=True)
    await db.exams.create_index([("patient_id", ASCENDING)])

    await db.images.create_index([("image_id", ASCENDING)], unique=True)
    await db.images.create_index([("exam_id", ASCENDING)])
    await db.images.create_index([("patient_id", ASCENDING)])
    await db.images.create_index([("sha256", ASCENDING)])


@app.on_event("startup")
async def on_startup():
    if not settings.mongo_url:
        raise RuntimeError(
            "MONGO_URL is not set. Create /app/backend/.env with MONGO_URL or set env var."
        )

    app.state.mongo_client = AsyncIOMotorClient(settings.mongo_url)
    app.state.db = _mongo_db(app.state.mongo_client)

    # Verify connection
    await app.state.db.command("ping")
    await _ensure_indexes(app.state.db)


@app.on_event("shutdown")
async def on_shutdown():
    client = getattr(app.state, "mongo_client", None)
    if client is not None:
        client.close()


def db():
    return app.state.db


def clean(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    doc.pop("_id", None)
    return doc


# -----------------------------
# Health
# -----------------------------

@app.get("/")
def read_root():
    return {"status": "online", "service": "TVUSVET Backend"}


@app.get("/api/health")
async def health_check():
    try:
        await db().command("ping")
        return {"status": "healthy", "db": "ok"}
    except Exception as e:
        return {"status": "degraded", "db": "error", "detail": str(e)}


# -----------------------------
# Patients
# -----------------------------

@app.post("/api/patients", response_model=Patient, responses={400: {"model": ApiError}})
async def create_patient(payload: PatientCreate = Body(...)):
    now = utc_now()
    patient = {
        "patient_id": new_uuid("pat"),
        **payload.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    try:
        await db().patients.insert_one(patient)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Duplicate patient_id")
    return Patient(**clean(patient))


@app.get("/api/patients", response_model=List[Patient])
async def list_patients(
    q: Optional[str] = Query(default=None, description="Search by name/owner"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    selector: Dict[str, Any] = {}
    if q:
        selector = {
            "$or": [
                {"name": {"$regex": q, "$options": "i"}},
                {"owner_name": {"$regex": q, "$options": "i"}},
            ]
        }

    cursor = (
        db()
        .patients.find(selector, {"_id": 0})
        .sort("name", ASCENDING)
        .skip(offset)
        .limit(limit)
    )
    docs = [Patient(**d) async for d in cursor]
    return docs


@app.get("/api/patients/{patient_id}", response_model=Patient, responses={404: {"model": ApiError}})
async def get_patient(patient_id: str):
    doc = await db().patients.find_one({"patient_id": patient_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Patient not found")
    return Patient(**doc)


@app.patch("/api/patients/{patient_id}", response_model=Patient)
async def update_patient(patient_id: str, payload: PatientUpdate = Body(...)):
    patch = {k: v for k, v in payload.model_dump().items() if v is not None}
    patch["updated_at"] = utc_now()

    result = await db().patients.find_one_and_update(
        {"patient_id": patient_id},
        {"$set": patch},
        projection={"_id": 0},
        return_document=True,
    )

    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")

    return Patient(**result)


@app.delete("/api/patients/{patient_id}")
async def delete_patient(patient_id: str):
    # Cascade delete: exams + images
    exams = db().exams.find({"patient_id": patient_id}, {"_id": 0, "exam_id": 1})
    exam_ids = [e["exam_id"] async for e in exams]

    await db().images.delete_many({"patient_id": patient_id})
    await db().exams.delete_many({"patient_id": patient_id})
    await db().patients.delete_one({"patient_id": patient_id})

    return {"deleted": True, "patient_id": patient_id, "exams_deleted": len(exam_ids)}


# -----------------------------
# Exams
# -----------------------------

@app.post("/api/exams", response_model=Exam)
async def create_exam(payload: ExamCreate = Body(...)):
    # Ensure patient exists
    patient = await db().patients.find_one({"patient_id": payload.patient_id}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=400, detail="Invalid patient_id")

    now = utc_now()
    exam = {
        "exam_id": new_uuid("exam"),
        **payload.model_dump(),
        "date": payload.exam_date or now,
        "images": [],
        "created_at": now,
        "updated_at": now,
    }

    try:
        await db().exams.insert_one(exam)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Duplicate exam_id")

    return Exam(**clean(exam))


@app.get("/api/exams", response_model=List[Exam])
async def list_exams(
    patient_id: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    selector: Dict[str, Any] = {}
    if patient_id:
        selector["patient_id"] = patient_id

    cursor = (
        db()
        .exams.find(selector, {"_id": 0})
        .sort("date", -1)
        .skip(offset)
        .limit(limit)
    )
    docs = [Exam(**d) async for d in cursor]
    return docs


@app.get("/api/exams/{exam_id}", response_model=Exam)
async def get_exam(exam_id: str):
    doc = await db().exams.find_one({"exam_id": exam_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Exam not found")
    return Exam(**doc)


@app.patch("/api/exams/{exam_id}", response_model=Exam)
async def update_exam(exam_id: str, payload: ExamUpdate = Body(...)):
    patch = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "exam_date" in patch:
        patch["date"] = patch.pop("exam_date")
    patch["updated_at"] = utc_now()

    result = await db().exams.find_one_and_update(
        {"exam_id": exam_id},
        {"$set": patch},
        projection={"_id": 0},
        return_document=True,
    )

    if not result:
        raise HTTPException(status_code=404, detail="Exam not found")

    return Exam(**result)


@app.delete("/api/exams/{exam_id}")
async def delete_exam(exam_id: str):
    await db().images.delete_many({"exam_id": exam_id})
    await db().exams.delete_one({"exam_id": exam_id})
    return {"deleted": True, "exam_id": exam_id}


# -----------------------------
# Images (PNG/JPG/DICOM)
# -----------------------------

def _detect_kind(filename: str, mime: str) -> str:
    low = (filename or "").lower()
    if "dicom" in (mime or "").lower() or low.endswith(".dcm"):
        return "dicom"
    if low.endswith(".png") or mime == "image/png":
        return "png"
    if low.endswith(".jpg") or low.endswith(".jpeg") or mime in ("image/jpg", "image/jpeg"):
        return "jpg" if low.endswith(".jpg") else "jpeg"
    return "other"


@app.post("/api/images", response_model=ImageMeta)
async def upload_image(
    file: UploadFile = File(...),
    patient_id: Optional[str] = Query(default=None),
    exam_id: Optional[str] = Query(default=None),
    tags: Optional[str] = Query(default=None, description="Comma-separated tags"),
):
    # Validate relation
    if exam_id:
        exam = await db().exams.find_one({"exam_id": exam_id}, {"_id": 0})
        if not exam:
            raise HTTPException(status_code=400, detail="Invalid exam_id")
        if patient_id and exam.get("patient_id") != patient_id:
            raise HTTPException(status_code=400, detail="patient_id does not match exam.patient_id")
        patient_id = exam.get("patient_id")

    if patient_id:
        patient = await db().patients.find_one({"patient_id": patient_id}, {"_id": 0})
        if not patient:
            raise HTTPException(status_code=400, detail="Invalid patient_id")

    # Read bytes
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    # Basic size guard (50MB)
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    sha = hashlib.sha256(content).hexdigest()
    now = utc_now()

    mime_type = file.content_type or "application/octet-stream"
    kind = _detect_kind(file.filename or "", mime_type)

    tag_list: List[str] = []
    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    dicom_meta: Optional[Dict[str, Any]] = None
    if kind == "dicom":
        try:
            import pydicom  # lazy import

            ds = pydicom.dcmread(content, force=True)
            # Keep only safe/compact tags
            dicom_meta = {
                "PatientName": str(getattr(ds, "PatientName", ""))[:200],
                "StudyDate": str(getattr(ds, "StudyDate", ""))[:32],
                "Modality": str(getattr(ds, "Modality", ""))[:32],
                "SOPClassUID": str(getattr(ds, "SOPClassUID", ""))[:80],
            }
        except Exception:
            dicom_meta = {"parse_error": True}

    image_id = new_uuid("img")
    image_doc = {
        "image_id": image_id,
        "filename": file.filename or image_id,
        "mime_type": mime_type,
        "size_bytes": len(content),
        "sha256": sha,
        "created_at": now,
        "updated_at": now,
        "tags": tag_list,
        "patient_id": patient_id,
        "exam_id": exam_id,
        "kind": kind,
        "dicom_meta": dicom_meta,
        "content": Binary(content),
    }

    await db().images.insert_one(image_doc)

    # If exam provided, attach reference
    if exam_id:
        ref = {
            "image_id": image_id,
            "filename": image_doc["filename"],
            "mime_type": image_doc["mime_type"],
            "size_bytes": image_doc["size_bytes"],
            "created_at": now,
            "tags": tag_list,
        }
        await db().exams.update_one(
            {"exam_id": exam_id},
            {"$push": {"images": ref}, "$set": {"updated_at": now}},
        )

    return ImageMeta(**clean({k: v for k, v in image_doc.items() if k != "content"}))


@app.get("/api/images/{image_id}", response_model=ImageMeta)
async def get_image_meta(image_id: str):
    doc = await db().images.find_one({"image_id": image_id}, {"_id": 0, "content": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Image not found")
    return ImageMeta(**doc)


@app.get("/api/images/{image_id}/content")
async def get_image_content(image_id: str):
    doc = await db().images.find_one({"image_id": image_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Image not found")

    content: bytes = bytes(doc.get("content") or b"")
    mime_type = doc.get("mime_type") or "application/octet-stream"

    return Response(
        content=content,
        media_type=mime_type,
        headers={"Cache-Control": "private, max-age=3600"},
    )


@app.delete("/api/images/{image_id}")
async def delete_image(image_id: str):
    doc = await db().images.find_one({"image_id": image_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Image not found")

    exam_id = doc.get("exam_id")
    await db().images.delete_one({"image_id": image_id})

    # Detach from exam images list
    if exam_id:
        await db().exams.update_one(
            {"exam_id": exam_id},
            {"$pull": {"images": {"image_id": image_id}}, "$set": {"updated_at": utc_now()}},
        )

    return {"deleted": True, "image_id": image_id}
