-- Store Google OAuth tokens per user
CREATE TABLE public.google_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expiry timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tokens" ON public.google_tokens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tokens" ON public.google_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tokens" ON public.google_tokens
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tokens" ON public.google_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Track which Google Calendar event corresponds to each booking
ALTER TABLE public.bookings ADD COLUMN google_calendar_event_id text;
