-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Users can view all earned badges" ON public.user_badges;

-- Create a restrictive policy: users can only view their own badges
CREATE POLICY "Users can view own badges"
  ON public.user_badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);