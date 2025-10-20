-- Update schema to support detailed exercises per day
-- Run this in Supabase SQL Editor

-- 1. Create a new table for daily workout exercises
CREATE TABLE IF NOT EXISTS daily_workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_id UUID NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  exercise_name TEXT NOT NULL,
  sets_x_reps TEXT NOT NULL,
  weight NUMERIC,
  muscle_group TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE daily_workout_exercises ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for daily_workout_exercises
CREATE POLICY "Users can view own daily exercises" ON daily_workout_exercises
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM weekly_plans WHERE id = weekly_plan_id)
  );

CREATE POLICY "Users can insert own daily exercises" ON daily_workout_exercises
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM weekly_plans WHERE id = weekly_plan_id)
  );

CREATE POLICY "Users can update own daily exercises" ON daily_workout_exercises
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM weekly_plans WHERE id = weekly_plan_id)
  );

CREATE POLICY "Users can delete own daily exercises" ON daily_workout_exercises
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM weekly_plans WHERE id = weekly_plan_id)
  );

-- 4. Check current structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'weekly_plans' 
ORDER BY ordinal_position;

-- 5. Verify the new table was created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'daily_workout_exercises';
