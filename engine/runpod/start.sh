#!/usr/bin/env bash
set -euo pipefail

: "${WAN_MODEL_PATH:=/models/Wan2.2-TI2V-5B}"
: "${YKI_ENGINE_PORT:=8080}"

mkdir -p "${WAN_MODEL_PATH}"

if [ ! -f "${WAN_MODEL_PATH}/Wan2.2_VAE.pth" ] || [ ! -f "${WAN_MODEL_PATH}/models_t5_umt5-xxl-enc-bf16.pth" ]; then
  echo "YKI: Wan2.2 TI2V-5B model is missing; downloading official weights..."
  python3 -m pip install --no-cache-dir "huggingface_hub[cli]"
  huggingface-cli download Wan-AI/Wan2.2-TI2V-5B --local-dir "${WAN_MODEL_PATH}"
fi

exec python3 -m yki_engine
