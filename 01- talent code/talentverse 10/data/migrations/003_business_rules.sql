
-- Cross-table business rules for opportunities
ALTER TABLE IF EXISTS emb_opportunity_v2 ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE IF EXISTS emb_opportunity_v2 ADD COLUMN IF NOT EXISTS min_age INT;
ALTER TABLE IF EXISTS emb_opportunity_v2 ADD COLUMN IF NOT EXISTS max_age INT;

-- Helper function: compute age in years (approx by year diff)
CREATE OR REPLACE FUNCTION tv_age_years(birthdate DATE) RETURNS INT AS $$
  SELECT EXTRACT(YEAR FROM age(current_date, birthdate))::INT;
$$ LANGUAGE sql IMMUTABLE;
