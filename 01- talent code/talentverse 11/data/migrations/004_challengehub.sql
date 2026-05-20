
CREATE TABLE IF NOT EXISTS challenge(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  max_participants INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS submission(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenge(id) ON DELETE CASCADE,
  person_id UUID REFERENCES person(id) ON DELETE CASCADE,
  score DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);
