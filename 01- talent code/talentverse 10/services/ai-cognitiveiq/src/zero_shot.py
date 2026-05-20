
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from transformers import pipeline

router = APIRouter(prefix="/v1", tags=["ml"])
clf = None

def get_pipe():
    global clf
    if clf is None:
        clf = pipeline("zero-shot-classification", model="joeddav/xlm-roberta-large-xnli")
    return clf

class ZSReq(BaseModel):
    texts: List[str]
    labels: List[str]

@router.post("/assess/zero-shot")
def assess_zero_shot(req: ZSReq):
    pipe = get_pipe()
    agg = {lbl: 0.0 for lbl in req.labels}
    for t in req.texts:
        out = pipe(t, req.labels, multi_label=True)
        for lbl, scr in zip(out['labels'], out['scores']):
            agg[lbl] += float(scr)
    n = max(1,len(req.texts))
    return { "micro_skills": {k: round(v/n,3) for k,v in agg.items()}, "model":"xlm-roberta-large-xnli" }
