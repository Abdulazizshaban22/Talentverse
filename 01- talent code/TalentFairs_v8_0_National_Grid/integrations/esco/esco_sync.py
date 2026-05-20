import json, sys
"""
Load ESCO JSON dump and emit skill rows.
"""
def main(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    n = 0
    for item in data.get('skills', []):
        pref = item.get('preferredLabel', '')
        uri  = item.get('id', '')
        typ  = item.get('skillType', 'skill')
        n += 1
    print({"skills": n})
if __name__=='__main__':
    main(sys.argv[1])
