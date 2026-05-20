from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Moderation")

BANNED = {"شتيمة","سب","كلمة_سيئة","offensive"}

class In(BaseModel):
    text: str

@app.post('/check')
def check(i: In):
    t = (i.text or '').lower()
    hits = [w for w in BANNED if w in t]
    return {"flagged": bool(hits), "hits": hits, "severity": 2 if hits else 0}
