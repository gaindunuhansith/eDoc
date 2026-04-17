FROM python:3.11-slim

WORKDIR /app

# Bootstrap: Install uv using pip (one-time only, for package management)
RUN python -m pip install --no-cache-dir uv

COPY pyproject.toml ./

# Use uv to sync all dependencies (no more pip after this)
RUN uv sync --no-dev

COPY . .

EXPOSE 8087

# Run using uv only
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8087"]
