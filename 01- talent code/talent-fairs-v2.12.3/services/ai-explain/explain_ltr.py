# SHAP explanation for LightGBM model (LambdaRank)
# Requires: lightgbm, shap, numpy
import sys, json, numpy as np
try:
    import lightgbm as lgb
    import shap
except Exception as e:
    print(json.dumps({"ok": False, "error": "missing_deps", "detail": str(e)}))
    sys.exit(0)

payload = json.loads(sys.stdin.read())
feat = np.array([payload.get("features", [])], dtype=float)
model_path = payload.get("modelPath", "./models/ranker/model.txt")

try:
    model = lgb.Booster(model_file=model_path)
except Exception as e:
    print(json.dumps({"ok": False, "error": "load_model_failed", "detail": str(e), "modelPath": model_path}))
    sys.exit(0)

explainer = shap.TreeExplainer(model)
vals = explainer.shap_values(feat)
vals = vals.tolist()[0] if isinstance(vals, list) else vals[0].tolist()
print(json.dumps({"ok": True, "shap": vals, "features": payload.get("features", [])}))
