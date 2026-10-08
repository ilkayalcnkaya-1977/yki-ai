FROM nvidia/cuda:12.4.1-cudnn-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y \
    python3 python3-pip git ffmpeg curl build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/yki-engine

RUN python3 -m pip install --upgrade pip setuptools wheel packaging ninja

RUN git clone --depth 1 https://github.com/Wan-Video/Wan2.2.git /opt/wan

# Install the PyTorch stack before flash-attn. flash-attn's build step imports torch,
# and its isolated PEP 517 environment otherwise cannot see the installed torch.
RUN pip3 install torch==2.8.0 torchvision==0.23.0 torchaudio==2.8.0

RUN grep -v -E '^(torch|torchvision|torchaudio|flash_attn)' /opt/wan/requirements.txt > /tmp/wan-requirements.txt \
    && pip3 install -r /tmp/wan-requirements.txt \
    && pip3 install --no-build-isolation flash-attn==2.8.3.post1

COPY requirements.txt /opt/yki-engine/requirements.txt
RUN pip3 install -r /opt/yki-engine/requirements.txt

COPY yki_engine /opt/yki-engine/yki_engine
COPY runpod /opt/yki-engine/runpod

EXPOSE 8080

CMD ["python3", "-m", "yki_engine"]
