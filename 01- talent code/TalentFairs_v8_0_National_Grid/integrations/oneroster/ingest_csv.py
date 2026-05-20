import zipfile, csv, io, sys
"""
Reads a OneRoster CSV zip and prints counts per file.
Wire it to DB/Graph writers in production.
"""
FILES = ["organizations.csv","users.csv","classes.csv","enrollments.csv","academicSessions.csv"]
def main(path):
    with zipfile.ZipFile(path,'r') as z:
        counts = {}
        for name in FILES:
            if name in z.namelist():
                with z.open(name) as f:
                    rows = list(csv.DictReader(io.TextIOWrapper(f, 'utf-8')))
                    counts[name] = len(rows)
        print(counts)
if __name__=='__main__':
    main(sys.argv[1])
