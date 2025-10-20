-- Check if you already have these policies
-- Run this first to see what's missing:

SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('food_entries', 'weekly_plans')
ORDER BY tablename, policyname;

-- If the above query shows missing policies, run these:

-- Policies for food_entries (only if missing)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own food entries') THEN
        CREATE POLICY "Users can view own food entries" ON food_entries
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own food entries') THEN
        CREATE POLICY "Users can insert own food entries" ON food_entries
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own food entries') THEN
        CREATE POLICY "Users can update own food entries" ON food_entries
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own food entries') THEN
        CREATE POLICY "Users can delete own food entries" ON food_entries
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Policies for weekly_plans (only if missing)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own weekly plans') THEN
        CREATE POLICY "Users can view own weekly plans" ON weekly_plans
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own weekly plans') THEN
        CREATE POLICY "Users can insert own weekly plans" ON weekly_plans
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own weekly plans') THEN
        CREATE POLICY "Users can update own weekly plans" ON weekly_plans
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own weekly plans') THEN
        CREATE POLICY "Users can delete own weekly plans" ON weekly_plans
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Verify everything is working
SELECT 'Policies created successfully' as status;
