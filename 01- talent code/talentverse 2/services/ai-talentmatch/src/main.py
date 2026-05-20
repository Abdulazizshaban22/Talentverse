
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import os

USE_HF = os.getenv("USE_HF","0") == "1"

app = FastAPI(title="TalentMatch v1+v2")

class MatchPayload(BaseModel):
    profile: dict
    opportunities: List[dict] = []

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

def embed(texts: List[str]):
    import torch
    inputs = hf_tok(texts, padding=True, truncation=True, return_tensors='pt')
    model_output = hf_model(**inputs)
    attention_mask = inputs['attention_mask']
    last_hidden = model_output.last_hidden_state.masked_fill(~attention_mask[..., None].bool(), 0.0)
    return (last_hidden.sum(dim=1) / attention_mask.sum(dim=1)[..., None]).detach().numpy()

@app.on_event("startup")
def startup():
    if USE_HF:
        load_hf()

@app.post("/v1/match")
def match(payload: MatchPayload):
    opps = payload.opportunities or [{"name":"Coding Cup","tags":["programming","algorithms"]}]
    skills = payload.profile.get("skills", [])
    if USE_HF and 'hf_ner' in globals():
        # v2: NER + embeddings cosine similarity
        try:
            text = payload.profile.get("bio","") + " " + " ".join(skills)
            ents = [e['word'] for e in hf_ner(text)]
            features = list(set(skills + ents))
            import numpy as np
            prof_vec = embed([" ".join(features)])[0]
            scored = []
            for opp in opps:
                tags = opp.get("tags", [])
                opp_vec = embed([" ".join(tags)])[0]
                score = float(np.dot(prof_vec, opp_vec) / (np.linalg.norm(prof_vec)*np.linalg.norm(opp_vec)+1e-9))
                scored.append({"opportunity": opp.get("name"), "score": round((score+1)/2, 2)})
            scored.sort(key=lambda x: x["score"], reverse=True)
            return {"results": scored, "mode":"v2"}
        except Exception as e:
            print("HF path failed:", e)
    # v1 fallback
    scored = []
    for opp in opps:
        scored.append({"opportunity": opp.get("name"), "score": round(simple_score(skills, opp.get("tags", [])), 2)})
    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"results": scored, "mode":"v1"}
