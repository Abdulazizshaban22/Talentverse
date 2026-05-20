
import LRU from 'lru-cache';

export interface DecisionKey {
  sub: string;
  resource: string;
  scope: string;
}
export interface DecisionVal {
  allow: boolean;
  exp: number; // epoch seconds
}

const maxAgeMs = 60 * 1000; // default 60s fallback if no exp
export const decisionCache = new LRU<string, DecisionVal>({
  max: 5000,
  allowStale: false,
  ttl: maxAgeMs,
});

export function key(k: DecisionKey){
  return `${k.sub}:${k.resource}:${k.scope}`;
}
