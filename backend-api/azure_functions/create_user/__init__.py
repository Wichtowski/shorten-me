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
        CONTAINER_USERS = "users"

        client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        database = client.get_database_client(DATABASE_NAME)
        users_container = database.get_container_client(CONTAINER_USERS)

        data = req.get_json()
        email = data["email"]
        username = data["username"]
        password = data["password"]

        # Check if password is already hashed (bcrypt hash starts with $2b$ or $2a$)
        if not (password.startswith("$2b$") or password.startswith("$2a$")):
            return func.HttpResponse(json.dumps({"error": "Password must be pre-hashed with bcrypt."}), status_code=400, mimetype="application/json")

        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "username": username,
            "email": email,
            "password": password,
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        }
        users_container.upsert_item(user)
        # Do not return the password hash in the response
        user.pop("password")
        return func.HttpResponse(json.dumps(user), status_code=201, mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(json.dumps({"error": str(e)}), status_code=500, mimetype="application/json") 