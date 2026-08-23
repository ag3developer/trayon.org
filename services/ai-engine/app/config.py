"""Configuration and environment variables for AI-Engine."""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Service configuration
    SERVICE_NAME: str = "trayon-ai-engine"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # API configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8001"))
    API_WORKERS: int = int(os.getenv("API_WORKERS", "4"))
    
    # IPFS configuration
    IPFS_API_URL: str = os.getenv("IPFS_API_URL", "/ip4/127.0.0.1/tcp/5001")
    IPFS_GATEWAY_URL: str = os.getenv("IPFS_GATEWAY_URL", "http://localhost:8080")
    
    # Redis configuration
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_MAX_CONNECTIONS: int = int(os.getenv("REDIS_MAX_CONNECTIONS", "50"))
    
    # Database configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://trayon:trayon@localhost:5432/trayon"
    )
    DB_POOL_MIN_SIZE: int = int(os.getenv("DB_POOL_MIN_SIZE", "10"))
    DB_POOL_MAX_SIZE: int = int(os.getenv("DB_POOL_MAX_SIZE", "20"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "60"))
    
    # Celery configuration
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/2")
    
    # Blockchain configuration
    AUDIT_CONTRACT_ADDRESS: str = os.getenv("AUDIT_CONTRACT_ADDRESS", "0x0")
    ORACLE_CONTRACT_ADDRESS: str = os.getenv("ORACLE_CONTRACT_ADDRESS", "0x0")
    VALIDATOR_PRIVATE_KEY: str = os.getenv("VALIDATOR_PRIVATE_KEY", "")
    
    # RPC configuration
    ETH_RPC_URL: str = os.getenv("ETH_RPC_URL", "http://localhost:8545")
    L2_RPC_URL: str = os.getenv("L2_RPC_URL", "http://localhost:9545")
    
    # Processing configuration
    MAX_DOCUMENT_SIZE_MB: int = int(os.getenv("MAX_DOCUMENT_SIZE_MB", "100"))
    MAX_BATCH_SIZE: int = int(os.getenv("MAX_BATCH_SIZE", "100"))
    PROCESSING_TIMEOUT_SECONDS: int = int(os.getenv("PROCESSING_TIMEOUT_SECONDS", "300"))
    
    # Model configuration
    MODEL_PATH: str = os.getenv("MODEL_PATH", "/models/audit_model.pkl")
    INFERENCE_THRESHOLD: float = float(os.getenv("INFERENCE_THRESHOLD", "0.5"))
    
    # Logging configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "json")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
