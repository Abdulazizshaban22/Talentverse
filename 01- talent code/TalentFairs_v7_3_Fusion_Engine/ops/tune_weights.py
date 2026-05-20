"""Grid tuner for Fusion weights using NDCG@K on a judgments set.
Judgments file format (TSV):
query \t docId \t grade (0..3)

We need two score sources for each (q, doc):
- ltrScore (from OpenSearch logs/model)
- graphScore (from Neo4j) 

In this demo, we synthesize feature tables; replace loaders with your logs.
"""
import sys, itertools, random, math

def dcg(scores):
    return sum(( (2**rel - 1) / math.log2(i+2) for i,rel in enumerate(scores) ))

def ndcg(pred, truth, k=10):
    pred_sorted = sorted(truth, key=lambda d: pred.get(d['doc'],0), reverse=True)[:k]
    dcg_val = dcg([d['grade'] for d in pred_sorted])
    ideal = sorted(truth, key=lambda d: d['grade'], reverse=True)[:k]
    idcg = dcg([d['grade'] for d in ideal]) or 1.0
    return dcg_val / idcg

def load_judgments(path):
    by_query = {}
    with open(path,'r',encoding='utf-8') as f:
        for line in f:
            q,doc,g = line.strip().split('\t')
            by_query.setdefault(q, []).append({'doc':doc,'grade':int(g)})
    return by_query

def load_scores_for_query(q, docs):
    # TODO: replace with real logs lookups
    rng = random.Random(abs(hash(q)) % (2**32-1))
    scores = {}
    for d in docs:
        scores[d] = {'ltr': rng.random(), 'graph': rng.random()}
    return scores

def main():
    if len(sys.argv)<2:
        print('Usage: python ops/tune_weights.py <judgments.tsv>'); sys.exit(1)
    path = sys.argv[1]
    data = load_judgments(path)
    grid = [i/10 for i in range(0,11)]  # 0.0..1.0
    best = (0.0, 0.0, 0.0)  # (score, w_ltr, w_graph)
    for wl in grid:
        wg = 1.0 - wl
        total=0.0; cnt=0
        for q,rows in data.items():
            docs = [r['doc'] for r in rows]
            scores = load_scores_for_query(q, docs)
            fused = { d: scores[d]['ltr']*wl + scores[d]['graph']*wg for d in docs }
            total += ndcg(fused, rows, k=10); cnt += 1
        avg = total / max(cnt,1)
        if avg > best[0]:
            best = (avg, wl, wg)
    print('Best NDCG@10 = %.4f with w_ltr=%.2f w_graph=%.2f' % best)

if __name__=='__main__':
    main()
