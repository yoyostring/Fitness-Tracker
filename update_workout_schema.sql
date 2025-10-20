-- Update weekly_plans table to remove morning/evening split
-- Run this in Supabase SQL Editor

-- 1. First, let's see the current structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'weekly_plans' 
ORDER BY ordinal_position;

-- 2. Add new single workout columns
ALTER TABLE weekly_plans 
ADD COLUMN IF NOT EXISTS monday TEXT,
ADD COLUMN IF NOT EXISTS tuesday TEXT,
ADD COLUMN IF NOT EXISTS wednesday TEXT,
ADD COLUMN IF NOT EXISTS thursday TEXT,
ADD COLUMN IF NOT EXISTS friday TEXT,
ADD COLUMN IF NOT EXISTS saturday TEXT,
ADD COLUMN IF NOT EXISTS sunday TEXT;

-- 3. Migrate existing data from morning columns to new single columns
UPDATE weekly_plans 
SET 
  monday = monday_morning,
  tuesday = tuesday_morning,
  wednesday = wednesday_morning,
  thursday = thursday_morning,
  friday = friday_morning,
  saturday = saturday_morning,
  sunday = sunday_morning
WHERE monday IS NULL;

-- 4. Drop the old morning/evening columns (optional - you can keep them if you want)
-- Uncomment these lines if you want to remove the old columns:
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS monday_morning;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS monday_evening;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS tuesday_morning;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS tuesday_evening;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS wednesday_morning;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS wednesday_evening;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS thursday_morning;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS thursday_evening;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS friday_morning;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS friday_evening;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS saturday_morning;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS saturday_evening;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS sunday_morning;
-- ALTER TABLE weekly_plans DROP COLUMN IF EXISTS sunday_evening;

-- 5. Verify the update worked
SELECT * FROM weekly_plans;
