import azure.functions as func
import json
import os
import uuid
from datetime import datetime
from azure.cosmos import CosmosClient, PartitionKey

COSMOS_ENDPOINT = os.getenv("COSMOS_DB_URL")
COSMOS_KEY = os.getenv("COSMOS_DB_KEY")
DATABASE_NAME = os.getenv("COSMOSDB_DATABASE_NAME", "urlshortener")
CONTAINER_URLS = "urls"
CONTAINER_ANON = "anonymous_usage"

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        slug = req.route_params.get("slug")
        if not slug:
            return func.HttpResponse(json.dumps({"error": "slug is required"}), status_code=400, mimetype="application/json")

        client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        database = client.get_database_client(DATABASE_NAME)
        urls_container = database.get_container_client(CONTAINER_URLS)
        anon_container = database.get_container_client(CONTAINER_ANON)

        # Search in anonymous_usage
        anon_results = list(anon_container.query_items(
            query="SELECT * FROM c WHERE c.short_url = @short_url",
            parameters=[{"name": "@short_url", "value": slug}],
            enable_cross_partition_query=True
        ))
        if anon_results:
            return func.HttpResponse(json.dumps(anon_results[0]), status_code=200, mimetype="application/json")

        # Search in urls
        urls_results = list(urls_container.query_items(
            query="SELECT * FROM c WHERE c.short_url = @short_url",
            parameters=[{"name": "@short_url", "value": slug}],
            enable_cross_partition_query=True
        ))
        if urls_results:
            return func.HttpResponse(json.dumps(urls_results[0]), status_code=200, mimetype="application/json")

        return func.HttpResponse(json.dumps({"error": "slug not found"}), status_code=404, mimetype="application/json")
    except Exception as e:
        if os.getenv("ENVIRONMENT") == "local" or os.getenv("ENVIRONMENT") == "development":
            return func.HttpResponse(json.dumps({"error": str(e)}), status_code=500, mimetype="application/json") 
        return func.HttpResponse(json.dumps({"error": "Internal server error"}), status_code=500, mimetype="application/json") 