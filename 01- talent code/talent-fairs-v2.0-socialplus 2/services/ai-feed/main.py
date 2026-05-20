from fastapi import FastAPI, Query
app=FastAPI(title='AI Feed')
@app.get('/health')
def h(): return {'ok': True, 'service': 'ai-feed'}
@app.get('/recommend')
def r(userId: str = Query(...), limit: int = 20):
    return {'ok': True, 'userId': userId, 'postIds': []}
