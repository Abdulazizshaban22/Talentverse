
from fastapi import FastAPI, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
import os, psycopg
from .security import require_api_key

DB_URL = os.getenv("DATABASE_URL","postgresql://postgres:postgres@localhost:5432/talentverse")
app = FastAPI(title="Ingestion EDU")

class Student(BaseModel):
    id: Optional[str] = None
    national_id: Optional[str] = None
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    region: Optional[str] = None
    institution_id: Optional[str] = None
    college: Optional[str] = None
    major: Optional[str] = None
    gpa: Optional[float] = Field(None, ge=0, le=5)
    level: Optional[int] = None

class Program(BaseModel):
    code: str
    name: str
    institution_id: Optional[str] = None
    level: Optional[str] = None
    skills: List[str] = []

class Enrollment(BaseModel):
    student_id: str
    program_code: str
    status: str = "active"

@app.post("/v1/edu/students", dependencies=[Depends(require_api_key)])
def upsert_students(items: List[Student]):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            for s in items:
                cur.execute("""
                INSERT INTO edu_student (national_id, full_name, email, phone, region, institution_id, college, major, gpa, level)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (national_id) DO UPDATE SET
                  full_name=EXCLUDED.full_name, email=EXCLUDED.email, phone=EXCLUDED.phone,
                  region=EXCLUDED.region, institution_id=EXCLUDED.institution_id,
                  college=EXCLUDED.college, major=EXCLUDED.major, gpa=EXCLUDED.gpa, level=EXCLUDED.level
                RETURNING id
                """, (s.national_id, s.full_name, s.email, s.phone, s.region, s.institution_id, s.college, s.major, s.gpa, s.level))
            con.commit()
    return {"ok": True, "n": len(items)}

@app.post("/v1/edu/programs", dependencies=[Depends(require_api_key)])
def upsert_programs(items: List[Program]):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            for p in items:
                cur.execute("""
                INSERT INTO edu_program (code, name, institution_id, level, skills)
                VALUES (%s,%s,%s,%s,%s)
                ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, institution_id=EXCLUDED.institution_id, level=EXCLUDED.level, skills=EXCLUDED.skills
                """, (p.code, p.name, p.institution_id, p.level, p.skills))
            con.commit()
    return {"ok": True, "n": len(items)}

@app.post("/v1/edu/enrollments", dependencies=[Depends(require_api_key)])
def upsert_enrollments(items: List[Enrollment]):
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            for e in items:
                cur.execute("""
                INSERT INTO edu_enrollment (student_id, program_code, status)
                VALUES (%s,%s,%s)
                ON CONFLICT (student_id, program_code) DO UPDATE SET status=EXCLUDED.status
                """, (e.student_id, e.program_code, e.status))
            con.commit()
    return {"ok": True, "n": len(items)}
