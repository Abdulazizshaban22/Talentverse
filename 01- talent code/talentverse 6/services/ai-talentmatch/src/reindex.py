
from fastapi import APIRouter
import os, psycopg
router = APIRouter(prefix="/v1/reindex", tags=["reindex"])
DB_URL = os.getenv("DATABASE_URL","postgresql://postgres:postgres@localhost:5432/talentverse")

@router.post("/opportunities")
def reindex_opportunities():
    # placeholder: mark rows needing embedding or recompute later via batch worker
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            cur.execute("UPDATE emb_opportunity_v2 SET embedding = embedding")  # noop touch
        con.commit()
    return {"status":"ok","message":"reindex scheduled (placeholder)"}
