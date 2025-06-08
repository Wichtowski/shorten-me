# Shorten-Me URL Shortening Service

A full-stack URL shortening service deployed on Azure.

## Project Structure

- **frontend/**: Next.js fullstack application (API + UI)
- **infra/**: Pulumi infrastructure as code

## Setup from Fresh Machine

### Prerequisites

- Node.js 20+
- Docker
- Azure CLI
- Pulumi CLI

### Initial Setup

1. Clone the repository
```bash
git clone <repository-url>
cd shorten-me
```

2. Install dependencies for frontend
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. Set up Pulumi
   ```bash
   cd infra
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pulumi stack select oskar  # Or create a new stack with: pulumi stack init <name>
   cd ..
   ```

## Deployment Workflow

1. Deploy infrastructure:
   ```bash
   cd infra
   pulumi up
   cd ..
   ```

2. Deploy frontend:
   ```bash
   python deploy_frontend.py
   ```

## Local Development

### Frontend (Next.js)
```bash
cd frontend
npm run dev
```

## Docker Builds

Build frontend:
```bash
docker build -t shortenme-frontend -f frontend/Dockerfile ./frontend
```

## Additional Documentation

For more detailed information, see README files in each component directory:
- [Frontend Documentation](./frontend/README.md)
- [Infrastructure Documentation](./infra/README.md)
