-- Remove meeting_link column from event_types
ALTER TABLE public.event_types DROP COLUMN IF EXISTS meeting_link;
