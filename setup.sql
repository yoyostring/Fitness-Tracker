-- Complete SQL setup for Fitness Tracker
-- Run this in Supabase SQL Editor

-- 1. Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets_x_reps TEXT NOT NULL,
  weight NUMERIC,
  muscle_group TEXT NOT NULL
);

-- 3. Create food_entries table
CREATE TABLE IF NOT EXISTS food_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories INT NOT NULL,
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fat NUMERIC DEFAULT 0,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create weekly_plans table
CREATE TABLE IF NOT EXISTS weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  monday_morning TEXT,
  monday_evening TEXT,
  tuesday_morning TEXT,
  tuesday_evening TEXT,
  wednesday_morning TEXT,
  wednesday_evening TEXT,
  thursday_morning TEXT,
  thursday_evening TEXT,
  friday_morning TEXT,
  friday_evening TEXT,
  saturday_morning TEXT,
  saturday_evening TEXT,
  sunday_morning TEXT,
  sunday_evening TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for workouts
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Create RLS Policies for workout_exercises
CREATE POLICY "Users can view own exercises" ON workout_exercises
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM workouts WHERE id = workout_id)
  );

CREATE POLICY "Users can insert own exercises" ON workout_exercises
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM workouts WHERE id = workout_id)
  );

CREATE POLICY "Users can update own exercises" ON workout_exercises
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM workouts WHERE id = workout_id)
  );

CREATE POLICY "Users can delete own exercises" ON workout_exercises
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM workouts WHERE id = workout_id)
  );

-- 8. Create RLS Policies for food_entries
CREATE POLICY "Users can view own food entries" ON food_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food entries" ON food_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food entries" ON food_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food entries" ON food_entries
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Create RLS Policies for weekly_plans
CREATE POLICY "Users can view own weekly plans" ON weekly_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly plans" ON weekly_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly plans" ON weekly_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly plans" ON weekly_plans
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Get your user ID (replace with your actual email)
SELECT id, email FROM auth.users WHERE email = 'andrewxiaotoo@gmail.com';

-- 11. Insert your static workout plan (replace USER_ID with your actual UUID from step 10)
-- This converts your static PPL plan to dynamic database data
INSERT INTO weekly_plans (
  user_id,
  plan_name,
  monday_morning,
  monday_evening,
  tuesday_morning,
  tuesday_evening,
  wednesday_morning,
  wednesday_evening,
  thursday_morning,
  thursday_evening,
  friday_morning,
  friday_evening,
  saturday_morning,
  saturday_evening,
  sunday_morning,
  sunday_evening
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with your actual user ID from step 10
  'PPL Split',
  'Upper day',
  '[-]',
  'Lower day',
  '[-]',
  'Rest day',
  '[-]',
  'Push day',
  '[-]',
  'Pull day',
  '[-]',
  'Legs day',
  '[-]',
  'Rest day',
  '[-]'
);

-- 12. Insert your static workout exercises (replace USER_ID with your actual UUID)
-- This creates a workout for today with all your exercises
INSERT INTO workouts (user_id, title, performed_at) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with your actual user ID
  'Today''s Plan - Pull Day',
  NOW()
);

-- Get the workout ID that was just created
-- Then insert all the pull day exercises (replace WORKOUT_ID with the actual ID from above)
INSERT INTO workout_exercises (workout_id, name, sets_x_reps, weight, muscle_group) VALUES
  ('WORKOUT_ID_HERE', 'Lat Pulldown', '3x8', 120, 'Upper back / Lats'),
  ('WORKOUT_ID_HERE', 'Seated incline row', '3x8', 130, 'Upper back'),
  ('WORKOUT_ID_HERE', 'Seated cable row', '3x8', 100, 'Middle back'),
  ('WORKOUT_ID_HERE', 'Preacher / Cable bicep curl', '3x8', 35, 'Biceps'),
  ('WORKOUT_ID_HERE', 'Hammer curl', '3x8', 30, 'Long bicep head');

-- 13. Verify your data
SELECT * FROM weekly_plans WHERE user_id = 'YOUR_USER_ID_HERE';
SELECT * FROM workouts WHERE user_id = 'YOUR_USER_ID_HERE';
SELECT * FROM workout_exercises WHERE workout_id IN (
  SELECT id FROM workouts WHERE user_id = 'YOUR_USER_ID_HERE'
);
SELECT * FROM food_entries WHERE user_id = 'YOUR_USER_ID_HERE';
