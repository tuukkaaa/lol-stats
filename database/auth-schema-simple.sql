-- =====================================================
-- STEP 1: Create Tables
-- Run this first in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Riot Accounts Table
CREATE TABLE IF NOT EXISTS user_riot_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  puuid TEXT NOT NULL,
  game_name TEXT NOT NULL,
  tag_line TEXT NOT NULL,
  region TEXT NOT NULL,
  
  summoner_id TEXT,
  account_id TEXT,
  summoner_level INTEGER,
  profile_icon_id INTEGER,
  
  is_primary BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, puuid),
  UNIQUE(puuid)
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  default_region TEXT DEFAULT 'EUW1',
  theme TEXT DEFAULT 'dark',
  
  profile_public BOOLEAN DEFAULT TRUE,
  show_rank BOOLEAN DEFAULT TRUE,
  show_match_history BOOLEAN DEFAULT TRUE,
  
  email_notifications BOOLEAN DEFAULT TRUE,
  match_reminders BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Log Table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  activity_type TEXT NOT NULL,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Create Indexes
-- Run this after tables are created
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_riot_accounts_user_id ON user_riot_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_riot_accounts_puuid ON user_riot_accounts(puuid);
CREATE INDEX IF NOT EXISTS idx_user_riot_accounts_primary ON user_riot_accounts(user_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);

-- =====================================================
-- STEP 3: Enable Row Level Security
-- Run this after indexes
-- =====================================================

ALTER TABLE user_riot_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Create RLS Policies
-- Run this after enabling RLS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own Riot accounts" ON user_riot_accounts;
DROP POLICY IF EXISTS "Users can insert their own Riot accounts" ON user_riot_accounts;
DROP POLICY IF EXISTS "Users can update their own Riot accounts" ON user_riot_accounts;
DROP POLICY IF EXISTS "Users can delete their own Riot accounts" ON user_riot_accounts;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view their own activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Service role can insert activity logs" ON user_activity_log;

-- User Riot Accounts Policies
CREATE POLICY "Users can view their own Riot accounts"
  ON user_riot_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Riot accounts"
  ON user_riot_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Riot accounts"
  ON user_riot_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Riot accounts"
  ON user_riot_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- User Preferences Policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- User Activity Log Policies
CREATE POLICY "Users can view their own activity logs"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert activity logs"
  ON user_activity_log FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- STEP 5: Create Functions and Triggers (OPTIONAL)
-- SKIP THIS STEP - The trigger can cause signup issues
-- User preferences will be auto-created when first accessed
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_riot_accounts_updated_at ON user_riot_accounts;
CREATE TRIGGER update_user_riot_accounts_updated_at
  BEFORE UPDATE ON user_riot_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- NOTE: We do NOT create a trigger for auto-creating user_preferences
-- This caused signup errors. Preferences are now created on first access.
