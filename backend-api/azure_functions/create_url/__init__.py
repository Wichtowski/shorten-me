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
        client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        database = client.get_database_client(DATABASE_NAME)
        urls_container = database.get_container_client(CONTAINER_URLS)
        anon_container = database.get_container_client(CONTAINER_ANON)
        data = req.get_json()
        original_url = data.get("original_url")
        user_id = data.get("user_id")
        custom_slug = data.get("custom_slug")
        
        if not original_url:
            return func.HttpResponse(json.dumps({"error": "original_url is required"}), status_code=400, mimetype="application/json")
        if not user_id:
            return func.HttpResponse(json.dumps({"error": "user_id is required"}), status_code=400, mimetype="application/json")
        if not custom_slug:
            custom_slug = str(uuid.uuid4())[:4]
        
        if user_id == "anonymous":
            anon_results = list(anon_container.query_items(
                query="SELECT * FROM c WHERE c.short_url = @short_url",
                parameters=[{"name": "@short_url", "value": custom_slug}],
                enable_cross_partition_query=True
            ))
            if anon_results:
                return func.HttpResponse(json.dumps({"error": "custom_slug already exists"}), status_code=400, mimetype="application/json")
        else:
            urls_results = list(urls_container.query_items(
                query="SELECT * FROM c WHERE c.short_url = @short_url",
                parameters=[{"name": "@short_url", "value": custom_slug}],
                enable_cross_partition_query=True
            ))
            if urls_results:
                return func.HttpResponse(json.dumps({"error": "custom_slug already exists"}), status_code=400, mimetype="application/json")
        
        url_id = str(uuid.uuid4())
        slug = custom_slug or url_id[:8]
        url = {
            "id": url_id,
            "user_id": user_id,
            "original_url": original_url,
            "short_url": slug,
            "created_at": datetime.utcnow().isoformat(),
            "clicks": 0
        }
        if user_id == "anonymous":
            anon_container.upsert_item(url)
        else:
            urls_container.upsert_item(url)
        return func.HttpResponse(json.dumps(url), status_code=201, mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(json.dumps({"error": str(e)}), status_code=500, mimetype="application/json") 