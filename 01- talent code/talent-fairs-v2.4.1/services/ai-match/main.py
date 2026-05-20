from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np, os, joblib
app=FastAPI(title='AI Match (LTR)')
class PredictIn(BaseModel):
    features: List[List[float]]
MODEL_PATH=os.environ.get('LTR_MODEL_PATH','/models/model_ltr.pkl')
_model=None
@app.get('/health')
def h():
    return {'ok':True,'modelLoaded': os.path.exists(MODEL_PATH)}
@app.post('/predict')
def predict(p:PredictIn):
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            return {'ok':False,'error':'model_not_found'}
        _model=joblib.load(MODEL_PATH)
    X=np.array(p.features,dtype=float)
    scores=_model.predict(X)
    return {'ok':True,'scores':scores.tolist()}
