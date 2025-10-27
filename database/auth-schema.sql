-- =====================================================
-- Authentication and User Management Schema
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- User Riot Accounts Table
-- Links authenticated users to their Riot accounts
-- =====================================================
CREATE TABLE IF NOT EXISTS user_riot_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Riot Account Information
  puuid TEXT NOT NULL,
  game_name TEXT NOT NULL,
  tag_line TEXT NOT NULL,
  region TEXT NOT NULL,
  
  -- Summoner Data (cached from Riot API)
  summoner_id TEXT,
  account_id TEXT,
  summoner_level INTEGER,
  profile_icon_id INTEGER,
  
  -- Account Status
  is_primary BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Unique constraint: one user can't add the same account twice
  UNIQUE(user_id, puuid),
  
  -- Unique constraint: each Riot account can only be linked to one user
  UNIQUE(puuid)
);

-- =====================================================
-- User Preferences Table
-- Store user settings and preferences
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Display Preferences
  default_region TEXT DEFAULT 'EUW1',
  theme TEXT DEFAULT 'dark',
  
  -- Privacy Settings
  profile_public BOOLEAN DEFAULT TRUE,
  show_rank BOOLEAN DEFAULT TRUE,
  show_match_history BOOLEAN DEFAULT TRUE,
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  match_reminders BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- User Activity Log Table
-- Track user actions for analytics and security
-- =====================================================
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity Details
  activity_type TEXT NOT NULL, -- 'login', 'logout', 'account_linked', 'account_removed', etc.
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_riot_accounts_user_id ON user_riot_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_riot_accounts_puuid ON user_riot_accounts(puuid);
CREATE INDEX IF NOT EXISTS idx_user_riot_accounts_primary ON user_riot_accounts(user_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_riot_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- User Riot Accounts Policies
-- Users can only see and manage their own Riot accounts
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
-- Users can only see and manage their own preferences
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
-- Users can only view their own activity logs
CREATE POLICY "Users can view their own activity logs"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert activity logs
CREATE POLICY "Service role can insert activity logs"
  ON user_activity_log FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_riot_accounts
CREATE TRIGGER update_user_riot_accounts_updated_at
  BEFORE UPDATE ON user_riot_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create default user preferences on signup
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If there's an error, just log it and continue
    RAISE WARNING 'Error creating user preferences: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences when user signs up
-- Note: This runs AFTER the user is created to avoid blocking user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_preferences();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get user's primary Riot account
CREATE OR REPLACE FUNCTION get_primary_riot_account(p_user_id UUID)
RETURNS TABLE (
  puuid TEXT,
  game_name TEXT,
  tag_line TEXT,
  region TEXT,
  summoner_level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ura.puuid,
    ura.game_name,
    ura.tag_line,
    ura.region,
    ura.summoner_level
  FROM user_riot_accounts ura
  WHERE ura.user_id = p_user_id AND ura.is_primary = TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set primary Riot account
CREATE OR REPLACE FUNCTION set_primary_riot_account(p_user_id UUID, p_account_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove primary flag from all user's accounts
  UPDATE user_riot_accounts
  SET is_primary = FALSE
  WHERE user_id = p_user_id;
  
  -- Set the specified account as primary
  UPDATE user_riot_accounts
  SET is_primary = TRUE
  WHERE id = p_account_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments for Documentation
-- =====================================================
COMMENT ON TABLE user_riot_accounts IS 'Links authenticated users to their Riot Games accounts';
COMMENT ON TABLE user_preferences IS 'Stores user preferences and settings';
COMMENT ON TABLE user_activity_log IS 'Tracks user activity for analytics and security';
COMMENT ON COLUMN user_riot_accounts.is_primary IS 'Indicates the user''s main account for default display';
COMMENT ON COLUMN user_riot_accounts.verified_at IS 'Timestamp when the account ownership was verified';
