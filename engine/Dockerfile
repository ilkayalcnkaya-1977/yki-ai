FROM nvidia/cuda:12.4.1-cudnn-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y \
    python3 python3-pip git ffmpeg curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/yki-engine

# Install the upstream Wan repository and its dependencies.
RUN git clone --depth 1 https://github.com/Wan-Video/Wan2.2.git /opt/wan
RUN pip3 install -r /opt/wan/requirements.txt

# Install YKI Engine dependencies before copying application code.
COPY requirements.txt /opt/yki-engine/requirements.txt
RUN pip3 install -r /opt/yki-engine/requirements.txt

COPY yki_engine /opt/yki-engine/yki_engine
COPY runpod /opt/yki-engine/runpod

EXPOSE 8080

CMD ["python3", "-m", "yki_engine"]
