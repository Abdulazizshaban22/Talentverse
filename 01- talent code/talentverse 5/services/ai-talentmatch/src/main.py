
from fastapi import FastAPI
from .telemetry import setup_metrics
from .reindex import router as reidx
app = FastAPI(title="TalentMatch — v1.4")
setup_metrics(app)
app.include_router(reidx)

@app.get("/v1/health")
def health():
    return {"ok":True}
