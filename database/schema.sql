-- Supabase Schema for League of Legends Stats Tracker
-- Run these commands in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Summoners table for caching player profiles
CREATE TABLE summoners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  puuid TEXT UNIQUE NOT NULL,
  summoner_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  summoner_name TEXT NOT NULL,
  profile_icon_id INTEGER,
  summoner_level INTEGER,
  region TEXT NOT NULL,
  -- Cache metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table for caching match data
CREATE TABLE matches (
  match_id TEXT PRIMARY KEY,
  region TEXT NOT NULL,
  game_creation TIMESTAMPTZ NOT NULL,
  game_duration INTEGER NOT NULL,
  game_mode TEXT NOT NULL,
  game_type TEXT NOT NULL,
  queue_id INTEGER NOT NULL,
  -- Store the full match data as JSONB for flexibility
  match_data JSONB NOT NULL,
  timeline_data JSONB, -- Optional timeline data
  -- Cache metadata  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- User matches junction table for tracking which matches belong to which users
CREATE TABLE user_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  puuid TEXT NOT NULL,
  match_id TEXT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  champion_id INTEGER NOT NULL,
  champion_name TEXT NOT NULL,
  participant_data JSONB NOT NULL, -- Store participant-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(puuid, match_id)
);

-- Ranked data table for caching rank information
CREATE TABLE ranked_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  puuid TEXT NOT NULL,
  queue_type TEXT NOT NULL, -- "RANKED_SOLO_5x5", "RANKED_FLEX_SR", etc.
  tier TEXT,
  rank_division TEXT, -- "I", "II", "III", "IV"
  league_points INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  veteran BOOLEAN DEFAULT FALSE,
  inactive BOOLEAN DEFAULT FALSE,
  fresh_blood BOOLEAN DEFAULT FALSE,
  hot_streak BOOLEAN DEFAULT FALSE,
  region TEXT NOT NULL,
  -- Cache metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(puuid, queue_type, region)
);

-- Champion data cache for storing static champion information
CREATE TABLE champion_data (
  champion_id TEXT PRIMARY KEY,
  champion_data JSONB NOT NULL,
  version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item data cache
CREATE TABLE item_data (
  version TEXT PRIMARY KEY,
  item_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Summoner spell data cache
CREATE TABLE summoner_spell_data (
  version TEXT PRIMARY KEY,
  spell_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rune data cache
CREATE TABLE rune_data (
  version TEXT PRIMARY KEY,
  rune_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_summoners_puuid ON summoners(puuid);
CREATE INDEX idx_summoners_region ON summoners(region);
CREATE INDEX idx_summoners_last_fetched ON summoners(last_fetched_at);

CREATE INDEX idx_matches_region ON matches(region);
CREATE INDEX idx_matches_game_creation ON matches(game_creation);
CREATE INDEX idx_matches_last_fetched ON matches(last_fetched_at);
CREATE INDEX idx_matches_queue_id ON matches(queue_id);

CREATE INDEX idx_user_matches_puuid ON user_matches(puuid);
CREATE INDEX idx_user_matches_match_id ON user_matches(match_id);
CREATE INDEX idx_user_matches_champion_id ON user_matches(champion_id);

CREATE INDEX idx_ranked_data_puuid ON ranked_data(puuid);
CREATE INDEX idx_ranked_data_region ON ranked_data(region);
CREATE INDEX idx_ranked_data_queue_type ON ranked_data(queue_type);
CREATE INDEX idx_ranked_data_last_fetched ON ranked_data(last_fetched_at);

-- Functions for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_summoners_updated_at BEFORE UPDATE ON summoners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches  
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ranked_data_updated_at BEFORE UPDATE ON ranked_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_champion_data_updated_at BEFORE UPDATE ON champion_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_data_updated_at BEFORE UPDATE ON item_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_summoner_spell_data_updated_at BEFORE UPDATE ON summoner_spell_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rune_data_updated_at BEFORE UPDATE ON rune_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies - for future auth implementation
ALTER TABLE summoners ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranked_data ENABLE ROW LEVEL SECURITY;

-- For now, allow read access to all data (we'll implement proper auth later)
CREATE POLICY "Allow read access to summoners" ON summoners FOR SELECT USING (true);
CREATE POLICY "Allow read access to matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow read access to user_matches" ON user_matches FOR SELECT USING (true);
CREATE POLICY "Allow read access to ranked_data" ON ranked_data FOR SELECT USING (true);

-- Allow service role to do everything (for our API)
CREATE POLICY "Allow service role full access to summoners" ON summoners USING (true);
CREATE POLICY "Allow service role full access to matches" ON matches USING (true);
CREATE POLICY "Allow service role full access to user_matches" ON user_matches USING (true);
CREATE POLICY "Allow service role full access to ranked_data" ON ranked_data USING (true);