FROM nvidia/cuda:12.4.1-cudnn-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y python3 python3-pip git ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/yki-engine

RUN git clone --depth 1 https://github.com/Wan-Video/Wan2.2.git /opt/wan
RUN pip3 install --no-cache-dir -r /opt/wan/requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

COPY yki_engine ./yki_engine
COPY .env.example ./

EXPOSE 8080
CMD ["python3","-m","yki_engine"]
