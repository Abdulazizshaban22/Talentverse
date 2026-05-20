
-- === EDU ===
INSERT INTO edu_student(national_id, full_name, email, region, college, major, gpa, level)
VALUES 
('101','سارة الشمري','sara@uni.sa','الرياض','علوم','علوم حاسب',4.20,6),
('102','محمد القحطاني','m.q@uni.sa','مكة','هندسة','كهربائية',3.60,8),
('103','نورة الجهني','n.j@uni.sa','الشرقية','إدارة','مالية',4.50,5)
ON CONFLICT (national_id) DO NOTHING;

INSERT INTO edu_program(code, name, level, skills) VALUES
('CS-BSC','بكالوريوس علوم الحاسب','Bachelor',ARRAY['Python','Data Structures','AI']),
('EE-BSC','بكالوريوس هندسة كهربائية','Bachelor',ARRAY['Circuits','Control','Matlab']),
('FIN-BSC','بكالوريوس مالية','Bachelor',ARRAY['Accounting','Excel','Analysis'])
ON CONFLICT (code) DO NOTHING;

-- enrollments will need IDs; simplified: skip due to UUID lookups in demo

-- === SPORTS ===
INSERT INTO sport_athlete(full_name, region, sport, dominant_hand)
VALUES
('أحمد الرياضي','الشرقية','سباقات','right'),
('ريم العداءة','الرياض','سباقات','left')
ON CONFLICT DO NOTHING;

-- === HR ===
INSERT INTO hr_employee(national_id, full_name, email, region, title, grade, department)
VALUES
('201','نورة المطيري','noura@org.gov.sa','مكة','محلل بيانات','G7','التحول الرقمي'),
('202','عبدالله الحربي','abdullah@org.gov.sa','الرياض','مهندس منصات','G8','البنية التحتية')
ON CONFLICT (national_id) DO NOTHING;

INSERT INTO hr_performance(employee_nid, period, score, notes) VALUES
('201','2025H1',4.4,'أداء ممتاز'),
('202','2025H1',4.1,'هدف OKR محقق')
ON CONFLICT (employee_nid, period) DO NOTHING;

-- Optionally seed a few opportunities with salaries
ALTER TABLE emb_opportunity_v2
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS salary_min NUMERIC,
  ADD COLUMN IF NOT EXISTS salary_max NUMERIC,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'SAR';

-- minimal rows if table exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='emb_opportunity_v2') THEN
    INSERT INTO emb_opportunity_v2(id, name, region, salary_min, salary_max, currency)
    VALUES
    (gen_random_uuid(),'Software Intern','الرياض',6000,8000,'SAR'),
    (gen_random_uuid(),'Electrical Engineer Trainee','الشرقية',7000,9000,'SAR')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
