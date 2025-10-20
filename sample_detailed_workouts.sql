-- Insert sample detailed workout data
-- Run this in Supabase SQL Editor after running the schema update

-- First, get your weekly plan ID
SELECT id, plan_name FROM weekly_plans WHERE user_id = '05364273-f4ae-42d7-b477-abb311bc26f8';

-- Insert sample exercises for each day (replace WEEKLY_PLAN_ID with your actual plan ID)
-- Monday - Upper Body
INSERT INTO daily_workout_exercises (weekly_plan_id, day_of_week, exercise_name, sets_x_reps, weight, muscle_group, order_index) VALUES
('YOUR_WEEKLY_PLAN_ID', 'monday', 'Bench Press', '3x8', 135, 'Chest', 1),
('YOUR_WEEKLY_PLAN_ID', 'monday', 'Pull-ups', '3x10', 0, 'Back', 2),
('YOUR_WEEKLY_PLAN_ID', 'monday', 'Overhead Press', '3x8', 95, 'Shoulders', 3),
('YOUR_WEEKLY_PLAN_ID', 'monday', 'Bicep Curls', '3x12', 25, 'Biceps', 4),
('YOUR_WEEKLY_PLAN_ID', 'monday', 'Tricep Dips', '3x12', 0, 'Triceps', 5);

-- Tuesday - Lower Body
INSERT INTO daily_workout_exercises (weekly_plan_id, day_of_week, exercise_name, sets_x_reps, weight, muscle_group, order_index) VALUES
('YOUR_WEEKLY_PLAN_ID', 'tuesday', 'Squats', '4x8', 185, 'Legs', 1),
('YOUR_WEEKLY_PLAN_ID', 'tuesday', 'Deadlifts', '3x5', 225, 'Back', 2),
('YOUR_WEEKLY_PLAN_ID', 'tuesday', 'Lunges', '3x12', 0, 'Legs', 3),
('YOUR_WEEKLY_PLAN_ID', 'tuesday', 'Calf Raises', '3x15', 0, 'Calves', 4);

-- Wednesday - Rest Day
-- No exercises for rest day

-- Thursday - Push Day
INSERT INTO daily_workout_exercises (weekly_plan_id, day_of_week, exercise_name, sets_x_reps, weight, muscle_group, order_index) VALUES
('YOUR_WEEKLY_PLAN_ID', 'thursday', 'Incline Bench Press', '3x8', 125, 'Chest', 1),
('YOUR_WEEKLY_PLAN_ID', 'thursday', 'Shoulder Press', '3x8', 85, 'Shoulders', 2),
('YOUR_WEEKLY_PLAN_ID', 'thursday', 'Dips', '3x10', 0, 'Triceps', 3),
('YOUR_WEEKLY_PLAN_ID', 'thursday', 'Lateral Raises', '3x12', 15, 'Shoulders', 4);

-- Friday - Pull Day
INSERT INTO daily_workout_exercises (weekly_plan_id, day_of_week, exercise_name, sets_x_reps, weight, muscle_group, order_index) VALUES
('YOUR_WEEKLY_PLAN_ID', 'friday', 'Barbell Rows', '3x8', 135, 'Back', 1),
('YOUR_WEEKLY_PLAN_ID', 'friday', 'Lat Pulldowns', '3x10', 120, 'Back', 2),
('YOUR_WEEKLY_PLAN_ID', 'friday', 'Hammer Curls', '3x12', 30, 'Biceps', 3),
('YOUR_WEEKLY_PLAN_ID', 'friday', 'Face Pulls', '3x15', 25, 'Shoulders', 4);

-- Saturday - Legs Day
INSERT INTO daily_workout_exercises (weekly_plan_id, day_of_week, exercise_name, sets_x_reps, weight, muscle_group, order_index) VALUES
('YOUR_WEEKLY_PLAN_ID', 'saturday', 'Front Squats', '3x8', 155, 'Legs', 1),
('YOUR_WEEKLY_PLAN_ID', 'saturday', 'Romanian Deadlifts', '3x8', 185, 'Hamstrings', 2),
('YOUR_WEEKLY_PLAN_ID', 'saturday', 'Bulgarian Split Squats', '3x10', 0, 'Legs', 3),
('YOUR_WEEKLY_PLAN_ID', 'saturday', 'Leg Press', '3x12', 270, 'Legs', 4);

-- Sunday - Rest Day
-- No exercises for rest day

-- Verify the data was inserted
SELECT 
  dwe.day_of_week,
  dwe.exercise_name,
  dwe.sets_x_reps,
  dwe.weight,
  dwe.muscle_group,
  dwe.order_index
FROM daily_workout_exercises dwe
JOIN weekly_plans wp ON dwe.weekly_plan_id = wp.id
WHERE wp.user_id = '05364273-f4ae-42d7-b477-abb311bc26f8'
ORDER BY dwe.day_of_week, dwe.order_index;
