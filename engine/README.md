# YKI Engine

Private, self-hosted video generation worker for YKI AI.

## Architecture

YKI web app -> Supabase generation row -> YKI Engine API -> GPU worker -> Supabase Storage.

The engine does not own user credits. Supabase is the source of truth for credits and generation state.

## Model

Default engine model: Wan2.2 TI2V-5B.

Wan2.2 is Apache-2.0 licensed. Keep the upstream LICENSE/NOTICE with the deployment.

## Run

1. Install NVIDIA drivers + CUDA.
2. Install Python 3.10+ and the upstream Wan2.2 requirements.
3. Download the model weights from the official Wan-AI release.
4. Set the environment variables from .env.example.
5. Run `python -m yki_engine`.

The HTTP API is intentionally small: submit a generation job and query its status.
