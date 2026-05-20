## AI LTR (LightGBM Ranker)
شغّل التدريب محليًا:
```bash
python services/ai-ltr/train_ltr.py --data ./data/rank/upload_*.jsonl --out ./models/ranker/model.txt
```
يتطلّب: `lightgbm numpy pandas scikit-learn`.
