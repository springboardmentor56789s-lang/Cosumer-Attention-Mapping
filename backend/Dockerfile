FROM python:3.14-slim

# Install Linux libraries required by OpenCV, MediaPipe and FFmpeg
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libgles2 \
    libegl1 \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV YOLO_CONFIG_DIR=/tmp/Ultralytics

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}