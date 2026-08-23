"""
Trayon AI-Engine: FastAPI service for audit report analysis and IPFS integration.
Provides endpoints for document ingestion, anomaly detection, and IPFS storage.
"""

import os
from contextlib import asynccontextmanager
from typing import Optional
import logging
from datetime import datetime

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import ipfshttpclient
from web3 import Web3
import redis
import asyncpg

# Configuration
IPFS_API_URL = os.getenv("IPFS_API_URL", "/ip4/127.0.0.1/tcp/5001")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DB_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/trayon")
AUDIT_SMART_CONTRACT = os.getenv("AUDIT_CONTRACT_ADDRESS", "")
PRIVATE_KEY = os.getenv("VALIDATOR_PRIVATE_KEY", "")

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
)
logger = logging.getLogger(__name__)

# Redis & IPFS clients (lazy-initialized)
redis_client: Optional[redis.Redis] = None
ipfs_client: Optional[ipfshttpclient.Client] = None
db_pool: Optional[asyncpg.Pool] = None


class AuditReport(BaseModel):
    """Audit report data model."""
    report_id: str = Field(..., description="Unique report identifier")
    ipfs_hash: str = Field(..., description="IPFS CID of the report")
    data_hash: str = Field(..., description="Keccak256 hash of raw data")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="AI confidence (0-1)")
    anomalies: list[dict] = Field(default_factory=list, description="Detected anomalies")
    validator_signatures: list[str] = Field(default_factory=list, description="Validator signatures")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class IngestRequest(BaseModel):
    """Document ingestion request model."""
    source_type: str = Field(..., description="Type: 'pdf', 'api', 'excel'")
    source_url: Optional[str] = Field(default=None, description="URL for API/remote sources")
    data_hash: str = Field(..., description="Keccak256 hash of source data")
    priority: int = Field(default=1, description="Processing priority (1-10)")


class PredictionResponse(BaseModel):
    """Prediction response model."""
    prediction_id: str
    report_id: Optional[str] = None
    anomaly_detected: bool
    confidence: float
    anomalies: list[dict]
    processing_time_ms: float


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup/shutdown events.
    Initializes IPFS, Redis, and database connections.
    """
    global redis_client, ipfs_client, db_pool
    
    # Startup
    try:
        # Connect to IPFS
        ipfs_client = ipfshttpclient.connect(IPFS_API_URL)
        logger.info("✓ Connected to IPFS")
        
        # Connect to Redis
        redis_client = redis.from_url(REDIS_URL)
        redis_client.ping()
        logger.info("✓ Connected to Redis")
        
        # Initialize DB pool
        db_pool = await asyncpg.create_pool(
            DB_URL,
            min_size=10,
            max_size=20,
            command_timeout=60,
        )
        logger.info("✓ Connected to PostgreSQL")
        
    except Exception as e:
        logger.error(f"✗ Startup error: {str(e)}")
        raise
    
    yield  # App runs here
    
    # Shutdown
    if ipfs_client:
        ipfs_client.close()
        logger.info("✓ Closed IPFS connection")
    if redis_client:
        redis_client.close()
        logger.info("✓ Closed Redis connection")
    if db_pool:
        await db_pool.close()
        logger.info("✓ Closed database pool")


# Initialize FastAPI app
app = FastAPI(
    title="Trayon AI-Engine",
    version="1.0.0",
    description="AI-powered audit and oracle service for Trayon L2",
    lifespan=lifespan,
)


# ─────────────────────────────────────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    """Check service health and dependencies."""
    health = {
        "status": "healthy",
        "service": "trayon-ai-engine",
        "timestamp": datetime.utcnow().isoformat(),
        "dependencies": {},
    }
    
    try:
        if redis_client:
            redis_client.ping()
            health["dependencies"]["redis"] = "✓"
        else:
            health["dependencies"]["redis"] = "⚠ not initialized"
    except Exception as e:
        health["dependencies"]["redis"] = f"✗ {str(e)}"
    
    try:
        if ipfs_client:
            ipfs_client.id()
            health["dependencies"]["ipfs"] = "✓"
        else:
            health["dependencies"]["ipfs"] = "⚠ not initialized"
    except Exception as e:
        health["dependencies"]["ipfs"] = f"✗ {str(e)}"
    
    try:
        if db_pool:
            async with db_pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            health["dependencies"]["postgresql"] = "✓"
        else:
            health["dependencies"]["postgresql"] = "⚠ not initialized"
    except Exception as e:
        health["dependencies"]["postgresql"] = f"✗ {str(e)}"
    
    return health


# ─────────────────────────────────────────────────────────────────────────────
# AUDIT INGESTION API
# ─────────────────────────────────────────────────────────────────────────────

def _queue_ingestion(source_type: str, priority: int) -> str:
    """Shared helper: generate an ingestion id and push it onto the audit queue."""
    ingestion_id = f"ingest_{Web3.keccak(text=str(datetime.utcnow())).hex()[:16]}"

    if redis_client:
        redis_client.lpush(
            "audit_queue",
            f"{{\"ingestion_id\": \"{ingestion_id}\", \"type\": \"{source_type}\"}}"
        )

    logger.info(f"Queued ingestion task: {ingestion_id}")
    return ingestion_id


@app.post("/api/v1/audit/ingest", tags=["Audit"], response_model=dict)
async def ingest_document(
    request: IngestRequest,
    background_tasks: BackgroundTasks = BackgroundTasks(),
):
    """
    Ingest audit documents from a remote source (no file upload).

    Supports:
    - API endpoints (requests)
    - Government registry APIs

    For PDF/Excel file uploads, use POST /api/v1/audit/ingest/file instead.

    Returns: task_id and queueing status
    """
    try:
        ingestion_id = _queue_ingestion(request.source_type, request.priority)

        return {
            "ingestion_id": ingestion_id,
            "status": "queued",
            "priority": request.priority,
            "source_type": request.source_type,
        }
    except Exception as e:
        logger.error(f"Ingestion error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/audit/ingest/file", tags=["Audit"], response_model=dict)
async def ingest_document_file(
    file: UploadFile = File(..., description="PDF or Excel audit document"),
    data_hash: str = Form(..., description="Keccak256 hash of source data"),
    priority: int = Form(default=1, ge=1, le=10, description="Processing priority (1-10)"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
):
    """
    Ingest an audit document file (PDF or Excel) for processing.

    Supports:
    - PDF files (pdfplumber parsing)
    - Excel files (pandas)

    Returns: task_id and queueing status
    """
    try:
        filename = (file.filename or "").lower()
        if filename.endswith(".pdf"):
            source_type = "pdf"
        elif filename.endswith((".xlsx", ".xls")):
            source_type = "excel"
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Only .pdf, .xlsx, and .xls are accepted.",
            )

        ingestion_id = _queue_ingestion(source_type, priority)

        # Cache the raw file bytes alongside the ingestion id so a worker can
        # pick it up for parsing (pdfplumber/pandas) without needing shared
        # disk storage.
        if redis_client:
            contents = await file.read()
            redis_client.setex(f"ingest_file:{ingestion_id}", 3600, contents)

        return {
            "ingestion_id": ingestion_id,
            "status": "queued",
            "priority": priority,
            "source_type": source_type,
            "filename": file.filename,
            "data_hash": data_hash,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File ingestion error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# PREDICTION API
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/v1/audit/predict", tags=["Prediction"], response_model=PredictionResponse)
async def predict_anomalies(report_id: str):
    """
    Run anomaly detection on ingested audit data.
    
    Returns:
    - Anomaly detection result (boolean)
    - Confidence score (0-1)
    - List of detected anomalies with severity
    """
    import json
    import time
    start_time = time.time()

    try:
        # Fetch report data from cache/DB
        if redis_client:
            cached = redis_client.get(f"report:{report_id}")
            if cached:
                report_data = json.loads(cached)
            else:
                raise HTTPException(status_code=404, detail="Report not found")
        else:
            raise HTTPException(status_code=503, detail="Cache not available")

        # Placeholder ML inference (implement actual model in production)
        anomalies = [
            {"type": "accounting_mismatch", "severity": 0.8, "description": "Balance discrepancy"},
            {"type": "transaction_pattern", "severity": 0.6, "description": "Unusual activity"},
        ]

        confidence_score = 0.92
        anomaly_detected = confidence_score > 0.5

        processing_time = (time.time() - start_time) * 1000

        return PredictionResponse(
            prediction_id=f"pred_{Web3.keccak(text=report_id).hex()[:16]}",
            report_id=report_id,
            anomaly_detected=anomaly_detected,
            confidence=confidence_score,
            anomalies=anomalies,
            processing_time_ms=processing_time,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# IPFS STORAGE API
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/v1/audit/store-ipfs", tags=["Storage"], response_model=dict)
async def store_report_ipfs(
    report: AuditReport,
    background_tasks: BackgroundTasks = BackgroundTasks(),
):
    """
    Store audit report on IPFS and return CID.
    
    The stored report is immutable and can be verified on-chain.
    """
    try:
        import json
        
        # Convert report to JSON
        report_json = json.dumps(report.model_dump(), indent=2)
        
        # Upload to IPFS
        if not ipfs_client:
            raise HTTPException(status_code=503, detail="IPFS client not available")
        
        res = ipfs_client.add_str(report_json)
        ipfs_hash = res
        
        logger.info(f"Stored report on IPFS: {ipfs_hash}")
        
        # Cache the mapping
        if redis_client:
            redis_client.setex(
                f"ipfs_report:{ipfs_hash}",
                3600 * 24,  # 24 hours TTL
                report_json
            )
        
        # Queue for blockchain registration (background task)
        background_tasks.add_task(
            register_report_onchain,
            report.report_id,
            ipfs_hash,
            report.data_hash,
            report.confidence_score,
        )
        
        return {
            "report_id": report.report_id,
            "ipfs_hash": ipfs_hash,
            "data_hash": report.data_hash,
            "status": "stored",
            "confirmation_queued": True,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"IPFS storage error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def register_report_onchain(report_id: str, ipfs_hash: str, data_hash: str, confidence: float):
    """Background task to register report on AuditReportRegistry contract."""
    try:
        logger.info(f"Registering report on-chain: {report_id} -> {ipfs_hash}")
        # Implementation: Call smart contract via web3.py
        # This will be completed in Phase 2
    except Exception as e:
        logger.error(f"On-chain registration error: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# REPORT RETRIEVAL API
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/v1/audit/report/{report_id}", tags=["Retrieval"], response_model=AuditReport)
async def get_report(report_id: str):
    """
    Retrieve stored audit report by ID.
    Returns cached or IPFS-fetched report.
    """
    try:
        import json

        # Check cache first
        if redis_client:
            cached = redis_client.get(f"report:{report_id}")
            if cached:
                return json.loads(cached)

        # TODO: Fetch from IPFS if not cached
        raise HTTPException(status_code=404, detail="Report not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Report retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# QUEUE STATUS API
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/v1/queue/status", tags=["Queue"])
async def queue_status():
    """Get current processing queue statistics."""
    try:
        if not redis_client:
            return {"status": "unavailable"}
        
        audit_queue_len = redis_client.llen("audit_queue")
        celery_queue_len = redis_client.llen("celery")
        
        return {
            "audit_queue": audit_queue_len,
            "celery_queue": celery_queue_len,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Queue status error: {str(e)}")
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info",
    )
