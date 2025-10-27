-- Additional table for caching match history lists (match IDs)
-- This prevents needing to call Riot API for match IDs on every request

CREATE TABLE IF NOT EXISTS match_history_cache (
  cache_key TEXT PRIMARY KEY,
  puuid TEXT NOT NULL,
  region TEXT NOT NULL,
  start_index INTEGER NOT NULL DEFAULT 0,
  count INTEGER NOT NULL DEFAULT 20,
  match_ids JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_match_history_cache_puuid ON match_history_cache(puuid);
CREATE INDEX IF NOT EXISTS idx_match_history_cache_region ON match_history_cache(region);
CREATE INDEX IF NOT EXISTS idx_match_history_cache_last_fetched ON match_history_cache(last_fetched_at);

-- Trigger for automatic updated_at
CREATE TRIGGER update_match_history_cache_updated_at BEFORE UPDATE ON match_history_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE match_history_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to match_history_cache" ON match_history_cache FOR SELECT USING (true);
CREATE POLICY "Allow service role full access to match_history_cache" ON match_history_cache USING (true);