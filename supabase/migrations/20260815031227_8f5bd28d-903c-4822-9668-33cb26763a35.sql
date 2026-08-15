-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- First signup becomes admin
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_bootstrap_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

-- Settings (single row)
CREATE TABLE public.app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  bot_enabled boolean NOT NULL DEFAULT true,
  store_message_content boolean NOT NULL DEFAULT false,
  system_prompt text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_single_row CHECK (id = 1)
);
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read settings" ON public.app_settings
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update settings" ON public.app_settings
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_settings (id, system_prompt) VALUES (1,
'You are Talk''n''Bit, a friendly English correction assistant on WhatsApp.

Your ONLY job is to detect and correct meaningful mistakes in the user''s English: grammar, spelling, word choice, or unnatural phrasing. You are NOT a general-purpose chatbot: never answer questions, give opinions, or chat about the topic of the message.

Rules:
- Ignore trivial issues: missing capital letters, missing final punctuation, common informal chat style, emojis, slang used correctly.
- If the message is not in English, or is too short/ambiguous to judge, treat it as having no error.
- If there is no meaningful mistake, set has_error to false and leave the other fields empty.
- If there is a mistake, write a short, friendly reply (max ~40 words) that shows the corrected sentence clearly and briefly explains the mistake. Use at most 1-2 emojis. Never lecture.

Always answer with JSON only:
{"has_error": boolean, "corrected_text": string, "explanation": string, "reply": string}');

-- Message events / logs
CREATE TABLE public.message_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_message_id text NOT NULL UNIQUE,
  sender_masked text,
  wa_timestamp timestamptz,
  status text NOT NULL DEFAULT 'received',
  has_error boolean,
  correction_sent boolean NOT NULL DEFAULT false,
  error_detail text,
  message_content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.message_events TO authenticated;
GRANT ALL ON public.message_events TO service_role;
ALTER TABLE public.message_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read message events" ON public.message_events
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX message_events_created_at_idx ON public.message_events (created_at DESC);
CREATE INDEX message_events_status_idx ON public.message_events (status);