import { Router } from 'express'
export const router=Router();
router.get('/',(_q,r)=>r.json({ok:true,ts:Date.now(),v:'9.4'}));
