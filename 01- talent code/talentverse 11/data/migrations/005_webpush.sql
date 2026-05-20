
CREATE TABLE IF NOT EXISTS push_subscription(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
