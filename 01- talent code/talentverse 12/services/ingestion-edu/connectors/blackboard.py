
import os, requests
BB_BASE = os.getenv("BB_BASE")  # https://blackboard.example.edu/learn/api/public/v1
BB_KEY = os.getenv("BB_KEY"); BB_SECRET = os.getenv("BB_SECRET")
_token = None

def _auth():
    global _token
    r = requests.post(f"{BB_BASE}/oauth2/token", data={"grant_type":"client_credentials"}, auth=(BB_KEY, BB_SECRET))
    r.raise_for_status(); _token = r.json()["access_token"]

def _get(path, params=None):
    if not _token: _auth()
    r = requests.get(f"{BB_BASE}{path}", headers={"Authorization": f"Bearer {_token}"}, params=params or {}, timeout=30)
    if r.status_code==401: _auth(); r = requests.get(f"{BB_BASE}{path}", headers={"Authorization": f"Bearer {_token}"}, params=params or {}, timeout=30)
    r.raise_for_status(); return r.json()

def fetch_students(limit=100):
    js = _get("/users", params={"limit": limit})
    out = []
    for u in js.get("results", []):
        out.append({"full_name": u.get("name",""), "email": u.get("contact",{}).get("email","")})
    return out
