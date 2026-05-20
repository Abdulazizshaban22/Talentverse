
from fastapi.testclient import TestClient
from src.main import app

def test_match():
    c = TestClient(app)
    resp = c.post("/v1/match", json={"profile":{"skills":["Programming","Math"]},"opportunities":[{"name":"Coding Cup","tags":["programming","algorithms"]}]})
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
