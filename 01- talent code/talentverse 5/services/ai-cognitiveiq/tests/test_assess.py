
from fastapi.testclient import TestClient
from src.main import app

def test_assess():
    c = TestClient(app)
    resp = c.post("/v1/assess/run", json={"answers":[1,0,1,1]})
    assert resp.status_code == 200
    assert "scores" in resp.json()
