
from fastapi import FastAPI, UploadFile, Form
from typing import Optional
import pandas as pd
import psycopg
import os

DB_URL = os.getenv("DATABASE_URL","postgresql://postgres:postgres@localhost:5432/talentverse")

app = FastAPI(title="Talentverse Ingestion")

def _upsert(df: pd.DataFrame, table: str):
    with psycopg.connect(DB_URL) as con:
        cols = ",".join(df.columns)
        values = ",".join([f"%({c})s" for c in df.columns])
        sql = f"INSERT INTO {table} ({cols}) VALUES ({values}) ON CONFLICT DO NOTHING"
        with con.cursor() as cur:
            cur.executemany(sql, df.to_dict(orient="records"))
        con.commit()

@app.post("/v1/ingest/csv")
async def ingest_csv(dataset: str = Form(...), file: UploadFile = None):
    # dataset in {school, university, sports}
    if file is None:
        return {"error":"file required"}
    df = pd.read_csv(file.file)
    # normalize columns (lower/underscore)
    df.columns = [c.strip().lower().replace(" ","_") for c in df.columns]
    if dataset == "school":
        table = "institution"
        if "type" not in df.columns:
            df["type"] = "school"
    elif dataset == "university":
        table = "institution"
        if "type" not in df.columns:
            df["type"] = "university"
    elif dataset == "sports":
        table = "sport_metric"
    else:
        return {"error":"unknown dataset"}
    _upsert(df, table)
    return {"status":"ok","rows":len(df),"table":table}

from .opportunities import router as opp_router
app.include_router(opp_router)
