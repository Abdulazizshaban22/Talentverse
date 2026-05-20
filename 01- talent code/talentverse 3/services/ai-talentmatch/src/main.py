from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import os

USE_HF = os.getenv("USE_HF","0") == "1"
DB_URL = os.getenv("DATABASE_URL","postgresql://postgres:postgres@localhost:5432/talentverse")

app = FastAPI(title="TalentMatch v2 (NER+Emb + pgvector KNN)")

class Opportunity(BaseModel):
    name: str
    tags: List[str] = []

class MatchPayload(BaseModel):
    profile: dict
    opportunities: Optional[List[Opportunity]] = None

def simple_score(skills, tags):
    skills = set(map(str.lower, skills or []))
    tags = set(map(str.lower, tags or []))
    return len(skills & tags) / max(1, len(tags))

def load_hf():
    global hf_ner, hf_tok, hf_model
    try:
        from transformers import pipeline, AutoTokenizer, AutoModel
        hf_ner = pipeline('token-classification', model='CAMeL-Lab/bert-base-arabic-camelbert-msa-ner', aggregation_strategy='simple')
        hf_tok = AutoTokenizer.from_pretrained('intfloat/multilingual-e5-base')
        hf_model = AutoModel.from_pretrained('intfloat/multilingual-e5-base')
        return True
    except Exception as e:
        print("HF not available:", e)
        return False

def embed_texts(texts: List[str]):
    import torch, numpy as np
    inputs = hf_tok(texts, padding=True, truncation=True, return_tensors='pt')
    with torch.no_grad():
        model_output = hf_model(**inputs).last_hidden_state
    mask = inputs['attention_mask'].unsqueeze(-1)
    masked = model_output * mask
    summed = masked.sum(dim=1)
    counts = mask.sum(dim=1).clamp(min=1)
    embs = (summed / counts).cpu().numpy().astype('float32')
    norms = (embs**2).sum(axis=1, keepdims=True) ** 0.5
    embs = embs / (norms + 1e-9)
    return embs

def upsert_opportunities(opps):
    import psycopg
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            for o in opps:
                cur.execute(
                    "INSERT INTO emb_opportunity_v2 (name, tags, embedding) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
                    (o['name'], o.get('tags', []), o['vec'].tolist())
                )
        con.commit()

def knn(query_vec, limit=10):
    import psycopg
    rows = []
    sql = "SELECT id, name, tags, 1 - (embedding <=> %s) AS cosine_sim FROM emb_opportunity_v2 ORDER BY embedding <=> %s LIMIT %s"
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            cur.execute(sql, (query_vec.tolist(), query_vec.tolist(), limit))
            for (idv, name, tags, sim) in cur.fetchall():
                rows.append({ "id": str(idv), "name": name, "tags": tags, "score": float(sim) })
    return rows

@app.on_event("startup")
def startup():
    if USE_HF:
        load_hf()

@app.post("/v1/match")
def match(payload: MatchPayload):
    opps = payload.opportunities or [Opportunity(name="Coding Cup", tags=["programming","algorithms"])]
    skills = payload.profile.get("skills", [])
    bio = payload.profile.get("bio", "")
    if USE_HF and 'hf_tok' in globals():
        features = list(set(skills + [bio]))
        prof_vec = embed_texts([" ".join(features)])[0]
        opps_list = []
        for o in opps:
            txt = " ".join(o.tags + [o.name])
            vec = embed_texts([txt])[0]
            opps_list.append({"name": o.name, "tags": o.tags, "vec": vec})
        try:
            upsert_opportunities(opps_list)
        except Exception as e:
            print("DB upsert failed:", e)
        results = knn(prof_vec, limit=10)
        if not results:
            results = [ {"name": o["name"], "score": float((o["vec"] @ prof_vec).sum()) } for o in opps_list ]
        return {"results": results, "mode": "v2-db"}
    scored = []
    for o in opps:
        scored.append({"opportunity": o.name, "score": round(simple_score(skills, o.tags), 2)})
    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"results": scored, "mode": "v1"}
