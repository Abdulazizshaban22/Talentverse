
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import psycopg, os

DB_URL = os.getenv("DATABASE_URL","postgresql://postgres:postgres@localhost:5432/talentverse")
router = APIRouter(prefix="/v1/ingest", tags=["ingest"])

class OpportunityIn(BaseModel):
  name: str
  tags: List[str] = []
  region: Optional[str] = None
  min_age: Optional[int] = None
  max_age: Optional[int] = None

@router.post("/opportunities")
def ingest_opportunities(items: List[OpportunityIn]):
  with psycopg.connect(DB_URL) as con:
    with con.cursor() as cur:
      for it in items:
        cur.execute("""
          INSERT INTO emb_opportunity_v2 (name, tags, region, min_age, max_age)
          VALUES (%s, %s, %s, %s, %s)
          ON CONFLICT (id) DO NOTHING
        """, (it.name, it.tags, it.region, it.min_age, it.max_age))
    con.commit()
  return {"status":"ok","inserted":len(items)}
