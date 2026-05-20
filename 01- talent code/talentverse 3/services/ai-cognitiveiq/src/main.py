
from fastapi import FastAPI
from pydantic import BaseModel
app = FastAPI(title="CognitiveIQ v1")

class AssessPayload(BaseModel):
    answers: list

@app.post("/v1/assess/run")
def run(payload: AssessPayload):
    score = 100 + int(sum((a or 0) for a in payload.answers) % 32)
    return {"sessionId":"sess_demo","scores":{"cognitive":score,"emotional":70}}
