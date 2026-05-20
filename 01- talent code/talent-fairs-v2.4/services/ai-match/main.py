from fastapi import FastAPI
app=FastAPI(title='AI Match')
@app.get('/health')
def h(): return {'ok':True}
