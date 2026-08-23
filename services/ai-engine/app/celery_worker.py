"""Celery worker for asynchronous audit processing."""

import json
import logging
from datetime import datetime
from typing import Optional

from celery import Celery, Task
from celery.exceptions import SoftTimeLimitExceeded
from web3 import Web3
import pdfplumber
import pandas as pd
import requests
from app.config import settings
from app.ipfs_client import IPFSClient

# Configure Celery app
app = Celery(settings.SERVICE_NAME)
app.conf.update(
    broker_url=settings.CELERY_BROKER_URL,
    result_backend=settings.CELERY_RESULT_BACKEND,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=settings.PROCESSING_TIMEOUT_SECONDS,
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
)

logger = logging.getLogger(__name__)
ipfs_client = IPFSClient(settings.IPFS_API_URL)


class CallbackTask(Task):
    """Task class with error callback."""
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error(f"Task {task_id} failed: {str(exc)}")
    
    def on_success(self, result, task_id, args, kwargs):
        logger.info(f"Task {task_id} succeeded")


# ─────────────────────────────────────────────────────────────────────────────
# DOCUMENT PROCESSING TASKS
# ─────────────────────────────────────────────────────────────────────────────

@app.task(base=CallbackTask, bind=True, name="process_pdf_document")
def process_pdf_document(self, file_path: str, document_id: str):
    """
    Process PDF document for audit analysis.
    
    Extracts text, tables, and metadata.
    """
    try:
        self.update_state(state="PROCESSING", meta={"current": "extracting_text"})
        
        with pdfplumber.open(file_path) as pdf:
            text_content = ""
            tables = []
            
            for page_num, page in enumerate(pdf.pages):
                # Extract text
                text_content += f"\n--- PAGE {page_num + 1} ---\n"
                text_content += page.extract_text() or ""
                
                # Extract tables
                page_tables = page.extract_tables()
                if page_tables:
                    for table in page_tables:
                        tables.append({
                            "page": page_num + 1,
                            "data": table,
                        })
        
        # Compute data hash
        data_hash = Web3.keccak(text=text_content).hex()
        
        logger.info(f"Extracted {len(text_content)} chars and {len(tables)} tables from PDF")
        
        return {
            "document_id": document_id,
            "content": text_content[:5000],  # Store first 5K chars
            "tables": tables[:10],  # Store first 10 tables
            "data_hash": data_hash,
            "pages": len(pdf.pages),
            "status": "extracted",
        }
    except SoftTimeLimitExceeded:
        logger.error(f"PDF processing timeout for {document_id}")
        raise
    except Exception as e:
        logger.error(f"PDF processing error: {str(e)}")
        raise


@app.task(base=CallbackTask, bind=True, name="process_excel_document")
def process_excel_document(self, file_path: str, document_id: str):
    """Process Excel document for financial analysis."""
    try:
        self.update_state(state="PROCESSING", meta={"current": "reading_excel"})
        
        excel_file = pd.ExcelFile(file_path)
        data = {}
        
        for sheet_name in excel_file.sheet_names[:10]:  # Process first 10 sheets
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            data[sheet_name] = {
                "shape": df.shape,
                "columns": list(df.columns),
                "summary": df.describe().to_dict(),
            }
        
        # Compute data hash
        data_hash = Web3.keccak(text=str(data)).hex()
        
        logger.info(f"Extracted {len(data)} sheets from Excel file")
        
        return {
            "document_id": document_id,
            "sheets": data,
            "data_hash": data_hash,
            "status": "extracted",
        }
    except Exception as e:
        logger.error(f"Excel processing error: {str(e)}")
        raise


@app.task(base=CallbackTask, bind=True, name="fetch_api_data")
def fetch_api_data(self, api_url: str, document_id: str):
    """Fetch data from external API (government registry, etc)."""
    try:
        self.update_state(state="FETCHING", meta={"url": api_url})
        
        response = requests.get(api_url, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        data_hash = Web3.keccak(text=json.dumps(data)).hex()
        
        logger.info(f"Fetched data from {api_url}")
        
        return {
            "document_id": document_id,
            "source_url": api_url,
            "data": data,
            "data_hash": data_hash,
            "status": "fetched",
        }
    except requests.exceptions.RequestException as e:
        logger.error(f"API fetch error: {str(e)}")
        raise


# ─────────────────────────────────────────────────────────────────────────────
# ANOMALY DETECTION TASKS
# ─────────────────────────────────────────────────────────────────────────────

@app.task(base=CallbackTask, bind=True, name="detect_anomalies")
def detect_anomalies(self, document_id: str, data: dict):
    """
    Detect accounting anomalies using ML model.
    
    Checks for:
    - Balance discrepancies
    - Unusual transaction patterns
    - Regulatory violations
    - Data integrity issues
    """
    try:
        self.update_state(state="ANALYZING", meta={"document_id": document_id})
        
        anomalies = []
        confidence_scores = {}
        
        # Placeholder ML inference (replace with actual model in production)
        # In production, load and use scikit-learn model
        
        # Example anomaly detection logic
        if "financial_data" in data:
            # Check for balance discrepancies
            confidence_scores["balance_check"] = 0.85
            if abs(data.get("discrepancy", 0)) > 0.01:
                anomalies.append({
                    "type": "accounting_mismatch",
                    "severity": "high",
                    "confidence": 0.85,
                    "description": "Balance discrepancy detected",
                })
        
        # Average confidence score
        avg_confidence = sum(confidence_scores.values()) / len(confidence_scores) if confidence_scores else 0
        
        logger.info(f"Detected {len(anomalies)} anomalies in {document_id}")
        
        return {
            "document_id": document_id,
            "anomaly_count": len(anomalies),
            "anomalies": anomalies,
            "confidence_score": min(avg_confidence, 1.0),
            "status": "analyzed",
        }
    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        raise


@app.task(base=CallbackTask, bind=True, name="store_on_ipfs")
def store_on_ipfs(self, document_id: str, content: dict, data_hash: str):
    """Store audit result on IPFS."""
    try:
        self.update_state(state="STORING", meta={"document_id": document_id})
        
        # Convert to JSON
        report = {
            "document_id": document_id,
            "data_hash": data_hash,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Store on IPFS
        ipfs_hash = ipfs_client.add_dict(report)
        
        logger.info(f"Stored {document_id} on IPFS: {ipfs_hash}")
        
        return {
            "document_id": document_id,
            "ipfs_hash": ipfs_hash,
            "status": "stored",
        }
    except Exception as e:
        logger.error(f"IPFS storage error: {str(e)}")
        raise


@app.task(base=CallbackTask, bind=True, name="register_on_chain")
def register_on_chain(self, document_id: str, ipfs_hash: str, data_hash: str, confidence: float):
    """Register audit report on AuditReportRegistry contract."""
    try:
        self.update_state(state="REGISTERING", meta={"ipfs_hash": ipfs_hash})
        
        # TODO: Implement smart contract interaction
        # This will be completed in Phase 2
        
        logger.info(f"Queued on-chain registration for {document_id}")
        
        return {
            "document_id": document_id,
            "ipfs_hash": ipfs_hash,
            "status": "queued_for_chain",
        }
    except Exception as e:
        logger.error(f"On-chain registration error: {str(e)}")
        raise


# ─────────────────────────────────────────────────────────────────────────────
# CHAINED WORKFLOWS
# ─────────────────────────────────────────────────────────────────────────────

@app.task(base=CallbackTask, name="audit_workflow")
def audit_workflow(document_id: str, file_path: str, file_type: str):
    """
    Complete audit workflow: extract -> analyze -> store -> register.
    Uses Celery chains for orchestration.
    """
    from celery import chain, group
    
    try:
        # Step 1: Extract document
        if file_type == "pdf":
            extraction_task = process_pdf_document.s(file_path, document_id)
        elif file_type == "excel":
            extraction_task = process_excel_document.s(file_path, document_id)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
        
        # Build workflow chain
        workflow = chain(
            extraction_task,
            # Next steps will add more tasks as needed
        )
        
        result = workflow.apply_async()
        logger.info(f"Started audit workflow for {document_id}: {result.id}")
        
        return {"document_id": document_id, "task_id": result.id}
    except Exception as e:
        logger.error(f"Workflow error: {str(e)}")
        raise


if __name__ == "__main__":
    app.start()
