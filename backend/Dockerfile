# ==========================================
# Etapa base común
# ==========================================
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Dependencias del sistema necesarias para psycopg2 / compilación y healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ==========================================
# Etapa de Desarrollo
# ==========================================
FROM base AS development

ENV FLASK_ENV=development \
    FLASK_DEBUG=1

COPY . .

EXPOSE 5000

# En dev montaremos el código por volumen y activaremos recarga automática
CMD ["python", "main.py"]

# ==========================================
# Etapa de Producción
# ==========================================
FROM base AS production

ENV FLASK_ENV=production \
    FLASK_DEBUG=0

# Crear usuario no-root por seguridad
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

COPY . .

RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Gunicorn apuntando a wsgi:app (ajusta workers según los cores del servidor)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "3", "--timeout", "60", "wsgi:app"]