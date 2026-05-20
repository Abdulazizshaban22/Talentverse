
from fastapi.testclient import TestClient
from src.main import app

def test_recommend():
    c = TestClient(app)
    resp = c.post("/v1/career/recommend", json={"interests":["AI"]})
    assert resp.status_code == 200
    assert "topN" in resp.json()
