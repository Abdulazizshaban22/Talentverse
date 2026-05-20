
import os, requests
MOODLE_BASE = os.getenv("MOODLE_BASE")  # e.g., https://moodle.example.edu
MOODLE_TOKEN = os.getenv("MOODLE_TOKEN")

def _call(function, **params):
    url = f"{MOODLE_BASE}/webservice/rest/server.php"
    q = {"wstoken": MOODLE_TOKEN, "moodlewsrestformat": "json", "wsfunction": function}
    q.update(params)
    r = requests.post(url, data=q, timeout=30)
    r.raise_for_status()
    return r.json()

def fetch_students_by_email(emails):
    users = []
    for email in emails:
        data = _call("core_user_get_users_by_field", field="email", values=[email])
        users.extend(data)
    return [{
        "full_name": f"{u.get('firstname','')} {u.get('lastname','')}".strip(),
        "email": u.get("email"), "region": None, "college": None, "major": None, "gpa": None, "level": None
    } for u in users]

def fetch_courses():
    return _call("core_course_get_courses")
