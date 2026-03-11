-- Vibe CodePen Database Migration
-- 执行此脚本创建必要的数据表和索引

-- 创建 cases 表
CREATE TABLE IF NOT EXISTS cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(50) NOT NULL,
  code TEXT NOT NULL,
  create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preview_img VARCHAR(255),
  
  CONSTRAINT title_length CHECK (char_length(title) >= 2 AND char_length(title) <= 50)
);

-- 开启 RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cases_create_time ON cases(create_time DESC);
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);

-- RLS 策略
-- 1. 允许所有用户读取
CREATE POLICY "Allow all users to read cases" ON cases
  FOR SELECT USING (true);

-- 2. 允许认证用户创建
CREATE POLICY "Allow authenticated users to create cases" ON cases
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. 允许所有者更新
CREATE POLICY "Allow owners to update their own cases" ON cases
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. 允许所有者删除
CREATE POLICY "Allow owners to delete their own cases" ON cases
  FOR DELETE USING (auth.uid() = user_id);
