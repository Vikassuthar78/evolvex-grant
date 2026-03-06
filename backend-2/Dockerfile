FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies (all have pre-built wheels)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code — explicit copy to avoid dockerignore issues
COPY app/__init__.py ./app/__init__.py
COPY app/main.py ./app/main.py
COPY app/models/ ./app/models/
COPY app/core/ ./app/core/
COPY app/api/ ./app/api/
COPY app/agents/ ./app/agents/

# Verify models package exists
RUN python -c "import app.models.schemas; print('models OK')"

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
