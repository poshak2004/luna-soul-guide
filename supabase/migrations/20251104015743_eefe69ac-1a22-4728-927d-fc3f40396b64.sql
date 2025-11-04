-- Fix Security Definer Functions: Add auth validation
-- This prevents users from manipulating other users' data

CREATE OR REPLACE FUNCTION public.add_user_points(_user_id uuid, _activity_type text, _points integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total INTEGER;
BEGIN
  -- CRITICAL: Validate caller identity
  IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only modify your own data';
  END IF;
  
  -- Validate points (prevent negative or excessive points)
  IF _points <= 0 OR _points > 100 THEN
    RAISE EXCEPTION 'Invalid points value: %', _points;
  END IF;
  
  -- Insert activity
  INSERT INTO user_activities (user_id, activity_type, points_earned)
  VALUES (_user_id, _activity_type, _points);
  
  -- Atomically update and return new total
  UPDATE user_profiles
  SET total_points = total_points + _points,
      updated_at = NOW()
  WHERE user_id = _user_id
  RETURNING total_points INTO new_total;
  
  -- If no profile exists, return error
  IF new_total IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'total_points', new_total,
    'points_earned', _points
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_exercise(_user_id uuid, _exercise_type text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_completion TIMESTAMP;
  points INTEGER;
  result JSONB;
BEGIN
  -- CRITICAL: Validate caller identity
  IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only complete your own exercises';
  END IF;
  
  -- Validate exercise type and assign points
  CASE _exercise_type
    WHEN 'breathing_exercise' THEN points := 10;
    WHEN 'meditation_exercise' THEN points := 15;
    WHEN 'grounding_exercise' THEN points := 10;
    WHEN 'progressive_exercise' THEN points := 20;
    ELSE RAISE EXCEPTION 'Invalid exercise type: %', _exercise_type;
  END CASE;
  
  -- Check cooldown (prevent spam - 30 seconds between same exercise)
  SELECT MAX(completed_at) INTO last_completion
  FROM user_activities
  WHERE user_id = _user_id 
    AND activity_type = _exercise_type
    AND completed_at > NOW() - INTERVAL '30 seconds';
  
  IF last_completion IS NOT NULL THEN
    RAISE EXCEPTION 'Please wait before completing this exercise again';
  END IF;
  
  -- Use the atomic point addition function
  result := add_user_points(_user_id, _exercise_type, points);
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_and_award_badges(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_points INTEGER;
  user_streak INTEGER;
  breathing_count INTEGER;
  meditation_count INTEGER;
  badge_record RECORD;
  awarded_badges JSONB := '[]'::JSONB;
  badge_info JSONB;
BEGIN
  -- CRITICAL: Validate caller identity
  IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only check your own badges';
  END IF;
  
  -- Get user stats
  SELECT total_points, current_streak INTO user_points, user_streak
  FROM user_profiles
  WHERE user_id = _user_id;
  
  IF user_points IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Get activity counts
  SELECT 
    COUNT(*) FILTER (WHERE activity_type = 'breathing_exercise'),
    COUNT(*) FILTER (WHERE activity_type = 'meditation_exercise')
  INTO breathing_count, meditation_count
  FROM user_activities
  WHERE user_id = _user_id;
  
  -- Check each badge
  FOR badge_record IN 
    SELECT b.* FROM badges b
    WHERE NOT EXISTS (
      SELECT 1 FROM user_badges ub 
      WHERE ub.user_id = _user_id AND ub.badge_id = b.id
    )
    ORDER BY b.points_required ASC
  LOOP
    -- Check if user qualifies for this badge
    IF user_points >= badge_record.points_required THEN
      -- Award the badge
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (_user_id, badge_record.id);
      
      -- Add to result
      badge_info := jsonb_build_object(
        'id', badge_record.id,
        'name', badge_record.name,
        'icon', badge_record.icon,
        'description', badge_record.description
      );
      awarded_badges := awarded_badges || badge_info;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'awarded_badges', awarded_badges,
    'total_badges', jsonb_array_length(awarded_badges)
  );
END;
$$;

-- Fix missing search_path on generate_anonymous_username
CREATE OR REPLACE FUNCTION public.generate_anonymous_username()
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  adjectives TEXT[] := ARRAY[
    'Peaceful', 'Calm', 'Bright', 'Gentle', 'Serene', 'Tranquil', 'Quiet', 
    'Mindful', 'Radiant', 'Joyful', 'Wise', 'Swift', 'Noble', 'Brave', 
    'Kind', 'Bold', 'Pure', 'Free', 'Warm', 'Cool', 'Zen', 'Still',
    'Clear', 'Strong', 'Soft', 'Wild', 'True', 'Deep', 'Light', 'Cosmic'
  ];
  nouns TEXT[] := ARRAY[
    'Soul', 'Heart', 'Spirit', 'Wave', 'Cloud', 'Star', 'Moon', 'Sun', 
    'Ocean', 'Mountain', 'River', 'Forest', 'Wind', 'Fire', 'Earth',
    'Sky', 'Dawn', 'Dusk', 'Rain', 'Snow', 'Leaf', 'Seed', 'Root',
    'Path', 'Journey', 'Dream', 'Hope', 'Light', 'Phoenix', 'Dragon'
  ];
  username TEXT;
  random_suffix TEXT;
BEGIN
  random_suffix := LPAD(floor(random() * 999999)::TEXT, 6, '0');
  username := adjectives[floor(random() * array_length(adjectives, 1) + 1)] || 
              nouns[floor(random() * array_length(nouns, 1) + 1)] || 
              random_suffix;
  RETURN username;
END;
$$;

-- Add UPDATE and DELETE policies to conversations table
CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);