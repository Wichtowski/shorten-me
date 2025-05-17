# Backend API for Shorten-Me

FastAPI backend with Azure Functions integration for the URL shortening service.

## Structure

- `azure_functions/` - Azure Functions implementations
- `routers/` - API route definitions
- `exceptions/` - Custom exception handlers
- `middleware/` - Request/response middleware
- `main.py` - Application entry point
- `container.py` - Dependency injection container
- `database.py` - Database connection and models
- `models.py` - Pydantic models for data validation
- `auth.py` - Authentication and authorization

## Local Development

### Setup

1. Create and activate virtual environment
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r ../requirements.txt
   ```

2. Set up environment variables in `.env` file
   ```
   AZURE_STORAGE_CONNECTION_STRING=your_connection_string
   SECRET_KEY=your_jwt_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

3. Run development server
   ```bash
   python -m uvicorn main:app --reload
   ```
   
4. Access API documentation at `http://localhost:8000/docs`

## Azure Functions Development

The backend can be deployed as Azure Functions for serverless operation:

1. Install Azure Functions Core Tools
   ```bash
   npm install -g azure-functions-core-tools@4
   ```

2. Run functions locally
   ```bash
   func start
   ```

## Deployment

The backend is automatically deployed through the main deployment script:

```bash
python ../deploy.py
```

This builds a Docker container using `Dockerfile.functions` and deploys it to Azure.

## Testing

Run API tests with:
```bash
pytest
```

## Adding New Endpoints

1. Add route definition in appropriate file under `routers/`
2. If needed, add models in `models.py`
3. For Azure Functions deployment, create a new function in `azure_functions/` 