import { Router } from 'express'
export const router=Router();
router.get('/people',(_q,r)=>r.json([]));
router.get('/classes',(_q,r)=>r.json([]));
router.get('/enrollments',(_q,r)=>r.json([]));
router.get('/academicSessions',(_q,r)=>r.json([]));
