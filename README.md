# Shorten-Me URL Shortening Service

A full-stack URL shortening service deployed on Azure.

## Project Structure

- **frontend/**: Next.js fullstack application (API + UI)
- **infra/**: Pulumi infrastructure as code
- **.github/**: GitHub Actions workflows for CI/CD

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

## Deployment

### Manual Deployment

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

### GitHub Actions Deployment

The project uses GitHub Actions for automated deployments. To set up:

1. Configure Azure Service Principal:
```bash
az ad sp create-for-rbac --name "shorten-me-sp" --role contributor --scopes /subscriptions/<subscription-id>/resourceGroups/shortenme-rg --sdk-auth
```

2. Add the following secrets to your GitHub repository:
   - `AZURE_CREDENTIALS`: The entire JSON output from the service principal creation
   - `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID
   - `AZURE_TENANT_ID`: Your Azure tenant ID
   - `AZURE_CLIENT_ID`: The client ID from the service principal
   - `AZURE_CLIENT_SECRET`: The client secret from the service principal

3. Push to main branch to trigger deployment

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
