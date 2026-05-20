
import math, sys
def dcg(rels): return sum((2**r - 1) / math.log2(i+2) for i,r in enumerate(rels))
def ndcg_at_k(rels, k=10):
    r = rels[:k]; ideal = sorted(r, reverse=True); 
    return 0.0 if sum(ideal)==0 else dcg(r)/dcg(ideal)
if __name__ == '__main__':
    arr = [int(x) for x in sys.argv[1:]] or [3,2,3,0,1,2]
    print(ndcg_at_k(arr, 10))
