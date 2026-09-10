-- Practice Rooms for Study Buddy virtual pairing
CREATE TABLE IF NOT EXISTS public.practice_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text NOT NULL,
  participant_1 text NOT NULL,
  participant_2 text,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS practice_rooms_code_idx ON public.practice_rooms (room_code);
CREATE INDEX IF NOT EXISTS practice_rooms_p1_idx ON public.practice_rooms (participant_1);
CREATE INDEX IF NOT EXISTS practice_rooms_p2_idx ON public.practice_rooms (participant_2);
CREATE INDEX IF NOT EXISTS practice_rooms_status_idx ON public.practice_rooms (status);

GRANT ALL ON public.practice_rooms TO service_role;
GRANT SELECT ON public.practice_rooms TO authenticated;

ALTER TABLE public.practice_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on practice_rooms" ON public.practice_rooms
FOR ALL TO service_role USING (true) WITH CHECK (true);
