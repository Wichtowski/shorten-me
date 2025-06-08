# Infrastructure as Code for Shorten-Me

Pulumi-based infrastructure setup for deploying the URL shortening service to Azure.

## Structure

- `__main__.py` - Main Pulumi program defining Azure resources
- `Pulumi.yaml` - Project configuration file
- `Pulumi.oskar.yaml` - Stack-specific configuration
- `requirements.txt` - Python dependencies for Pulumi
- `auto_deploy.py` - Helper script for automated deployments

## Prerequisites

- Azure CLI installed and configured
- Pulumi CLI installed
- Python 3.12+
- Azure subscription with permissions to create resources

## Setup

1. Create and activate a virtual environment
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

2. Login to Pulumi and Azure
    ```bash
    pulumi login
    az login
    ```

3. Select or create a Pulumi stack
    ```bash
    pulumi stack select oskar  # Or create new: pulumi stack init <name>
    ```

## Configuration

Configure Pulumi with necessary settings:

```bash
pulumi config set azure-native:location westeurope
pulumi config set project:resource_group_name shortenme-rg
# Add other configuration values as needed
```

## Deploying Infrastructure

To preview changes:
```bash
pulumi preview
```

To deploy:
```bash
pulumi up
```

## Getting Outputs

To get specific output values:
```bash
pulumi stack output container_registry_login_server
pulumi stack output frontend_url
```

## Managed Resources

This infrastructure code manages:

- Resource Group
- Storage Account
- Container Registry
- App Service Plan
- Web App for the frontend (Next.js)
- CosmosDB

## Clean Up

To destroy all created resources:
```bash
pulumi destroy
```

## Integration with Deployment Scripts

The deployment script (`deploy_frontend.py`) uses the outputs from this Pulumi stack to deploy the frontend container to Azure.