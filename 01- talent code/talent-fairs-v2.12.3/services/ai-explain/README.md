## AI Explain — SHAP for LightGBM Ranker
يتطلب: Python + lightgbm + shap + numpy

### مثال تشغيل
```bash
echo '{"features":[0.8,0.2,0.4],"modelPath":"./models/ranker/model.txt"}' | python services/ai-explain/explain_ltr.py
```
