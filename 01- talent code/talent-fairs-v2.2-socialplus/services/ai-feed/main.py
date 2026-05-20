from fastapi import FastAPI, Query
from pydantic import BaseModel
app=FastAPI(title='AI Feed')
@app.get('/health')
def h(): return {'ok': True, 'service': 'ai-feed'}

class IngestIn(BaseModel):
    postId: str
    text: str = ""
    tags: list[str] = []

@app.post("/ingest")
def ingest(i: IngestIn):
    # TODO: compute embedding via local model and store in DB (pgvector)
    return {"ok": True, "postId": i.postId}

@app.get("/similar")
def similar(postId: str, limit: int = 10):
    # TODO: use pgvector cosine similarity to fetch similar posts
    return {"ok": True, "postId": postId, "similar": []}
