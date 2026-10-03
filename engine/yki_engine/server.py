import os
import uuid
from pathlib import Path
from typing import Optional

import httpx
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="YKI Engine", version="1.0.0")

API_KEY = os.getenv("YKI_ENGINE_API_KEY", "")
SUPABASE_URL = os.getenv("YKI_SUPABASE_URL", "https://dtdygokcjjoprqfjmmcz.supabase.co")
SUPABASE_KEY = os.getenv("YKI_SUPABASE_SERVICE_ROLE_KEY", "")
BUCKET = os.getenv("YKI_STORAGE_BUCKET", "yki-media")
MODEL_PATH = os.getenv("WAN_MODEL_PATH", "")

class GenerateRequest(BaseModel):
    generation_id: uuid.UUID
    prompt: str = Field(min_length=1, max_length=8000)
    aspect_ratio: str = Field(default="9:16")
    duration_seconds: int = Field(default=8, ge=1, le=60)

class Job(BaseModel):
    generation_id: uuid.UUID
    status: str
    output_url: Optional[str] = None
    error: Optional[str] = None

def authorized(value: Optional[str]) -> bool:
    return bool(API_KEY) and value == API_KEY

@app.get("/health")
async def health():
    return {"ok": True, "engine": "yki", "model": "wan2.2-ti2v-5b", "configured": bool(MODEL_PATH)}

@app.post("/v1/generations", response_model=Job)
async def generate(payload: GenerateRequest, x_yki_engine_key: Optional[str] = Header(default=None)):
    if not authorized(x_yki_engine_key):
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not MODEL_PATH:
        raise HTTPException(status_code=503, detail="YKI Engine model is not configured")

    # The GPU worker implementation is deliberately isolated behind this boundary.
    # It must create the output file before the generation can be marked completed.
    raise HTTPException(status_code=503, detail="GPU worker not attached")
