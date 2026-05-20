# Train LGBMRanker LambdaMART
import pandas as pd, numpy as np, joblib, os
import lightgbm as lgb

def main():
    import argparse
    ap=argparse.ArgumentParser()
    ap.add_argument('--data',required=True)
    ap.add_argument('--out',default='/models/model_ltr.pkl')
    args=ap.parse_args()
    df=pd.read_csv(args.data)
    feats=[c for c in df.columns if c.startswith('f')]
    X=df[feats].values
    y=df['label'].values
    qid=df['qid'].values
    _,counts=np.unique(qid,return_counts=True)
    model=lgb.LGBMRanker(objective='lambdarank',n_estimators=200,learning_rate=0.08)
    model.fit(X,y,group=counts,eval_at=[1,3,5])
    os.makedirs(os.path.dirname(args.out),exist_ok=True)
    joblib.dump(model,args.out)
    print('saved',args.out)

if __name__=='__main__':
    main()
