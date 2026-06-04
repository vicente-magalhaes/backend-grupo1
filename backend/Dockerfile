# ==========================================
# CNH Connect — Backend (FastAPI)
# ==========================================
FROM python:3.12-slim

# Evita .pyc e força logs sem buffer (melhor observabilidade nos contêineres)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instala dependências primeiro (camada cacheável)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação
COPY . .

EXPOSE 8000

# Sobe a API. Em produção, remover --reload.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
