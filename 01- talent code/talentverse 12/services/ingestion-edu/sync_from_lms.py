
import os, requests, json
from connectors import moodle, blackboard

ING_API = os.getenv("ING_EDU_API", "http://localhost:8060")
API_KEY = os.getenv("INGESTION_API_KEY","changeme")

def push_students(students):
    url = f"{ING_API}/v1/edu/students"
    r = requests.post(url, headers={"x-api-key": API_KEY, "content-type":"application/json"}, data=json.dumps(students), timeout=30)
    r.raise_for_status(); return r.json()

def sync_moodle_emails(emails):
    students = moodle.fetch_students_by_email(emails)
    return push_students(students)

def sync_blackboard(limit=50):
    students = blackboard.fetch_students(limit=limit)
    return push_students(students)

if __name__ == "__main__":
    print(sync_moodle_emails(["student1@uni.sa","student2@uni.sa"]))
    print(sync_blackboard(10))
