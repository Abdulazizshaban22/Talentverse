
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Any

app = FastAPI(title="TalentMatch v1")

class MatchPayload(BaseModel):
    profile: dict
    opportunities: List[dict] = []

@app.post("/v1/match")
def match(payload: MatchPayload):
    skills = set(map(str.lower, payload.profile.get("skills", [])))
    scored = []
    for opp in payload.opportunities or [{"name":"Coding Cup","tags":["programming","algorithms"]}]:
        tags = set(map(str.lower, opp.get("tags", [])))
        score = len(skills & tags) / max(1, len(tags))
        scored.append({"opportunity": opp.get("name"), "score": round(score, 2)})
    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"results": scored, "explain": {"matched_skills": list(skills)}}
