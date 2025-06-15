# Shorten-Me URL Shortening Service

A full-stack URL shortening service. Originally deployed on Azure as a student project, now migrated to MongoDB Atlas + Vercel for free tier hosting.

## Project Structure

- **frontend/**: Next.js fullstack application (API + UI)
- **infra/**: Pulumi infrastructure as code (legacy Azure deployment)
- **.github/**: GitHub Actions workflows for CI/CD

## Current Version (MongoDB + Vercel)

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free tier)
- Vercel account

### Setup

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

### Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the `MONGODB_URI` environment variable in Vercel's project settings
4. Deploy!

### Local Development

```bash
cd frontend
npm run dev
```

## Azure Version (tag 1.3.0)

### Prerequisites
- Node.js 20+
- Docker
- Azure CLI
- Pulumi CLI

### Setup

1. Clone the repository and checkout the Azure version
```bash
git clone <repository-url>
cd shorten-me
git checkout 1.3.0
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

### Deployment

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

### Docker Builds

Build frontend:
```bash
docker build -t shortenme-frontend -f frontend/Dockerfile ./frontend
```

## Additional Documentation

For more detailed information, see README files in each component directory:
- [Frontend Documentation](./frontend/README.md)
- [Infrastructure Documentation](./infra/README.md)
