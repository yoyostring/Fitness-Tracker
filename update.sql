-- Minimal update script - only adds what's missing
-- Run this in Supabase SQL Editor

-- 1. Check what tables you already have
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('workouts', 'workout_exercises', 'food_entries', 'weekly_plans');

-- 2. Only create tables that don't exist (these will be skipped if they already exist)
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets_x_reps TEXT NOT NULL,
  weight NUMERIC,
  muscle_group TEXT NOT NULL
);

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

-- 3. Enable RLS (safe to run multiple times)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;

-- 4. Check what policies you already have
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('workouts', 'workout_exercises', 'food_entries', 'weekly_plans');

-- 5. Only create policies that don't exist (these will fail if they already exist, which is fine)
-- Workouts policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own workouts') THEN
        CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own workouts') THEN
        CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own workouts') THEN
        CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own workouts') THEN
        CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Similar blocks for other tables...
-- (I'll provide a simpler approach below)

-- 6. Get your user ID
SELECT id, email FROM auth.users WHERE email = 'andrewxiaotoo@gmail.com';

-- 7. Check if you already have a weekly plan
SELECT * FROM weekly_plans WHERE user_id = 'YOUR_USER_ID_HERE';

-- 8. Only insert weekly plan if you don't have one
INSERT INTO weekly_plans (
  user_id, plan_name,
  monday_morning, monday_evening,
  tuesday_morning, tuesday_evening,
  wednesday_morning, wednesday_evening,
  thursday_morning, thursday_evening,
  friday_morning, friday_evening,
  saturday_morning, saturday_evening,
  sunday_morning, sunday_evening
) 
SELECT 
  'YOUR_USER_ID_HERE', 'PPL Split',
  'Upper day', '[-]',
  'Lower day', '[-]',
  'Rest day', '[-]',
  'Push day', '[-]',
  'Pull day', '[-]',
  'Legs day', '[-]',
  'Rest day', '[-]'
WHERE NOT EXISTS (
  SELECT 1 FROM weekly_plans WHERE user_id = 'YOUR_USER_ID_HERE'
);

-- 9. Verify your data
SELECT 'weekly_plans' as table_name, count(*) as count FROM weekly_plans WHERE user_id = 'YOUR_USER_ID_HERE'
UNION ALL
SELECT 'workouts', count(*) FROM workouts WHERE user_id = 'YOUR_USER_ID_HERE'
UNION ALL
SELECT 'workout_exercises', count(*) FROM workout_exercises WHERE workout_id IN (
  SELECT id FROM workouts WHERE user_id = 'YOUR_USER_ID_HERE'
)
UNION ALL
SELECT 'food_entries', count(*) FROM food_entries WHERE user_id = 'YOUR_USER_ID_HERE';
