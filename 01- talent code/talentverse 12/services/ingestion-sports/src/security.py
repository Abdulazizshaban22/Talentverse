
from fastapi import Request, HTTPException
import os

API_KEY = os.getenv("INGESTION_API_KEY", "changeme")
async def require_api_key(request: Request):
    key = request.headers.get("x-api-key")
    if not key or key != API_KEY:
        raise HTTPException(status_code=401, detail="invalid api key")
