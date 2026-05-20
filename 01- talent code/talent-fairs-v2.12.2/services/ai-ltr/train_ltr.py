# LightGBM LambdaRank training reference
# pip install lightgbm pandas numpy scikit-learn
import json, argparse, numpy as np, pandas as pd, lightgbm as lgb

p = argparse.ArgumentParser()
p.add_argument('--data', required=True)
p.add_argument('--out', required=True)
a = p.parse_args()

rows = [json.loads(l) for l in open(a.data, 'r', encoding='utf-8').read().splitlines() if l.strip()]
X = np.array([r['features'] for r in rows], dtype=float)
y = np.array([r['label'] for r in rows], dtype=float)
# group by qid
qids = [r['qid'] for r in rows]
_, counts = np.unique(qids, return_counts=True)
train = lgb.Dataset(X, label=y, group=counts.tolist())

params = dict(objective='lambdarank', metric='ndcg', ndcg_eval_at=[5,10], learning_rate=0.1, num_leaves=31)
gbm = lgb.train(params, train, num_boost_round=200)
gbm.save_model(a.out)
print('Saved', a.out)
