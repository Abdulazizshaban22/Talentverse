
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
import os

USE_HF = os.getenv("USE_HF","0") == "1"
DB_URL = os.getenv("DATABASE_URL","postgresql://postgres:postgres@localhost:5432/talentverse")

app = FastAPI(title="TalentMatch v3 — pgvector KNN + Business Rules")

class Opportunity(BaseModel):
    name: str
    tags: List[str] = []
    region: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None

class MatchPayload(BaseModel):
    profile: Dict[str, Any] = {}
    opportunities: Optional[List[Opportunity]] = None  # optional direct list
    person_id: Optional[str] = None                    # prefer person_id for cross-table

def load_hf():
    global hf_ner, hf_tok, hf_model
    try:
        from transformers import pipeline, AutoTokenizer, AutoModel
        hf_ner = pipeline('token-classification', model='CAMeL-Lab/bert-base-arabic-camelbert-mix-ner', aggregation_strategy='simple')
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
    # L2 normalize for cosine
    norms = (embs**2).sum(axis=1, keepdims=True) ** 0.5
    return embs / (norms + 1e-9)

def db():
    import psycopg
    return psycopg.connect(DB_URL)

def get_person(pid: str):
    with db() as con:
        with con.cursor() as cur:
            cur.execute("SELECT id, full_name, region, birthdate FROM person WHERE id = %s", (pid,))
            r = cur.fetchone()
            if not r: return None
            return {"id": str(r[0]), "full_name": r[1], "region": r[2], "birthdate": r[3]}

def upsert_person_vec(pid: str, vec):
    with db() as con:
        with con.cursor() as cur:
            cur.execute("""
              INSERT INTO emb_person_v2 (person_id, embedding) VALUES (%s, %s)
              ON CONFLICT (person_id) DO UPDATE SET embedding = EXCLUDED.embedding
            """, (pid, vec.tolist()))
        con.commit()

def get_person_vec(pid: str):
    with db() as con:
        with con.cursor() as cur:
            cur.execute("SELECT embedding FROM emb_person_v2 WHERE person_id = %s", (pid,))
            r = cur.fetchone()
            return r[0] if r else None

def ensure_opp_embeddings_from_payload(opps: List[Opportunity]):
    # Insert opportunities (if not existing) and embed text for them
    with db() as con:
        with con.cursor() as cur:
            for o in opps:
                txt = " ".join(o.tags + [o.name or "", o.region or ""])
                vec = None
                if USE_HF and 'hf_tok' in globals():
                    vec = embed_texts([txt])[0]
                cur.execute("""
                  INSERT INTO emb_opportunity_v2 (name, tags, region, min_age, max_age, embedding)
                  VALUES (%s, %s, %s, %s, %s, %s)
                  ON CONFLICT DO NOTHING
                """, (o.name, o.tags, o.region, o.min_age, o.max_age, (vec.tolist() if vec is not None else None)))
        con.commit()

def knn_from_person_vec(person_vec, limit=50):
    # Returns raw KNN results with opportunity metadata
    import psycopg
    rows = []
    sql = """
      SELECT id, name, tags, region, min_age, max_age, 1 - (embedding <=> %s) AS cosine_sim
      FROM emb_opportunity_v2
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> %s
      LIMIT %s
    """
    with db() as con:
        with con.cursor() as cur:
            cur.execute(sql, (person_vec.tolist(), person_vec.tolist(), limit))
            for r in cur.fetchall():
                rows.append({
                    "id": str(r[0]), "name": r[1], "tags": r[2], "region": r[3],
                    "min_age": r[4], "max_age": r[5], "sim": float(r[6])
                })
    return rows

def compute_age(birthdate):
    if not birthdate: return None
    from datetime import date
    today = date.today()
    return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))

def apply_business_rules(person, candidates: List[dict]):
    # Base: similarity; rules: region match bonus; age range filter/penalty; small tag-overlap bonus when profile has skills
    skills = set(map(str.lower, (person.get("skills") or [])))
    region = (person.get("region") or "").strip().lower()
    results = []
    for c in candidates:
        score = c["sim"]  # 0..1 approximately
        # Region bonus
        if region and c.get("region") and region == str(c["region"]).strip().lower():
            score += 0.05
        # Age gating
        age = compute_age(person.get("birthdate"))
        if age is not None:
            min_age = c.get("min_age")
            max_age = c.get("max_age")
            if (min_age and age < min_age) or (max_age and age > max_age):
                score -= 0.3  # heavy penalty
        # Tag overlap bonus
        tags = set(map(str.lower, (c.get("tags") or [])))
        if skills and tags:
            overlap = len(skills & tags)
            if overlap:
                score += min(0.1, 0.02 * overlap)
        results.append({**c, "score": round(float(score), 3)})
    results.sort(key=lambda x: x["score"], reverse=True)
    return results

@app.on_event("startup")
def startup():
    if USE_HF:
        load_hf()

@app.post("/v1/match")
def match(payload: MatchPayload):
    # If person_id provided: do cross-table flow; else fallback to embedded opportunities from body
    if payload.person_id:
        person = get_person(payload.person_id)
        if not person:
            return {"error": "person not found", "person_id": payload.person_id}
        # Build profile text from DB + provided profile (skills/bio)
        combined_skills = list(set((payload.profile.get("skills") or []) + (payload.profile.get("extra_skills") or [])))
        bio = payload.profile.get("bio", "")
        person_for_embed = {"skills": combined_skills, "bio": bio}
        vec = get_person_vec(payload.person_id)
        if vec is None:
            if USE_HF and 'hf_tok' in globals():
                feats = " ".join(combined_skills+[bio or ""])
                vec = embed_texts([feats])[0]
                upsert_person_vec(payload.person_id, vec)
            else:
                return {"error":"no vector for person and HF disabled","person_id":payload.person_id}
        raw = knn_from_person_vec(vec, limit=50)
        enriched = apply_business_rules({**person, **payload.profile}, raw)
        return {"person": person, "results": enriched, "mode":"v3-cross-table"}
    # Fallback: use payload opportunities
    opps = payload.opportunities or [Opportunity(name="Coding Cup", tags=["programming","algorithms"])]
    if USE_HF and 'hf_tok' in globals():
        # Embed and store opportunities, then embed profile and do local similarity
        ensure_opp_embeddings_from_payload(opps)
        feats = " ".join((payload.profile.get("skills") or []) + [payload.profile.get("bio","")])
        vec = embed_texts([feats])[0]
        raw = knn_from_person_vec(vec, limit=20)
        return {"results": apply_business_rules(payload.profile, raw), "mode":"v3-local+db"}
    # v1 pure fallback (no DB/HF)
    skills = set(map(str.lower, (payload.profile.get("skills") or [])))
    scored = []
    for o in opps:
        tags = set(map(str.lower, o.tags))
        base = len(skills & tags) / max(1, len(tags)) if tags else 0.0
        scored.append({"name": o.name, "tags": o.tags, "score": round(base,2)})
    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"results": scored, "mode":"v1"}
