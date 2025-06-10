"""An Azure RM Python Pulumi program"""

import pulumi
import pulumi_azure_native as azure_native
import random
import pulumi.asset as asset
from datetime import datetime, timedelta, UTC
import base64

# Configurable values
location = "northeurope"
resource_group_name = "shortenme-rg"
cosmosdb_account_name = "shortenme-cosmosdb"
database_name = "urlshortener"

# Resource Group
resource_group = azure_native.resources.ResourceGroup(
    resource_group_name,
    resource_group_name=resource_group_name,
    location=location
)

# CosmosDB Account
cosmosdb_account = azure_native.documentdb.DatabaseAccount(
    cosmosdb_account_name,
    resource_group_name=resource_group.name,
    location=resource_group.location,
    database_account_offer_type="Standard",
    kind="GlobalDocumentDB",
    consistency_policy=azure_native.documentdb.ConsistencyPolicyArgs(
        default_consistency_level="Session"
    ),
    locations=[
        azure_native.documentdb.LocationArgs(
            location_name=resource_group.location,
            failover_priority=0
        )
    ]
)

# CosmosDB SQL Database
cosmosdb_sql_db = azure_native.documentdb.SqlResourceSqlDatabase(
    database_name,
    resource_group_name=resource_group.name,
    account_name=cosmosdb_account.name,
    resource=azure_native.documentdb.SqlDatabaseResourceArgs(
        id=database_name
    )
)

# CosmosDB SQL Containers
users_container = azure_native.documentdb.SqlResourceSqlContainer(
    "users",
    resource_group_name=resource_group.name,
    account_name=cosmosdb_account.name,
    database_name=cosmosdb_sql_db.name,
    resource=azure_native.documentdb.SqlContainerResourceArgs(
        id="users",
        partition_key=azure_native.documentdb.ContainerPartitionKeyArgs(
            paths=["/username"],
            kind="Hash"
        )
    )
)

# Urls Container
urls_container = azure_native.documentdb.SqlResourceSqlContainer(
    "urls",
    resource_group_name=resource_group.name,
    account_name=cosmosdb_account.name,
    database_name=cosmosdb_sql_db.name,
    resource=azure_native.documentdb.SqlContainerResourceArgs(
        id="urls",
        partition_key=azure_native.documentdb.ContainerPartitionKeyArgs(
            paths=["/user_id"],
            kind="Hash"
        )
    )
)

# Anonymous Usage Container
anonymous_usage_container = azure_native.documentdb.SqlResourceSqlContainer(
    "anonymous_usage",
    resource_group_name=resource_group.name,
    account_name=cosmosdb_account.name,
    database_name=cosmosdb_sql_db.name,
    resource=azure_native.documentdb.SqlContainerResourceArgs(
        id="anonymous_usage",
        partition_key=azure_native.documentdb.ContainerPartitionKeyArgs(
            paths=["/ip_address"],
            kind="Hash"
        )
    )
)

# Storage Account for frontend static website
storage_account_name = f"smfe{random.randint(100000,999999)}"

storage_account = azure_native.storage.StorageAccount(
    storage_account_name,
    resource_group_name=resource_group.name,
    location=resource_group.location,
    sku=azure_native.storage.SkuArgs(
        name=azure_native.storage.SkuName.STANDARD_LRS
    ),
    kind=azure_native.storage.Kind.STORAGE_V2,
    enable_https_traffic_only=True,
    allow_blob_public_access=True
)

# Enable static website
static_website = azure_native.storage.StorageAccountStaticWebsite(
    "frontend-static-website",
    account_name=storage_account.name,
    resource_group_name=resource_group.name,
    index_document="index.html",
    error404_document="index.html"
)

# Azure Container Registry
registry_name = f"shortenmecr{random.randint(10000,99999)}"
container_registry = azure_native.containerregistry.Registry(
    registry_name,
    resource_group_name=resource_group.name,
    location=resource_group.location, 
    sku=azure_native.containerregistry.SkuArgs(
        name="Basic"
    ),
    admin_user_enabled=True
)

# Get the registry credentials
registry_credentials = azure_native.containerregistry.list_registry_credentials_output(
    resource_group_name=resource_group.name,
    registry_name=container_registry.name
)

registry_username = registry_credentials.username
registry_password = registry_credentials.passwords[0].value
registry_login_server = container_registry.login_server

# App Service plan for frontend web app
app_service_plan = azure_native.web.AppServicePlan(
    "app-service-plan",
    resource_group_name=resource_group.name,
    location=resource_group.location,
    kind="Linux",
    reserved=True,
    sku=azure_native.web.SkuDescriptionArgs(
        tier="Basic",
        name="B1",
        capacity=1
    )
)

# Get CosmosDB primary key
cosmosdb_keys = azure_native.documentdb.list_database_account_keys_output(
    resource_group_name=resource_group.name,
    account_name=cosmosdb_account.name
)
cosmosdb_primary_key = cosmosdb_keys.primary_master_key

# Frontend Web App (Using container from ACR)
frontend_app = azure_native.web.WebApp(
    "shortenme-frontend",
    resource_group_name=resource_group.name,
    location=resource_group.location,
    server_farm_id=app_service_plan.id,
    site_config=azure_native.web.SiteConfigArgs(
        app_settings=[
            azure_native.web.NameValuePairArgs(name="DOCKER_REGISTRY_SERVER_URL", value=registry_login_server.apply(lambda url: f"https://{url}")),
            azure_native.web.NameValuePairArgs(name="DOCKER_REGISTRY_SERVER_USERNAME", value=registry_username),
            azure_native.web.NameValuePairArgs(name="DOCKER_REGISTRY_SERVER_PASSWORD", value=registry_password),
            azure_native.web.NameValuePairArgs(name="WEBSITES_ENABLE_APP_SERVICE_STORAGE", value="false"),
            azure_native.web.NameValuePairArgs(name="WEBSITES_PORT", value="3000"),
            azure_native.web.NameValuePairArgs(name="COSMOSDB_ENDPOINT", value=cosmosdb_account.document_endpoint),
            azure_native.web.NameValuePairArgs(name="COSMOSDB_KEY", value=cosmosdb_primary_key),
            azure_native.web.NameValuePairArgs(name="COSMOSDB_DATABASE_NAME", value=database_name),
            azure_native.web.NameValuePairArgs(name="NODE_ENV", value="production"),
        ],
        linux_fx_version=registry_login_server.apply(lambda url: f"DOCKER|{url}/shortenme-frontend:latest"),
        always_on=True,
        health_check_path="/api/health",
        auto_heal_enabled=True,
        auto_heal_rules=azure_native.web.AutoHealRulesArgs(
            triggers=azure_native.web.AutoHealTriggersArgs(
                requests=azure_native.web.RequestsBasedTriggerArgs(
                    count=10,
                    time_interval="00:02:00"
                )
            ),
            actions=azure_native.web.AutoHealActionsArgs(
                action_type="Recycle",
                min_process_execution_time="00:01:00"
            )
        )
    ),
    kind="app,linux,container",
    https_only=True,
    opts=pulumi.ResourceOptions(depends_on=[app_service_plan, container_registry])
)

# Outputs
pulumi.export("cosmosdb_account_name", cosmosdb_account.name)
pulumi.export("cosmosdb_endpoint", cosmosdb_account.document_endpoint)
pulumi.export("resource_group_name", resource_group.name)
pulumi.export("storage_account_name", storage_account.name)
pulumi.export("static_website_url", storage_account.primary_endpoints.web)
pulumi.export("frontend_url", frontend_app.default_host_name)
pulumi.export("frontend_app_name", frontend_app.name)
pulumi.export("container_registry_name", container_registry.name)
pulumi.export("container_registry_login_server", registry_login_server)
pulumi.export("container_registry_username", registry_username)
pulumi.export("container_registry_password", pulumi.Output.secret(registry_password))
