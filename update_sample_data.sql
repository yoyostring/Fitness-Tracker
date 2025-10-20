-- Update your existing PPL Split plan to use single workouts per day
-- Run this in Supabase SQL Editor

-- First, let's see your current data
SELECT * FROM weekly_plans WHERE user_id = '05364273-f4ae-42d7-b477-abb311bc26f8';

-- Update the existing plan to use single workout columns
UPDATE weekly_plans 
SET 
  monday = 'Upper day',
  tuesday = 'Lower day',
  wednesday = 'Rest day',
  thursday = 'Push day',
  friday = 'Pull day',
  saturday = 'Legs day',
  sunday = 'Rest day'
WHERE user_id = '05364273-f4ae-42d7-b477-abb311bc26f8' 
AND plan_name = 'PPL Split';

-- Verify the update worked
SELECT * FROM weekly_plans WHERE user_id = '05364273-f4ae-42d7-b477-abb311bc26f8';
