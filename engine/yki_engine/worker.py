import asyncio
import os
import secrets
import subprocess
from pathlib import Path

import httpx

SUPABASE_URL = os.environ["YKI_SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["YKI_SUPABASE_SERVICE_ROLE_KEY"]
BUCKET = os.getenv("YKI_STORAGE_BUCKET", "yki-media")
WAN_DIR = Path(os.getenv("WAN_REPO", "/opt/wan"))
CKPT_DIR = Path(os.environ["WAN_MODEL_PATH"])
OUTPUT_DIR = Path(os.getenv("YKI_OUTPUT_DIR", "/tmp/yki-output"))
CONCURRENCY = max(1, int(os.getenv("YKI_ENGINE_CONCURRENCY", "1")))
SEMAPHORE = asyncio.Semaphore(CONCURRENCY)


def size_for_ratio(ratio: str) -> str:
    return {
        "9:16": "704*1280",
        "16:9": "1280*704",
        "1:1": "704*704",
    }.get(ratio, "704*1280")


def frames_for_duration(seconds: int) -> int:
    # Wan requires 4n+1 frames. At 24 fps, 8 seconds is 193 frames.
    # This is intentionally explicit so the UI/database duration and the GPU job agree.
    return 4 * round((seconds * 24 - 1) / 4) + 1


async def rpc(name: str, payload: dict):
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/rpc/{name}",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        return response.json()


async def upload(path: Path, storage_path: str):
    async with httpx.AsyncClient(timeout=300) as client:
        with path.open("rb") as file_handle:
            response = await client.post(
                f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "video/mp4",
                    "x-upsert": "true",
                },
                content=file_handle.read(),
            )
        response.raise_for_status()
        return path.stat().st_size


async def mark_processing(generation_id: str):
    await rpc("system_start_generation", {"p_generation_id": generation_id})


async def run_job(generation_id: str, prompt: str, ratio: str, duration: int):
    async with SEMAPHORE:
        output = OUTPUT_DIR / generation_id
        output.mkdir(parents=True, exist_ok=True)
        output_file = output / "output.mp4"

        try:
            await mark_processing(generation_id)

            cmd = [
                "python3",
                str(WAN_DIR / "generate.py"),
                "--task", "ti2v-5B",
                "--size", size_for_ratio(ratio),
                "--frame_num", str(frames_for_duration(duration)),
                "--ckpt_dir", str(CKPT_DIR),
                "--offload_model", "True",
                "--convert_model_dtype",
                "--t5_cpu",
                "--prompt", prompt,
                "--save_file", str(output_file),
            ]

            process = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=str(WAN_DIR),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
            )
            logs, _ = await process.communicate()

            if process.returncode != 0 or not output_file.exists() or output_file.stat().st_size == 0:
                raise RuntimeError(
                    logs.decode("utf-8", "ignore")[-4000:] or "GPU generation failed"
                )

            storage_path = f"generations/{generation_id}/output.mp4"
            byte_size = await upload(output_file, storage_path)

            await rpc("system_complete_generation", {
                "p_generation_id": generation_id,
                "p_provider_event_id": f"yki-{generation_id}-{secrets.token_hex(8)}",
                "p_storage_path": storage_path,
                "p_mime_type": "video/mp4",
                "p_byte_size": byte_size,
                "p_provider_cost_usd": 0,
                "p_actual_duration_seconds": duration,
            })
        except Exception as exc:
            try:
                await rpc("system_fail_generation", {
                    "p_generation_id": generation_id,
                    "p_error_code": str(exc)[:500],
                })
            except Exception:
                # The generation remains reserved rather than silently losing credits
                # if the database itself is temporarily unavailable. A reconciliation
                # worker should retry system_fail_generation for stuck jobs.
                pass
        finally:
            try:
                output_file.unlink(missing_ok=True)
                output.rmdir()
            except OSError:
                pass
