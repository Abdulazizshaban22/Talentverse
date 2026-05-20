
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="CareerPath v1")

class RecommendPayload(BaseModel):
    interests: List[str] = []

@app.post("/v1/career/recommend")
def recommend(payload: RecommendPayload):
    interests = [i.lower() for i in payload.interests]
    if "ai" in interests or "programming" in interests:
        top = [{"path":"Computer Science - AI Track", "score":0.82}]
    else:
        top = [{"path":"General Science - Exploratory", "score":0.6}]
    return {"topN": top}
