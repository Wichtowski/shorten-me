# Shorten-Me URL Shortening Service

A full-stack URL shortening service created as a college class project. The Azure + Pulumi setup in this repository was built for that class requirement and is kept as historical/reference code.

> **Project status:** Azure, MongoDB Atlas, and Vercel are not currently used for an active deployment of this project. Any Azure/Pulumi, MongoDB, or Vercel references in this repository should be treated as legacy/class-project documentation or experimental code unless they are explicitly re-enabled.

## Project Structure

- **frontend/**: Vinext fullstack application (API + UI)
- **infra/**: Pulumi infrastructure as code (legacy Azure class-project deployment)
- **.github/**: GitHub Actions workflows for CI/CD

## Current Local Version

### Prerequisites

- Node.js 20+
- Bun

### Frontend Setup

1. Clone the repository:

```bash
git clone https://github.com/Wichtowski/shorten-me
cd shorten-me
```

2. Install frontend dependencies:

```bash
cd frontend
bun install
```

## Local Development

```bash
cd frontend
bun run dev
```

## Cloudflare Deployment

The active deployment target is Cloudflare Workers at:

```text
https://shorten.oskarwichtowski.com
```

Production deploys are handled by `.github/workflows/deploy-cloudflare.yaml` using the `production` Wrangler environment in `frontend/wrangler.jsonc`.

Required GitHub environment secrets for `development` and `production`:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_KV_NAMESPACE_ID`

Required Cloudflare Worker secrets for the `development` Worker:

- `BASIC_AUTH_USERNAME`
- `BASIC_AUTH_PASSWORD`

The `production` environment publishes the Worker to the custom domain `shorten.oskarwichtowski.com` in the Cloudflare zone `oskarwichtowski.com`.

## Legacy Azure + Pulumi Version (class project, not currently used)

This section documents the original Azure deployment flow that was implemented to pass a college class. It is not the current hosting setup, and the project is not actively deployed on Azure.

### Prerequisites

- Node.js 20+
- Bun
- Docker
- Azure CLI
- Pulumi CLI
- Python 3.12+

### Legacy Azure Setup

1. Clone the repository:

```bash
git clone https://github.com/Wichtowski/shorten-me
cd shorten-me
```

2. Install frontend dependencies:

```bash
cd frontend
bun install
cd ..
```

3. Set up Pulumi:

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

The legacy Azure version used GitHub Actions for automated deployments. To set up that historical flow:

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
