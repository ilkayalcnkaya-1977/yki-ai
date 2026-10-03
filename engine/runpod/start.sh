#!/usr/bin/env bash
set -euo pipefail

: "${WAN_MODEL_PATH:=/models/Wan2.2-TI2V-5B}"
: "${YKI_ENGINE_PORT:=8080}"

python3 -m yki_engine
