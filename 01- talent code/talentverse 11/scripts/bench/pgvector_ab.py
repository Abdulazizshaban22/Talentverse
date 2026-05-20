
import os, time, random, statistics
import psycopg
import numpy as np

DB_URL = os.getenv("DATABASE_URL","postgresql://postgres:postgres@localhost:5432/talentverse")
NQ = int(os.getenv("NQ","100"))  # number of queries
K = int(os.getenv("TOPK","10"))
PROBES = int(os.getenv("PROBES","10"))

def run_query(cur, vec, use_index=True):
    # Control planner to force index or seq scan for ground truth
    if use_index:
        cur.execute("SET enable_seqscan = off; SET enable_bitmapscan = on; SET enable_indexscan = on;")
    else:
        cur.execute("SET enable_seqscan = on; SET enable_bitmapscan = off; SET enable_indexscan = off;")
    cur.execute("SET ivfflat.probes = %s;", (PROBES,))
    t0 = time.perf_counter()
    cur.execute("SELECT id, 1 - (embedding <=> %s) AS sim FROM emb_opportunity_v2 ORDER BY embedding <=> %s LIMIT %s", (vec.tolist(), vec.tolist(), K))
    rows = cur.fetchall()
    dt = (time.perf_counter()-t0)*1000.0
    return rows, dt

def main():
    rng = np.random.default_rng(42)
    with psycopg.connect(DB_URL) as con:
        with con.cursor() as cur:
            # sample some existing vectors to use as queries
            cur.execute("SELECT embedding FROM emb_opportunity_v2 WHERE embedding IS NOT NULL LIMIT 1000")
            base = [np.array(r[0], dtype=np.float32) for r in cur.fetchall()]
            if not base: 
                print("No vectors found in emb_opportunity_v2"); return
            lat_idx, lat_gt, recalls = [], [], []
            for i in range(NQ):
                q = base[rng.integers(0,len(base))]
                idx_rows, t1 = run_query(cur, q, use_index=True)
                gt_rows, t2 = run_query(cur, q, use_index=False)
                lat_idx.append(t1); lat_gt.append(t2)
                idx_set = {r[0] for r in idx_rows}
                gt_set = {r[0] for r in gt_rows}
                inter = len(idx_set & gt_set)
                recalls.append(inter / max(1,len(gt_set)))
            def pct(arr, p): return round(np.percentile(np.array(arr), p),2)
            print("INDEX p50/p95 ms:", pct(lat_idx,50), pct(lat_idx,95), "GT p50/p95:", pct(lat_gt,50), pct(lat_gt,95))
            print("Recall@%d avg=%.3f" % (K, sum(recalls)/len(recalls)))
if __name__ == "__main__":
    main()
