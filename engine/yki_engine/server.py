import os
import uuid
from typing import Optional
from fastapi import BackgroundTasks, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from .worker import run_job

app=FastAPI(title="YKI Engine",version="1.0.0")
API_KEY=os.getenv("YKI_ENGINE_API_KEY","")

class GenerateRequest(BaseModel):
    generation_id: uuid.UUID
    prompt: str = Field(min_length=1,max_length=8000)
    aspect_ratio: str = Field(default="9:16")
    duration_seconds: int = Field(default=8,ge=1,le=8)
    generate_audio: bool = True

def authorized(value:Optional[str])->bool:
    return bool(API_KEY) and value==API_KEY

@app.get("/health")
async def health():
    return {"ok":True,"engine":"yki","model":"wan2.2-ti2v-5b","gpu":"required"}

@app.post("/v1/generations")
async def generate(
    payload:GenerateRequest,
    background:BackgroundTasks,
    x_yki_engine_key:Optional[str]=Header(default=None),
):
    if not authorized(x_yki_engine_key):
        raise HTTPException(status_code=401,detail="Unauthorized")

    # Never reserve/charge here. The web app owns the credit transaction.
    # We only accept a job when the local GPU engine is configured.
    if not os.getenv("WAN_MODEL_PATH"):
        raise HTTPException(status_code=503,detail="YKI Engine model is not configured")

    job_id=f"yki_{payload.generation_id}"
    background.add_task(
        run_job,
        str(payload.generation_id),
        payload.prompt,
        payload.aspect_ratio,
        payload.duration_seconds,
    )
    return {"job_id":job_id,"status":"queued","model":"wan2.2-ti2v-5b"}
