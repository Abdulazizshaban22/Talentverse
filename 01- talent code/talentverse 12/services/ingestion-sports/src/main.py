
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import List, Optional
import os, psycopg
from .security import require_api_key

DB_URL = os.getenv("DATABASE_URL","postgresql://postgres:postgres@localhost:5432/talentverse")
app = FastAPI(title="Ingestion SPORTS")

class Athlete(BaseModel):
  id: Optional[str] = None
  full_name: str
  birthdate: Optional[str] = None
  region: Optional[str] = None
  institution_id: Optional[str] = None
  sport: Optional[str] = None
  dominant_hand: Optional[str] = None

class Metric(BaseModel):
  athlete_id: str
  type: str  # e.g., sprint_100m, vo2max
  value: float
  unit: Optional[str] = None

@app.post("/v1/sports/athletes", dependencies=[Depends(require_api_key)])
def upsert_athletes(items: List[Athlete]):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            for a in items:
                cur.execute("""
                INSERT INTO sport_athlete(full_name, birthdate, region, institution_id, sport, dominant_hand)
                VALUES (%s,%s,%s,%s,%s,%s)
                RETURNING id
                """, (a.full_name, a.birthdate, a.region, a.institution_id, a.sport, a.dominant_hand))
        con.commit()
    return {"ok": True, "n": len(items)}

@app.post("/v1/sports/metrics", dependencies=[Depends(require_api_key)])
def push_metrics(items: List[Metric]):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            for m in items:
                cur.execute("""
                INSERT INTO sport_metric(athlete_id, type, value, unit) VALUES (%s,%s,%s,%s)
                """, (m.athlete_id, m.type, m.value, m.unit))
        con.commit()
    return {"ok": True, "n": len(items)}
