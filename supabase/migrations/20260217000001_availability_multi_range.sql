-- Migration: Allow multiple time ranges per day
-- Drops the one-range-per-day constraint to support split schedules (e.g., 9-12 and 1-5)

-- Remove the single-range-per-day constraint
ALTER TABLE public.availability
  DROP CONSTRAINT availability_user_id_day_of_week_key;

-- Ensure start_time is always before end_time
ALTER TABLE public.availability
  ADD CONSTRAINT availability_time_order_check
  CHECK (start_time < end_time);

-- Add a non-unique index for efficient lookups (replaces the implicit unique index)
CREATE INDEX IF NOT EXISTS availability_user_day_idx
  ON public.availability (user_id, day_of_week);
