
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi import FastAPI
def setup_metrics(app: FastAPI):
    Instrumentator().instrument(app).expose(app, endpoint="/metrics")
