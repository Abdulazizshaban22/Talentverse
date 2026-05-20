
CREATE TABLE IF NOT EXISTS sport_athlete(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  birthdate DATE,
  region TEXT,
  institution_id UUID,
  sport TEXT,
  dominant_hand TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sport_metric(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES sport_athlete(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
