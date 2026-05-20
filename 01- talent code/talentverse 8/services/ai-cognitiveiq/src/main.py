
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np

app = FastAPI(title="CognitiveIQ v1 — baseline")

class Answer(BaseModel):
    qid: str
    value: int  # Likert 1..5 or score

class AssessmentRequest(BaseModel):
    answers: List[Answer]

@app.post("/v1/assess")
def assess(req: AssessmentRequest):
    vals = np.array([a.value for a in req.answers], dtype=float)
    vals = np.clip(vals, 1, 5)
    # Simple baseline normalization
    score = float((vals.mean() - 1) / 4.0)  # normalized 0..1
    # Subscores mock (split thirds)
    n = len(vals)
    thirds = [vals[:n//3].mean() if n>=3 else vals.mean(),
              vals[n//3:2*n//3].mean() if n>=3 else vals.mean(),
              vals[2*n//3:].mean() if n>=3 else vals.mean()]
    return { "overall": round(score,3),
             "subscores": [round(float((x-1)/4.0),3) for x in thirds],
             "method": "baseline-normalized" }
