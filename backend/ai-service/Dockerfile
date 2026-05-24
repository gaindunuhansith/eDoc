FROM python:3.11-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./

# Use uv to sync all dependencies (no more pip after this)
RUN uv sync --no-dev

COPY app ./app
COPY server.py ./server.py

EXPOSE 8090

# Run using uv only
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8090"]
