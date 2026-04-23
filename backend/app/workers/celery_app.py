from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "chatbot_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour maximum for heavy document ingestion
    task_soft_time_limit=3000,
    worker_concurrency=4,
    worker_prefetch_multiplier=1,
)

# Autodiscover background tasks across modules
celery_app.autodiscover_tasks(["app.workers"])
