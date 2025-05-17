import azure.functions as func
import json
import os
import uuid
from datetime import datetime
from azure.cosmos import CosmosClient, PartitionKey

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
        COSMOS_KEY = os.getenv("COSMOS_KEY")
        DATABASE_NAME = os.getenv("COSMOSDB_DATABASE_NAME", "urlshortener")
        CONTAINER_URLS = "urls"

        client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        database = client.get_database_client(DATABASE_NAME)
        urls_container = database.get_container_client(CONTAINER_URLS)

        data = req.get_json()
        original_url = data["original_url"]
        user_id = data["user_id"]
        custom_slug = data.get("custom_slug")

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
        urls_container.upsert_item(url)
        return func.HttpResponse(json.dumps(url), status_code=201, mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(json.dumps({"error": str(e)}), status_code=500, mimetype="application/json") 