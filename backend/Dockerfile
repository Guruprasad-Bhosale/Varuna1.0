FROM python:3.11-slim

WORKDIR /app

# Copy the pyproject.toml first to leverage Docker cache
COPY pyproject.toml /app/

# Install build dependencies if needed (e.g., for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy full source and install
COPY . /app/
RUN pip install --no-cache-dir .

# We need psycopg2-binary for PostgreSQL support in production
RUN pip install --no-cache-dir psycopg2-binary gunicorn

# Expose port
EXPOSE 8000

# Default command (Overridden by docker-compose for prod gunicorn)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
