
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import os, psycopg

DB_URL = os.getenv("DATABASE_URL","postgresql://postgres:postgres@localhost:5432/talentverse")
app = FastAPI(title="ChallengeHub")

class Challenge(BaseModel):
    title: str
    description: str
    tags: List[str] = []
    max_participants: int = 100

class Submission(BaseModel):
    challenge_id: str
    person_id: str
    score: float

@app.post("/v1/challenges")
def create_challenge(ch: Challenge):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            cur.execute("INSERT INTO challenge (title, description, tags, max_participants) VALUES (%s,%s,%s,%s) RETURNING id",
                        (ch.title, ch.description, ch.tags, ch.max_participants))
            cid = cur.fetchone()[0]
            con.commit()
            return {"id": str(cid)}

@app.post("/v1/submit")
def submit(s: Submission):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            cur.execute("INSERT INTO submission (challenge_id, person_id, score) VALUES (%s,%s,%s)",
                        (s.challenge_id, s.person_id, s.score))
            con.commit()
            return {"ok":True}

@app.get("/v1/leaderboard/{challenge_id}")
def leaderboard(challenge_id: str, limit: int = 20):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            cur.execute("SELECT person_id, max(score) AS s FROM submission WHERE challenge_id=%s GROUP BY person_id ORDER BY s DESC LIMIT %s", (challenge_id, limit))
            rows = [{"person_id": str(r[0]), "score": float(r[1])} for r in cur.fetchall()]
            return {"challenge_id": challenge_id, "leaders": rows}
