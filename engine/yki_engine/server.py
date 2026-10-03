import os
import uuid
from typing import Optional

import httpx
from fastapi import BackgroundTasks, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .worker import run_job

app = FastAPI(title="YKI Engine", version="1.1.0")
API_KEY = os.getenv("YKI_ENGINE_API_KEY", "")
SUPABASE_URL = os.getenv("YKI_SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_KEY = os.getenv("YKI_SUPABASE_SERVICE_ROLE_KEY", "")


class GenerateRequest(BaseModel):
    generation_id: uuid.UUID
    prompt: str = Field(min_length=1, max_length=4000)
    aspect_ratio: str = Field(default="9:16", pattern=r"^(9:16|16:9|1:1)$")
    duration_seconds: int = Field(default=8, ge=1, le=8)
    generate_audio: bool = False


def authorized(value: Optional[str]) -> bool:
    return bool(API_KEY) and secrets_equal(value or "", API_KEY)


def secrets_equal(left: str, right: str) -> bool:
    import hmac
    return hmac.compare_digest(left, right)


async def engine_accept_generation(generation_id: str, job_id: str) -> bool:
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("YKI Engine Supabase credentials are not configured")

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/rpc/system_engine_accept_generation",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "p_generation_id": generation_id,
                "p_provider_job_id": job_id,
                "p_model_version": "wan2.2-ti2v-5b",
            },
        )
        response.raise_for_status()
        value = response.json()
        return bool(value)


@app.get("/health")
async def health():
    model_configured = bool(os.getenv("WAN_MODEL_PATH"))
    return {
        "ok": model_configured,
        "engine": "yki",
        "model": "wan2.2-ti2v-5b",
        "gpu": "required",
        "model_configured": model_configured,
    }


@app.post("/v1/generations")
async def generate(
    payload: GenerateRequest,
    background: BackgroundTasks,
    x_yki_engine_key: Optional[str] = Header(default=None),
):
    if not authorized(x_yki_engine_key):
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not os.getenv("WAN_MODEL_PATH"):
        raise HTTPException(status_code=503, detail="YKI Engine model is not configured")

    job_id = f"yki_{payload.generation_id}"

    try:
        accepted = await engine_accept_generation(str(payload.generation_id), job_id)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Database acceptance failed: {exc}",
        ) from exc

    if not accepted:
        raise HTTPException(
            status_code=409,
            detail="Generation is no longer queued or was already accepted",
        )

    background.add_task(
        run_job,
        str(payload.generation_id),
        payload.prompt,
        payload.aspect_ratio,
        payload.duration_seconds,
    )

    return {
        "job_id": job_id,
        "status": "starting",
        "model": "wan2.2-ti2v-5b",
    }
