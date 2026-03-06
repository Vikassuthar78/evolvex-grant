FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies (all have pre-built wheels)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code only
COPY app/ ./app/

# Railway injects PORT env var
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
