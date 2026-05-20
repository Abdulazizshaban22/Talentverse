
import { collectDefaultMetrics, Registry } from 'prom-client';
const register = new Registry();
collectDefaultMetrics({ register });
export function metricsHandler(req:any, res:any){
  res.set('Content-Type', register.contentType);
  register.metrics().then((m)=>res.end(m));
}
