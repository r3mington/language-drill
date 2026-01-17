-- ============================================
-- Language Drill - Admin Policy Updates
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Enable write access for authenticated users on phrases table
-- NOTE: In a production app, checking for specific user ID or role is recommended
-- For this personal app, all authenticated users are admins

CREATE POLICY "Authenticated users can update phrases"
ON phrases FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete phrases"
ON phrases FOR DELETE
TO authenticated
USING (true);

-- 2. Ensure insert policy exists (if not created in initial setup)
DROP POLICY IF EXISTS "Authenticated users can insert phrases" ON phrases;
CREATE POLICY "Authenticated users can insert phrases"
ON phrases FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- Policy Updates Complete!
-- ============================================
