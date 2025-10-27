-- Create assessments metadata table
CREATE TABLE public.assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL, -- 'GAD-7', 'PHQ-9', 'DASS-21'
  description text,
  questions jsonb NOT NULL,
  scoring_rules jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create assessment results table
CREATE TABLE public.assessment_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type text NOT NULL,
  responses jsonb NOT NULL,
  total_score integer NOT NULL,
  severity_level text NOT NULL,
  interpretation text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create mood calendar entries table (enhanced mood tracking)
CREATE TABLE public.mood_calendar (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_label text NOT NULL,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_hours numeric(3,1),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  notes text,
  activities text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create wellness correlations table (for biomarker/lifestyle tracking)
CREATE TABLE public.wellness_correlations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  biomarkers jsonb, -- {thyroid, blood_sugar, vitamin_d, vitamin_b12, cortisol}
  lifestyle jsonb, -- {sleep_hours, exercise_minutes, water_intake, meditation_minutes}
  mood_score integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_correlations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessments (public read)
CREATE POLICY "Anyone can view assessments"
  ON public.assessments FOR SELECT
  USING (true);

-- RLS Policies for assessment_results
CREATE POLICY "Users can view their own assessment results"
  ON public.assessment_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment results"
  ON public.assessment_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment results"
  ON public.assessment_results FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for mood_calendar
CREATE POLICY "Users can view their own mood calendar"
  ON public.mood_calendar FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood entries"
  ON public.mood_calendar FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
  ON public.mood_calendar FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON public.mood_calendar FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for wellness_correlations
CREATE POLICY "Users can view their own wellness data"
  ON public.wellness_correlations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wellness data"
  ON public.wellness_correlations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness data"
  ON public.wellness_correlations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_assessment_results_updated_at
  BEFORE UPDATE ON public.assessment_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mood_calendar_updated_at
  BEFORE UPDATE ON public.mood_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert validated assessment templates
INSERT INTO public.assessments (name, type, description, questions, scoring_rules) VALUES
(
  'Generalized Anxiety Disorder Assessment',
  'GAD-7',
  'A brief clinical measure for assessing generalized anxiety disorder.',
  '[
    {"id": 1, "text": "Feeling nervous, anxious, or on edge"},
    {"id": 2, "text": "Not being able to stop or control worrying"},
    {"id": 3, "text": "Worrying too much about different things"},
    {"id": 4, "text": "Trouble relaxing"},
    {"id": 5, "text": "Being so restless that it is hard to sit still"},
    {"id": 6, "text": "Becoming easily annoyed or irritable"},
    {"id": 7, "text": "Feeling afraid, as if something awful might happen"}
  ]'::jsonb,
  '{
    "scale": ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    "points": [0, 1, 2, 3],
    "ranges": [
      {"min": 0, "max": 4, "level": "Minimal anxiety", "interpretation": "Your anxiety levels are minimal. Continue with your wellness practices."},
      {"min": 5, "max": 9, "level": "Mild anxiety", "interpretation": "You''re experiencing mild anxiety. Consider incorporating stress-reduction exercises and mindfulness practices."},
      {"min": 10, "max": 14, "level": "Moderate anxiety", "interpretation": "Your anxiety is at a moderate level. Regular meditation, breathing exercises, and journaling may help. Consider speaking with a mental health professional."},
      {"min": 15, "max": 21, "level": "Severe anxiety", "interpretation": "You''re experiencing severe anxiety. We strongly recommend consulting with a mental health professional for personalized support."}
    ]
  }'::jsonb
),
(
  'Patient Health Questionnaire',
  'PHQ-9',
  'A multipurpose instrument for screening, diagnosing, monitoring and measuring depression severity.',
  '[
    {"id": 1, "text": "Little interest or pleasure in doing things"},
    {"id": 2, "text": "Feeling down, depressed, or hopeless"},
    {"id": 3, "text": "Trouble falling or staying asleep, or sleeping too much"},
    {"id": 4, "text": "Feeling tired or having little energy"},
    {"id": 5, "text": "Poor appetite or overeating"},
    {"id": 6, "text": "Feeling bad about yourself or that you are a failure"},
    {"id": 7, "text": "Trouble concentrating on things"},
    {"id": 8, "text": "Moving or speaking slowly, or being fidgety or restless"},
    {"id": 9, "text": "Thoughts that you would be better off dead, or of hurting yourself"}
  ]'::jsonb,
  '{
    "scale": ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    "points": [0, 1, 2, 3],
    "ranges": [
      {"min": 0, "max": 4, "level": "Minimal depression", "interpretation": "You''re showing minimal signs of depression. Keep up your wellness routine and stay connected with support systems."},
      {"min": 5, "max": 9, "level": "Mild depression", "interpretation": "You''re experiencing mild depression. Focus on self-care, regular exercise, and meaningful activities. Track your mood daily."},
      {"min": 10, "max": 14, "level": "Moderate depression", "interpretation": "Your depression is at a moderate level. Consider professional support alongside your wellness practices. Regular therapy can be very helpful."},
      {"min": 15, "max": 19, "level": "Moderately severe depression", "interpretation": "You''re experiencing moderately severe depression. Professional treatment is recommended. Medication and therapy combined often work best."},
      {"min": 20, "max": 27, "level": "Severe depression", "interpretation": "You''re experiencing severe depression. Please seek immediate professional help. You deserve support, and effective treatments are available."}
    ]
  }'::jsonb
),
(
  'Depression Anxiety Stress Scale',
  'DASS-21',
  'A set of three self-report scales designed to measure depression, anxiety and stress.',
  '[
    {"id": 1, "text": "I found it hard to wind down", "subscale": "stress"},
    {"id": 2, "text": "I was aware of dryness of my mouth", "subscale": "anxiety"},
    {"id": 3, "text": "I could not seem to experience any positive feeling at all", "subscale": "depression"},
    {"id": 4, "text": "I experienced breathing difficulty", "subscale": "anxiety"},
    {"id": 5, "text": "I found it difficult to work up the initiative to do things", "subscale": "depression"},
    {"id": 6, "text": "I tended to over-react to situations", "subscale": "stress"},
    {"id": 7, "text": "I experienced trembling (e.g., in the hands)", "subscale": "anxiety"},
    {"id": 8, "text": "I felt that I was using a lot of nervous energy", "subscale": "stress"},
    {"id": 9, "text": "I was worried about situations in which I might panic", "subscale": "anxiety"},
    {"id": 10, "text": "I felt that I had nothing to look forward to", "subscale": "depression"},
    {"id": 11, "text": "I found myself getting agitated", "subscale": "stress"},
    {"id": 12, "text": "I found it difficult to relax", "subscale": "stress"},
    {"id": 13, "text": "I felt down-hearted and blue", "subscale": "depression"},
    {"id": 14, "text": "I was intolerant of anything that kept me from getting on with what I was doing", "subscale": "stress"},
    {"id": 15, "text": "I felt I was close to panic", "subscale": "anxiety"},
    {"id": 16, "text": "I was unable to become enthusiastic about anything", "subscale": "depression"},
    {"id": 17, "text": "I felt I was not worth much as a person", "subscale": "depression"},
    {"id": 18, "text": "I felt that I was rather touchy", "subscale": "stress"},
    {"id": 19, "text": "I was aware of the action of my heart in the absence of physical exertion", "subscale": "anxiety"},
    {"id": 20, "text": "I felt scared without any good reason", "subscale": "anxiety"},
    {"id": 21, "text": "I felt that life was meaningless", "subscale": "depression"}
  ]'::jsonb,
  '{
    "scale": ["Did not apply to me at all", "Applied to me to some degree", "Applied to me a considerable degree", "Applied to me very much"],
    "points": [0, 1, 2, 3],
    "subscales": {
      "depression": {"multiplier": 2, "ranges": [
        {"min": 0, "max": 9, "level": "Normal"},
        {"min": 10, "max": 13, "level": "Mild"},
        {"min": 14, "max": 20, "level": "Moderate"},
        {"min": 21, "max": 27, "level": "Severe"},
        {"min": 28, "max": 42, "level": "Extremely Severe"}
      ]},
      "anxiety": {"multiplier": 2, "ranges": [
        {"min": 0, "max": 7, "level": "Normal"},
        {"min": 8, "max": 9, "level": "Mild"},
        {"min": 10, "max": 14, "level": "Moderate"},
        {"min": 15, "max": 19, "level": "Severe"},
        {"min": 20, "max": 42, "level": "Extremely Severe"}
      ]},
      "stress": {"multiplier": 2, "ranges": [
        {"min": 0, "max": 14, "level": "Normal"},
        {"min": 15, "max": 18, "level": "Mild"},
        {"min": 19, "max": 25, "level": "Moderate"},
        {"min": 26, "max": 33, "level": "Severe"},
        {"min": 34, "max": 42, "level": "Extremely Severe"}
      ]}
    }
  }'::jsonb
);