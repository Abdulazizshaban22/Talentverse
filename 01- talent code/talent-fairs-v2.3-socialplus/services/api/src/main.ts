import express from 'express'; const app=express(); app.get('/health',(_r,res)=>res.json({ok:true})); app.listen(4000)
