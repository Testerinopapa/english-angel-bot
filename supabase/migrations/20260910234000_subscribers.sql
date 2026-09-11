-- Subscribers table for WhatsApp Paywall & Entitlements
CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'trial',
  plan text NOT NULL DEFAULT 'free_trial',
  trial_started_at timestamptz NOT NULL DEFAULT now(),
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  subscription_ends_at timestamptz,
  messages_count integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscribers_phone_idx ON public.subscribers (phone_number);
CREATE INDEX IF NOT EXISTS subscribers_status_idx ON public.subscribers (status);

GRANT ALL ON public.subscribers TO service_role;
GRANT SELECT, UPDATE, INSERT ON public.subscribers TO authenticated;

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on subscribers" ON public.subscribers
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins full access on subscribers" ON public.subscribers
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
