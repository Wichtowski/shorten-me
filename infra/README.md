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
pulumi config set project:environment prod  # or dev, staging
pulumi config set project:cosmosdb_name shortenme-cosmos
pulumi config set project:app_service_plan_name shortenme-plan
pulumi config set project:web_app_name shortenme-app
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
pulumi stack output cosmosdb_endpoint
pulumi stack output cosmosdb_key
```

## Managed Resources

This infrastructure code manages:

- Resource Group
- Storage Account
- Container Registry
- App Service Plan
- Web App for the frontend (Next.js)
- CosmosDB
- Application Insights

## Environment-Specific Configuration

The infrastructure supports multiple environments (dev, staging, prod). Configure environment-specific settings:

```bash
pulumi config set project:environment <environment>
pulumi config set project:resource_group_name shortenme-<environment>-rg
pulumi config set project:cosmosdb_name shortenme-<environment>-cosmos
pulumi config set project:app_service_plan_name shortenme-<environment>-plan
pulumi config set project:web_app_name shortenme-<environment>-app
```

## GitHub Actions Integration

The infrastructure can be deployed via GitHub Actions. Required secrets:

- `AZURE_CREDENTIALS`: Service Principal credentials
- `AZURE_SUBSCRIPTION_ID`: Azure subscription ID
- `AZURE_TENANT_ID`: Azure tenant ID
- `AZURE_CLIENT_ID`: Service Principal client ID
- `AZURE_CLIENT_SECRET`: Service Principal client secret

## Clean Up

To destroy all created resources:
```bash
pulumi destroy
```

## Integration with Deployment Scripts

The deployment script (`deploy_frontend.py`) uses the outputs from this Pulumi stack to deploy the frontend container to Azure.