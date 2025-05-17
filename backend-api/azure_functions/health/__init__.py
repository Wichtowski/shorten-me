import logging
import azure.functions as func
import json
import datetime

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a health check request.')
    
    status = {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "service": "shortenme-api"
    }
    
    return func.HttpResponse(
        json.dumps(status),
        mimetype="application/json",
        status_code=200
    ) 