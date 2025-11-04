-- Create transaction tracking table for idempotency
CREATE TABLE IF NOT EXISTS public.activity_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_activity_per_minute UNIQUE (user_id, activity_type, created_at)
);

-- Enable RLS
ALTER TABLE public.activity_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own transactions"
  ON public.activity_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_activity_transactions_user_created 
  ON public.activity_transactions(user_id, created_at DESC);

-- Atomic journal creation with points (idempotent)
CREATE OR REPLACE FUNCTION public.create_journal_and_award(
  _user_id UUID,
  _mood TEXT,
  _content TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_journal_id UUID;
  points_to_award INTEGER := 5;
  transaction_id UUID;
  new_total INTEGER;
  last_journal_time TIMESTAMPTZ;
BEGIN
  -- Validate caller
  IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only create your own journals';
  END IF;
  
  -- Rate limit: max 1 journal per minute
  SELECT MAX(created_at) INTO last_journal_time
  FROM journal_entries
  WHERE user_id = _user_id
    AND created_at > NOW() - INTERVAL '1 minute';
  
  IF last_journal_time IS NOT NULL THEN
    RAISE EXCEPTION 'Please wait before creating another journal entry';
  END IF;
  
  -- Validate input
  IF _mood NOT IN ('joyful', 'calm', 'neutral', 'anxious', 'sad', 'stressed') THEN
    RAISE EXCEPTION 'Invalid mood value';
  END IF;
  
  IF LENGTH(_content) < 1 OR LENGTH(_content) > 5000 THEN
    RAISE EXCEPTION 'Content must be between 1 and 5000 characters';
  END IF;
  
  -- Create journal entry
  INSERT INTO journal_entries (user_id, content, mood_label)
  VALUES (_user_id, _content, _mood)
  RETURNING id INTO new_journal_id;
  
  -- Create transaction record (idempotent via unique constraint)
  BEGIN
    INSERT INTO activity_transactions (user_id, activity_type, points_earned, metadata)
    VALUES (_user_id, 'journal_entry', points_to_award, jsonb_build_object('journal_id', new_journal_id))
    RETURNING id INTO transaction_id;
    
    -- Award points
    UPDATE user_profiles
    SET total_points = total_points + points_to_award,
        updated_at = NOW()
    WHERE user_id = _user_id
    RETURNING total_points INTO new_total;
    
  EXCEPTION WHEN unique_violation THEN
    -- Already awarded for this minute, return existing transaction
    SELECT id INTO transaction_id
    FROM activity_transactions
    WHERE user_id = _user_id 
      AND activity_type = 'journal_entry'
      AND created_at > NOW() - INTERVAL '1 minute'
    ORDER BY created_at DESC
    LIMIT 1;
  END;
  
  RETURN jsonb_build_object(
    'journal_id', new_journal_id,
    'points_earned', points_to_award,
    'total_points', new_total,
    'transaction_id', transaction_id
  );
END;
$$;

-- Atomic exercise completion with points (idempotent)
CREATE OR REPLACE FUNCTION public.complete_exercise_and_award(
  _user_id UUID,
  _exercise_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points_to_award INTEGER;
  transaction_id UUID;
  new_total INTEGER;
  last_exercise_time TIMESTAMPTZ;
BEGIN
  -- Validate caller
  IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only complete your own exercises';
  END IF;
  
  -- Validate exercise type and assign points
  CASE _exercise_type
    WHEN 'breathing_exercise' THEN points_to_award := 10;
    WHEN 'meditation_exercise' THEN points_to_award := 15;
    WHEN 'grounding_exercise' THEN points_to_award := 10;
    WHEN 'progressive_exercise' THEN points_to_award := 20;
    ELSE RAISE EXCEPTION 'Invalid exercise type: %', _exercise_type;
  END CASE;
  
  -- Rate limit: 30 seconds between same exercise type
  SELECT MAX(created_at) INTO last_exercise_time
  FROM activity_transactions
  WHERE user_id = _user_id 
    AND activity_type = _exercise_type
    AND created_at > NOW() - INTERVAL '30 seconds';
  
  IF last_exercise_time IS NOT NULL THEN
    RAISE EXCEPTION 'Please wait before completing this exercise again';
  END IF;
  
  -- Create transaction record (idempotent via unique constraint)
  BEGIN
    INSERT INTO activity_transactions (user_id, activity_type, points_earned)
    VALUES (_user_id, _exercise_type, points_to_award)
    RETURNING id INTO transaction_id;
    
    -- Award points
    UPDATE user_profiles
    SET total_points = total_points + points_to_award,
        updated_at = NOW()
    WHERE user_id = _user_id
    RETURNING total_points INTO new_total;
    
  EXCEPTION WHEN unique_violation THEN
    -- Already awarded, return existing transaction
    SELECT id INTO transaction_id
    FROM activity_transactions
    WHERE user_id = _user_id 
      AND activity_type = _exercise_type
      AND created_at > NOW() - INTERVAL '30 seconds'
    ORDER BY created_at DESC
    LIMIT 1;
  END;
  
  RETURN jsonb_build_object(
    'exercise_type', _exercise_type,
    'points_earned', points_to_award,
    'total_points', new_total,
    'transaction_id', transaction_id,
    'success', true
  );
END;
$$;