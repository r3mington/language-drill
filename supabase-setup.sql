-- ============================================
-- Language Drill - Database Schema Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create phrases table
CREATE TABLE IF NOT EXISTS phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  english TEXT NOT NULL,
  chinese TEXT NOT NULL,
  pinyin TEXT,
  category TEXT DEFAULT 'general',
  difficulty_level INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phrase_id UUID REFERENCES phrases(id) ON DELETE CASCADE,
  total_repetitions INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, phrase_id)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_phrases_active ON phrases(is_active);
CREATE INDEX IF NOT EXISTS idx_phrases_category ON phrases(category);
CREATE INDEX IF NOT EXISTS idx_phrases_sort ON phrases(sort_order);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_phrase ON user_progress(phrase_id);

-- 4. Enable Row Level Security
ALTER TABLE phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for phrases table
CREATE POLICY "Anyone can read active phrases"
ON phrases FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can insert phrases"
ON phrases FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. Create RLS Policies for user_progress table
CREATE POLICY "Users can view own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);

-- 7. Seed initial phrases
INSERT INTO phrases (english, chinese, pinyin, category, difficulty_level, sort_order) VALUES
  ('Good morning, my name is Remi', '早上好我的名字是黑米', 'Zǎoshang hǎo wǒ de míngzì shì hēimǐ', 'introductions', 1, 1),
  ('Today I''m really happy', '今天我很开心', 'Jīntiān wǒ hěn kāixīn', 'emotions', 1, 2)
ON CONFLICT DO NOTHING;

-- ============================================
-- Setup Complete!
-- ============================================
