
import os, time, math
from typing import List, Tuple
import psycopg
import numpy as np

USE_HF = os.getenv("USE_HF","1") == "1"
DB_URL = os.getenv("DATABASE_URL","postgresql://postgres:postgres@localhost:5432/talentverse")

tok = mdl = None

def load_hf():
    global tok, mdl
    from transformers import AutoTokenizer, AutoModel
    tok = AutoTokenizer.from_pretrained('intfloat/multilingual-e5-base')
    mdl = AutoModel.from_pretrained('intfloat/multilingual-e5-base')

def embed_texts(texts: List[str]):
    import torch
    inputs = tok(texts, padding=True, truncation=True, return_tensors='pt')
    with torch.no_grad():
        last = mdl(**inputs).last_hidden_state
    mask = inputs['attention_mask'].unsqueeze(-1)
    embs = (last * mask).sum(1) / mask.sum(1).clamp(min=1)
    embs = embs.cpu().numpy().astype('float32')
    norms = np.linalg.norm(embs, axis=1, keepdims=True) + 1e-9
    return embs / norms

def reembed_opportunities(batch_size=256, ttl_hours=168):
    if USE_HF and tok is None: load_hf()
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            cur.execute("""
                SELECT id, name, coalesce(array_to_string(tags, ' '), ''), coalesce(region,'')
                FROM emb_opportunity_v2
                WHERE embedding IS NULL
                   OR now() - COALESCE(updated_at, created_at, now()) > make_interval(hours => %s)
                ORDER BY id
            """, (ttl_hours,))
            rows = cur.fetchall()
            for i in range(0, len(rows), batch_size):
                chunk = rows[i:i+batch_size]
                texts = [f"{r[1]} {r[2]} {r[3]}" for r in chunk]
                vecs = embed_texts(texts)
                for (row, vec) in zip(chunk, vecs):
                    cur.execute("""
                        UPDATE emb_opportunity_v2 SET embedding = %s, updated_at = now() WHERE id = %s
                    """, (vec.tolist(), row[0]))
            con.commit()

def reembed_persons(batch_size=256, ttl_hours=720):
    if USE_HF and tok is None: load_hf()
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            cur.execute("""
                SELECT p.id, COALESCE(p.bio,''), COALESCE(string_agg(s.skill,' '),'')
                FROM person p
                LEFT JOIN person_skill s ON s.person_id = p.id
                GROUP BY p.id, p.bio
            """)
            rows = cur.fetchall()
            for i in range(0, len(rows), batch_size):
                chunk = rows[i:i+batch_size]
                texts = [f"{r[1]} {r[2]}" for r in chunk]
                vecs = embed_texts(texts)
                for (row, vec) in zip(chunk, vecs):
                    cur.execute("""
                        INSERT INTO emb_person_v2 (person_id, embedding) VALUES (%s, %s)
                        ON CONFLICT (person_id) DO UPDATE SET embedding = EXCLUDED.embedding
                    """, (row[0], vec.tolist()))
            con.commit()

if __name__ == '__main__':
    reembed_opportunities()
    reembed_persons()
    print('Re-embed done')
