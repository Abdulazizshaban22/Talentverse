import argparse, os, csv, sys, json
from datetime import datetime, timedelta

"""
Builds judgments.tsv from real interactions table.
Heuristics:
- click=1, like/comment=2, apply/enroll=3 (+ dwell bonus if dwell_ms>3s).
- Group by (query placeholder "data", doc_id), take max grade.
You can adapt to your query → doc mapping by storing query strings in your logs.
"""

ACTION_GRADE = {'click':1,'like':2,'comment':2,'apply':3,'enroll':3}

def from_postgres(conn_str, domain, out_path, days=30):
    try:
        import psycopg2
    except Exception:
        print("Install psycopg2 to pull from Postgres, or provide --csv", file=sys.stderr); sys.exit(2)
    q = """
    select doc_id, action, dwell_ms
    from interactions
    where domain=%s and occurred_at > now() - interval '%s days'
    """
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    cur.execute(q, (domain, days))
    rows = cur.fetchall()
    grades = {}
    for doc_id, action, dwell_ms in rows:
        g = ACTION_GRADE.get(action, 0)
        if dwell_ms and dwell_ms >= 3000: g = max(g, 2)
        grades[doc_id] = max(grades.get(doc_id, 0), g)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        for doc, g in grades.items():
            f.write(f"data\t{doc}\t{g}\n")
    cur.close(); conn.close()
    print("Wrote", out_path)

def from_csv(csv_path, domain, out_path):
    grades = {}
    with open(csv_path, 'r', encoding='utf-8') as f:
        r = csv.DictReader(f)
        for row in r:
            if row.get('domain')!=domain: continue
            g = ACTION_GRADE.get(row.get('action',''), 0)
            try:
                dwell = int(row.get('dwell_ms') or 0)
            except: dwell = 0
            if dwell >= 3000: g = max(g, 2)
            doc = row.get('doc_id')
            if doc: grades[doc] = max(grades.get(doc,0), g)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        for doc, g in grades.items():
            f.write(f"data\t{doc}\t{g}\n")
    print("Wrote", out_path)

if __name__=='__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--domain', required=True, choices=['posts','people','jobs','courses'])
    ap.add_argument('--out', required=True)
    ap.add_argument('--pg', help='psycopg2 conn string (host= dbname= user= password=)')
    ap.add_argument('--csv', help='CSV fallback path with columns: domain,doc_id,action,dwell_ms')
    args = ap.parse_args()
    if args.pg:
        from_postgres(args.pg, args.domain, args.out)
    elif args.csv:
        from_csv(args.csv, args.domain, args.out)
    else:
        print("Provide --pg or --csv", file=sys.stderr); sys.exit(1)
