-- Insert new achievement badges for various activity patterns
INSERT INTO public.badges (name, description, icon, points_required) VALUES
  ('Early Bird', 'Complete 5 activities before 9 AM', '🌅', 50),
  ('Night Owl', 'Complete 5 activities after 9 PM', '🦉', 50),
  ('Zen Master', 'Complete 20 breathing exercises', '🧘', 200),
  ('Journal Keeper', 'Write 30 journal entries', '📔', 300),
  ('Sound Explorer', 'Listen to 15 different sounds', '🎧', 150),
  ('Mood Tracker', 'Log mood for 14 consecutive days', '📊', 140),
  ('Art Therapist', 'Create 10 artworks in CogniArts', '🎨', 100),
  ('Self-Aware', 'Complete all assessment types', '🔮', 250),
  ('Community Star', 'Reach top 10 on leaderboard', '⭐', 500),
  ('Wellness Warrior', 'Earn 1000 total points', '🏆', 1000)
ON CONFLICT DO NOTHING;