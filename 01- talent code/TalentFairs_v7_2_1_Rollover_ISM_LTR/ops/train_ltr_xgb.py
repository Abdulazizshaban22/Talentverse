"""
Train an XGBoost LTR model (pairwise) from TSV judgments + (mock) feature logs.
Replace load_features() with parsing of your LTR logs from OpenSearch.
Usage: python ops/train_ltr_xgb.py data/ltr/judgments/posts.tsv out/model_posts.json
"""
import sys, json, random
from typing import List, Tuple
try:
    import xgboost as xgb
except Exception:
    print("Install xgboost: pip install xgboost")
    sys.exit(1)

def load_judgments(path:str)->List[Tuple[str,str,int]]:
    rows=[]
    with open(path,'r',encoding='utf-8') as f:
        for line in f:
            parts=line.strip().split('\t')
            if len(parts)!=3: continue
            q,doc,g = parts[0], parts[1], int(parts[2])
            rows.append((q,doc,g))
    return rows

def load_features(query:str, docId:str)->List[float]:
    random.seed(abs(hash(query+docId)) % (2**32-1))
    return [random.random(), random.random(), random.random(), random.random()]

def main():
    if len(sys.argv)<3:
        print("Usage: python ops/train_ltr_xgb.py <judgments.tsv> <output_model.json>")
        sys.exit(1)
    jpath, out = sys.argv[1], sys.argv[2]
    judgments = load_judgments(jpath)
    X=[]; y=[]
    for q,doc,g in judgments:
        X.append(load_features(q,doc)); y.append(g)
    dtrain = xgb.DMatrix(X, label=y)
    params = {"objective":"rank:pairwise","eval_metric":"ndcg","eta":0.1,"max_depth":6}
    model = xgb.train(params, dtrain, num_boost_round=100)
    model.save_model(out)
    print("Saved model to", out)

if __name__=="__main__":
    main()
