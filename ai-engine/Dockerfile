FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir numpy opencv-python-headless torch torchvision ultralytics

COPY . .

CMD ["python", "-c", "print('AI Engine YOLOv8 + ByteTrack pipeline ready.')"]
