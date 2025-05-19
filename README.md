# Shorten-Me URL Shortening Service

A full-stack URL shortening service deployed on Azure.

## Project Structure

- **backend-api/**: FastAPI backend with Azure Functions
- **frontend/**: React frontend application
- **infra/**: Pulumi infrastructure as code

## Setup from Fresh Machine

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker
- Azure CLI
- Pulumi CLI

### Initial Setup

1. Clone the repository
```bash
git clone <repository-url>
cd shorten-me
```

2. Install dependencies for backend
   ```bash
   cd backend-api
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r ../requirements.txt
   cd ..
   ```

3. Install dependencies for frontend
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. Set up Pulumi
   ```bash
   cd infra
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pulumi stack select oskar  # Or create a new stack with: pulumi stack init <name>
   cd ..
   ```

## Deployment Workflow

1. Deploy infrastructure and backend:
   ```bash
   python deploy.py
   ```

2. Deploy frontend:
   ```bash
   python deploy_frontend.py
   ```

## Local Development

### Backend
```bash
cd backend-api
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -m uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm run dev
```

## Docker Builds

Build backend:
```bash
docker build -t shortenme-functions -f Dockerfile.functions .
```

Build frontend:
```bash
docker build -t shortenme-frontend -f Dockerfile.frontend .
```

## Additional Documentation

For more detailed information, see README files in each component directory:
- [Backend API Documentation](./backend-api/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Infrastructure Documentation](./infra/README.md)
