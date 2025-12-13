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

    await db.templates.create_index([("template_id", ASCENDING)], unique=True)
    await db.templates.create_index([("lang", ASCENDING)])
    await db.templates.create_index([("exam_type", ASCENDING)])
    await db.templates.create_index([("organ", ASCENDING)])
    # Unique natural key for idempotent seeding
    await db.templates.create_index(
        [("lang", ASCENDING), ("exam_type", ASCENDING), ("organ", ASCENDING), ("title", ASCENDING)],
        unique=True,
    )



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
# Templates (Textos padrão)
# -----------------------------

@app.post("/api/templates", response_model=Template)
async def create_template(payload: TemplateCreate = Body(...)):
    now = utc_now()
    tpl = {
        "template_id": new_uuid("tpl"),
        **payload.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    try:
        await db().templates.insert_one(tpl)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Duplicate template_id")
    return Template(**clean(tpl))


@app.get("/api/templates", response_model=List[Template])
async def list_templates(
    lang: Optional[Literal["pt", "en"]] = Query(default=None),
    exam_type: Optional[str] = Query(default=None),
    organ: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None, description="Search in title/text"),
    limit: int = Query(default=200, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    selector: Dict[str, Any] = {}
    if lang:
        selector["lang"] = lang
    if exam_type:
        selector["exam_type"] = exam_type
    if organ:
        selector["organ"] = organ
    if q:
        selector["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"text": {"$regex": q, "$options": "i"}},
        ]

    cursor = (
        db()
        .templates.find(selector, {"_id": 0})
        .sort([("organ", ASCENDING), ("title", ASCENDING)])
        .skip(offset)
        .limit(limit)
    )
    return [Template(**d) async for d in cursor]


@app.get("/api/templates/{template_id}", response_model=Template)
async def get_template(template_id: str):
    doc = await db().templates.find_one({"template_id": template_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Template not found")
    return Template(**doc)


@app.patch("/api/templates/{template_id}", response_model=Template)
async def update_template(template_id: str, payload: TemplateUpdate = Body(...)):
    patch = {k: v for k, v in payload.model_dump().items() if v is not None}
    patch["updated_at"] = utc_now()

    result = await db().templates.find_one_and_update(
        {"template_id": template_id},
        {"$set": patch},
        projection={"_id": 0},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Template not found")

    return Template(**result)


@app.delete("/api/templates/{template_id}")
async def delete_template(template_id: str):
    await db().templates.delete_one({"template_id": template_id})
    return {"deleted": True, "template_id": template_id}


@app.post("/api/templates/seed")
async def seed_default_templates():
    """Cria um conjunto de textos padrão para testes fluídos (idempotente)."""
    now = utc_now()

    defaults: List[Dict[str, Any]] = []

    # Ultrasound Abdominal (vet) – textos base por órgão
    usg_organs = [
        "Fígado",
        "Vesícula Biliar",
        "Baço",
        "Rim Direito",
        "Rim Esquerdo",
        "Vesícula Urinária",
        "Estômago",
        "Duodeno",
        "Jejuno",
        "Íleo",
        "Cólon",
        "Pâncreas",
        "Adrenais",
        "Linfonodos",
        "Próstata",
        "Testículo Direito",
        "Testículo Esquerdo",
        "Útero",
        "Ovário Direito",
        "Ovário Esquerdo",
    ]

    base_normal = {
        "Fígado": "Fígado com dimensões preservadas, contornos regulares e ecotextura homogênea. Vascularização e vasos intra-hepáticos preservados.",
        "Vesícula Biliar": "Vesícula biliar com paredes finas e regulares. Conteúdo anecogênico, sem sedimentos ou imagens compatíveis com colelitíase.",
        "Baço": "Baço com dimensões preservadas, contornos regulares e ecotextura homogênea característica.",
        "Rim Direito": "Rim direito com dimensões preservadas, contornos regulares. Relação córtico-medular preservada, sem sinais de pieloectasia.",
        "Rim Esquerdo": "Rim esquerdo com dimensões preservadas, contornos regulares. Relação córtico-medular preservada, sem sinais de pieloectasia.",
        "Vesícula Urinária": "Vesícula urinária moderadamente repleta, paredes finas e regulares. Conteúdo predominantemente anecogênico, sem sedimentos significativos.",
        "Estômago": "Estômago com conteúdo compatível com ingesta. Parede com estratificação preservada, sem espessamentos focais.",
        "Duodeno": "Duodeno com parede de espessura e estratificação preservadas. Motilidade presente.",
        "Jejuno": "Jejuno com parede de espessura e estratificação preservadas. Motilidade presente.",
        "Íleo": "Íleo com parede de espessura e estratificação preservadas. Motilidade presente.",
        "Cólon": "Cólon com conteúdo fecal/gasoso. Parede com estratificação preservada.",
        "Pâncreas": "Pâncreas visualizado parcialmente, com contornos regulares e ecogenicidade preservada.",
        "Adrenais": "Adrenais com dimensões e morfologia preservadas, sem formações nodulares evidentes.",
        "Linfonodos": "Linfonodos abdominais sem aumento significativo, com morfologia preservada.",
        "Próstata": "Próstata com dimensões e ecotextura preservadas, sem alterações focais.",
        "Testículo Direito": "Testículo direito com dimensões e ecotextura preservadas, sem lesões focais.",
        "Testículo Esquerdo": "Testículo esquerdo com dimensões e ecotextura preservadas, sem lesões focais.",
        "Útero": "Útero sem alterações significativas à ultrassonografia, sem conteúdo luminal evidente.",
        "Ovário Direito": "Ovário direito com dimensões preservadas, com folículos de aspecto fisiológico.",
        "Ovário Esquerdo": "Ovário esquerdo com dimensões preservadas, com folículos de aspecto fisiológico.",
    }

    for organ_name in usg_organs:
        defaults.append(
            {
                "template_id": new_uuid("tpl"),
                "organ": organ_name,
                "title": "Normal",
                "text": base_normal.get(organ_name, "Estrutura com aspecto ultrassonográfico preservado, sem alterações significativas."),
                "lang": "pt",
                "exam_type": "ultrasound_abd",
                "created_at": now,
                "updated_at": now,
            }
        )

    # Seções comuns (Conclusão / Impressões Diagnósticas)
    defaults.extend(
        [
            {
                "template_id": new_uuid("tpl"),
                "organ": "Impressões Diagnósticas",
                "title": "Sem alterações significativas",
                "text": "Não foram observadas alterações ultrassonográficas significativas no exame realizado.",
                "lang": "pt",
                "exam_type": "ultrasound_abd",
                "created_at": now,
                "updated_at": now,
            },
            {
                "template_id": new_uuid("tpl"),
                "organ": "Conclusão",
                "title": "Sugestão",
                "text": "Correlacionar os achados com histórico clínico, exame físico e exames laboratoriais. Reavaliação conforme evolução clínica.",
                "lang": "pt",
                "exam_type": None,
                "created_at": now,
                "updated_at": now,
            },
        ]
    )

    # ECG / Ecocardiograma – seções principais
    defaults.extend(
        [
            {
                "template_id": new_uuid("tpl"),
                "organ": "Ritmo e Frequência",
                "title": "Ritmo sinusal",
                "text": "Ritmo sinusal com frequência cardíaca dentro do esperado para a espécie/porte, sem arritmias evidentes no traçado analisado.",
                "lang": "pt",
                "exam_type": "ecg",
                "created_at": now,
                "updated_at": now,
            },
            {
                "template_id": new_uuid("tpl"),
                "organ": "Conclusão",
                "title": "Sem alterações",
                "text": "Eletrocardiograma sem alterações significativas no momento da avaliação.",
                "lang": "pt",
                "exam_type": "ecg",
                "created_at": now,
                "updated_at": now,
            },
            {
                "template_id": new_uuid("tpl"),
                "organ": "Impressões Diagnósticas",
                "title": "Sem evidências de cardiopatia",
                "text": "Não há evidências eletrocardiográficas sugestivas de cardiopatia no momento, considerando as limitações do método.",
                "lang": "pt",
                "exam_type": "ecg",
                "created_at": now,
                "updated_at": now,
            },
            {
                "template_id": new_uuid("tpl"),
                "organ": "Conclusão",
                "title": "Função preservada",
                "text": "Ecocardiograma com parâmetros dentro dos limites de normalidade, sem alterações estruturais significativas.",
                "lang": "pt",
                "exam_type": "echocardiogram",
                "created_at": now,
                "updated_at": now,
            },
            {
                "template_id": new_uuid("tpl"),
                "organ": "Impressões Diagnósticas",
                "title": "Sem alterações relevantes",
                "text": "Não foram observadas alterações ecocardiográficas relevantes no exame realizado.",
                "lang": "pt",
                "exam_type": "echocardiogram",
                "created_at": now,
                "updated_at": now,
            },
        ]
    )

    # Inserção idempotente: usa upsert por chave natural (lang + exam_type + organ + title)
    inserted = 0
    updated = 0
    for tpl in defaults:
        key = {
            "lang": tpl["lang"],
            "exam_type": tpl.get("exam_type"),
            "organ": tpl["organ"],
            "title": tpl["title"],
        }
        res = await db().templates.update_one(
            key,
            {
                "$setOnInsert": {
                    "template_id": tpl["template_id"],
                    "created_at": tpl["created_at"],
                },
                "$set": {
                    "text": tpl["text"],
                    "updated_at": now,
                },
            },
            upsert=True,
        )
        if res.upserted_id is not None:
            inserted += 1
        elif res.modified_count:
            updated += 1

    total = await db().templates.count_documents({})
    return {"seeded": True, "inserted": inserted, "updated": updated, "total_templates": total}

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
