# Backend API for Shorten-Me

A FastAPI backend for the Shorten-Me URL shortening service.

## Directory Structure

- `routers/` — API route definitions
- `exceptions/` — Custom exception handlers
- `middleware/` — Request/response middleware
- `main.py` — Application entry point
- `container.py` — Dependency injection container
- `database.py` — Database connection and models
- `models.py` — Pydantic models for data validation
- `auth.py` — Authentication and authorization

## Quickstart

### 1. Install [uv](https://github.com/astral-sh/uv) (Python package/dependency manager)

Recommended:
```bash
pipx install uv
```
Or:
```bash
curl -Ls https://astral.sh/uv/install.sh | sh
```

### 2. Set up your environment

```bash
uv venv
source .venv/bin/activate
uv pip install
```

### 3. Configure environment variables

Create a `.env` file in the project root:
```bash
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```
### 3. Run the development server

```python
uvicorn main:app --reload
```

Visit [http://localhost:8000/docs](http://localhost:8000/docs) for the interactive API docs.

### 4. Lint your code

```bash
ruff check .
ruff check . --fix
```

### 5. Run tests

```bash
pytest
```

## Deployment

Build and deploy with Docker:
```python
python ../deploy.py
```
This uses the provided `Dockerfile` to build the backend container.

## Adding New Endpoints

1. Add a route in `routers/`
2. Add models in `models.py` if needed

---