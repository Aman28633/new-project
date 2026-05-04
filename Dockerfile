FROM node:20-bookworm-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip python3-venv \
  && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/requirements.txt
RUN python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir -r ./backend/requirements.txt

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY backend ./backend
COPY frontend ./frontend

RUN cd frontend && npm run build

COPY railway-start.sh ./railway-start.sh
RUN chmod +x ./railway-start.sh

CMD ["./railway-start.sh"]
