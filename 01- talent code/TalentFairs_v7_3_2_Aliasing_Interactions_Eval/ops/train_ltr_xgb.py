import sys, json, random
try:
    import xgboost as xgb
except Exception:
    print("Install xgboost: pip install xgboost"); sys.exit(1)

def load_judgments(path):
    rows=[]
    with open(path,'r',encoding='utf-8') as f:
        for line in f:
            parts=line.strip().split('\t')
            if len(parts)==3:
                rows.append((parts[0], parts[1], int(parts[2])))
    return rows

def load_features(query, docId):
    # TODO: replace with your real feature extractor from _ltr_log
    random.seed(abs(hash(query+docId)) % (2**32-1))
    return [random.random() for _ in range(16)]

if __name__=='__main__':
    if len(sys.argv)<3: print("Usage: python ops/train_ltr_xgb.py <judgments.tsv> <out_model.json>"); sys.exit(1)
    jpath, out = sys.argv[1], sys.argv[2]
    judg = load_judgments(jpath)
    X=[]; y=[]
    for q,doc,g in judg:
        X.append(load_features(q,doc)); y.append(g)
    dtrain = xgb.DMatrix(X, label=y)
    params = {"objective":"rank:pairwise","eval_metric":"ndcg","eta":0.1,"max_depth":6}
    model = xgb.train(params, dtrain, num_boost_round=80)
    model.save_model(out)
    print("Saved", out)
