-- Sound Therapy table
CREATE TABLE IF NOT EXISTS public.sound_therapy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  moods TEXT[] NOT NULL DEFAULT '{}',
  purposes TEXT[] NOT NULL DEFAULT '{}',
  duration_options INTEGER[] NOT NULL DEFAULT '{60,300,600,1200}', -- seconds: 1m, 5m, 10m, 20m
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('Sleep', 'Focus', 'Meditation', 'Relaxation')),
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User sound session history
CREATE TABLE IF NOT EXISTS public.user_sound_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sound_id UUID NOT NULL REFERENCES public.sound_therapy(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  points_earned INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.sound_therapy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sound_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sound_therapy
CREATE POLICY "Anyone can view sounds"
  ON public.sound_therapy FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert sounds"
  ON public.sound_therapy FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sounds"
  ON public.sound_therapy FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for user_sound_history
CREATE POLICY "Users can view their own sound history"
  ON public.user_sound_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sound history"
  ON public.user_sound_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sound history"
  ON public.user_sound_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_sound_therapy_category ON public.sound_therapy(category);
CREATE INDEX idx_sound_therapy_moods ON public.sound_therapy USING GIN(moods);
CREATE INDEX idx_user_sound_history_user ON public.user_sound_history(user_id, completed_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_sound_therapy_updated_at
  BEFORE UPDATE ON public.sound_therapy
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to complete sound session with points
CREATE OR REPLACE FUNCTION public.complete_sound_session(
  _user_id UUID,
  _sound_id UUID,
  _duration_seconds INTEGER,
  _session_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points_to_award INTEGER := 5;
  transaction_id UUID;
  new_total INTEGER;
BEGIN
  -- Validate caller
  IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only complete your own sessions';
  END IF;
  
  -- Validate session exists and is not already completed
  IF NOT EXISTS (
    SELECT 1 FROM user_sound_history 
    WHERE id = _session_id 
      AND user_id = _user_id 
      AND completed = false
  ) THEN
    RAISE EXCEPTION 'Invalid session or already completed';
  END IF;
  
  -- Mark session as completed
  UPDATE user_sound_history
  SET completed = true,
      completed_at = NOW(),
      points_earned = points_to_award
  WHERE id = _session_id;
  
  -- Increment play count
  UPDATE sound_therapy
  SET play_count = play_count + 1
  WHERE id = _sound_id;
  
  -- Create transaction record
  INSERT INTO activity_transactions (user_id, activity_type, points_earned, metadata)
  VALUES (_user_id, 'sound_session', points_to_award, jsonb_build_object('sound_id', _sound_id, 'duration', _duration_seconds))
  RETURNING id INTO transaction_id;
  
  -- Award points
  UPDATE user_profiles
  SET total_points = total_points + points_to_award,
      updated_at = NOW()
  WHERE user_id = _user_id
  RETURNING total_points INTO new_total;
  
  RETURN jsonb_build_object(
    'success', true,
    'points_earned', points_to_award,
    'total_points', new_total,
    'transaction_id', transaction_id
  );
END;
$$;

-- Storage bucket (will be created if doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('sounds', 'sounds', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for sounds bucket
CREATE POLICY "Public can view sounds"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sounds');

CREATE POLICY "Authenticated users can upload sounds"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sounds' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sounds"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'sounds' AND auth.uid() IS NOT NULL);

-- Seed some initial sounds
INSERT INTO public.sound_therapy (title, description, moods, purposes, category, file_url, duration_options)
VALUES 
  ('Gentle Rain', 'Soft rainfall with distant thunder', ARRAY['calm', 'relaxed'], ARRAY['sleep', 'relaxation'], 'Sleep', 'https://example.com/rain.mp3', ARRAY[60, 300, 600, 1200]),
  ('Ocean Waves', 'Rhythmic waves on a peaceful shore', ARRAY['calm', 'peaceful'], ARRAY['meditation', 'sleep'], 'Meditation', 'https://example.com/ocean.mp3', ARRAY[300, 600, 1200]),
  ('Forest Ambience', 'Birds chirping in a tranquil forest', ARRAY['joyful', 'calm'], ARRAY['focus', 'relaxation'], 'Relaxation', 'https://example.com/forest.mp3', ARRAY[300, 600, 1200]),
  ('White Noise', 'Consistent gentle white noise', ARRAY['neutral'], ARRAY['sleep', 'focus'], 'Focus', 'https://example.com/whitenoise.mp3', ARRAY[300, 600, 1200])
ON CONFLICT DO NOTHING;