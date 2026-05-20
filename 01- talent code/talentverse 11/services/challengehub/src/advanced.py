
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
import os, psycopg

DB_URL = os.getenv("DATABASE_URL","postgresql://postgres:postgres@localhost:5432/talentverse")
router = APIRouter(prefix="/v1", tags=["advanced"])

class TeamIn(BaseModel):
    name: str
    institution_id: str | None = None

class TeamMemberIn(BaseModel):
    team_id: str
    person_id: str
    role: str = "member"

class RoundIn(BaseModel):
    challenge_id: str
    round_no: int
    starts_at: str | None = None
    ends_at: str | None = None

class RubricIn(BaseModel):
    challenge_id: str
    name: str
    items: List[Dict[str, float]]  # [{label, weight}]

@router.post("/teams")
def create_team(body: TeamIn):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            cur.execute("INSERT INTO team (name, institution_id) VALUES (%s,%s) RETURNING id", (body.name, body.institution_id))
            tid = cur.fetchone()[0]; con.commit(); return {"id": str(tid)}

@router.post("/teams/members")
def add_member(body: TeamMemberIn):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            cur.execute("INSERT INTO team_member (team_id, person_id, role) VALUES (%s,%s,%s) ON CONFLICT DO NOTHING",
                        (body.team_id, body.person_id, body.role)); con.commit(); return {"ok": True}

@router.post("/rounds")
def create_round(body: RoundIn):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            cur.execute("INSERT INTO round (challenge_id, round_no, starts_at, ends_at) VALUES (%s,%s,%s,%s) RETURNING id",
                        (body.challenge_id, body.round_no, body.starts_at, body.ends_at))
            rid = cur.fetchone()[0]; con.commit(); return {"id": str(rid)}

@router.post("/rubrics")
def create_rubric(body: RubricIn):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            cur.execute("INSERT INTO rubric (challenge_id, name) VALUES (%s,%s) RETURNING id", (body.challenge_id, body.name))
            rid = cur.fetchone()[0]
            for it in body.items:
                cur.execute("INSERT INTO rubric_item (rubric_id, label, weight) VALUES (%s,%s,%s)", (rid, it['label'], it.get('weight',1.0)))
        con.commit()
        return {"id": str(rid)}
