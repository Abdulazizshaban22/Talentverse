
CREATE TABLE IF NOT EXISTS team(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution_id UUID REFERENCES institution(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS team_member(
  team_id UUID REFERENCES team(id) ON DELETE CASCADE,
  person_id UUID REFERENCES person(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  PRIMARY KEY (team_id, person_id)
);
CREATE TABLE IF NOT EXISTS round(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenge(id) ON DELETE CASCADE,
  round_no INT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ
);
ALTER TABLE submission ADD COLUMN IF NOT EXISTS round_id UUID REFERENCES round(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS rubric(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenge(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rubric_item(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id UUID REFERENCES rubric(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  weight NUMERIC DEFAULT 1.0
);
CREATE TABLE IF NOT EXISTS review(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submission(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES person(id) ON DELETE SET NULL,
  scores JSONB NOT NULL, -- { item_id: numeric }
  total NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
