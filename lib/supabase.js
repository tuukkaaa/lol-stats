import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAdmin = null;
if (supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized. Missing SUPABASE_SERVICE_ROLE_KEY.');
  }
  return supabaseAdmin;
};
export const TABLES = {
  SUMMONERS: 'summoners',
  MATCHES: 'matches',
  USER_MATCHES: 'user_matches',
  RANKED_DATA: 'ranked_data',
  CHAMPION_DATA: 'champion_data',
  ITEM_DATA: 'item_data',
  SUMMONER_SPELL_DATA: 'summoner_spell_data',
  RUNE_DATA: 'rune_data',
  USER_RIOT_ACCOUNTS: 'user_riot_accounts',
  USER_PREFERENCES: 'user_preferences',
  USER_ACTIVITY_LOG: 'user_activity_log'
};
export const CACHE_DURATION = {
  SUMMONER: 60 * 60 * 1000,
  MATCH: 24 * 60 * 60 * 1000,
  RANKED: 30 * 60 * 1000,
  STATIC_DATA: 7 * 24 * 60 * 60 * 1000,
  MATCH_HISTORY: 10 * 60 * 1000
};
export const isCacheValid = (lastFetchedAt, duration) => {
  if (!lastFetchedAt) return false;
  const now = new Date();
  const fetchedAt = new Date(lastFetchedAt);
  return now - fetchedAt < duration;
};
export const getCacheExpiry = duration => {
  return new Date(Date.now() + duration);
};