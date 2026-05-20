import express from 'express'; const app=express(); app.get('/health',(_r,res)=>res.json({ok:true,v:'2.4'})); app.listen(4000)
