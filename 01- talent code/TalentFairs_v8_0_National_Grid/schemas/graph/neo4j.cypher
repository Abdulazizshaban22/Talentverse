
/* Nodes */
CREATE CONSTRAINT IF NOT EXISTS FOR (t:Tenant) REQUIRE t.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (s:School) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (c:Class)  REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (sk:Skill) REQUIRE sk.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (j:Job)    REQUIRE j.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (cr:Credential) REQUIRE cr.id IS UNIQUE;

/* Relations */
// (Person)-[:ENROLLED_IN {role, since}]->(Class)-[:BELONGS_TO]->(School)
// (Person)-[:HAS_SKILL {level, updated_at}]->(Skill)
// (Person)-[:APPLIED_TO {date, status}]->(Job)
// (Person)-[:EARNED]->(Credential)

// Example:
// MATCH (p:Person {id:'u1'}), (sk:Skill {id:'esco:skill:123'})
// MERGE (p)-[:HAS_SKILL {level:'intermediate', updated_at:datetime()}]->(sk);
