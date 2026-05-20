# LTR (LightGBM LambdaMART)
- Train with `services/ltr-trainer/train.py` using CSV: qid,label,f1..fn
- Serve with `services/ai-match` by placing model at `/models/model_ltr.pkl` (or env `LTR_MODEL_PATH`).
