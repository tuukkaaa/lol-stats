import { getSupabaseAdmin, TABLES, CACHE_DURATION, isCacheValid } from './supabase.js';
export class MatchHistoryCacheService {
  constructor() {
    this.supabase = getSupabaseAdmin();
  }
  async getCachedMatchIds(puuid, region, start = 0, count = 20) {
    try {
      const cacheKey = `${puuid}_${region}_${start}_${count}`;
      const {
        data,
        error
      } = await this.supabase.from('match_history_cache').select('*').eq('cache_key', cacheKey).single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cached match IDs:', error);
        return null;
      }
      if (!data) return null;
      if (!isCacheValid(data.last_fetched_at, CACHE_DURATION.MATCH_HISTORY)) {
        console.log(`Match history cache expired for ${puuid}`);
        return null;
      }
      console.log(`📋 Match IDs served from cache for ${puuid}`);
      return data.match_ids;
    } catch (error) {
      console.error('Error in getCachedMatchIds:', error);
      return null;
    }
  }
  async cacheMatchIds(puuid, region, start, count, matchIds) {
    try {
      const cacheKey = `${puuid}_${region}_${start}_${count}`;
      const cacheEntry = {
        cache_key: cacheKey,
        puuid: puuid,
        region: region.toLowerCase(),
        start_index: start,
        count: count,
        match_ids: matchIds,
        last_fetched_at: new Date()
      };
      const {
        error
      } = await this.supabase.from('match_history_cache').upsert(cacheEntry, {
        onConflict: 'cache_key',
        ignoreDuplicates: false
      });
      if (error) {
        console.error('Error caching match IDs:', error);
        return false;
      }
      console.log(`📋 Cached ${matchIds.length} match IDs for ${puuid}`);
      return true;
    } catch (error) {
      console.error('Error in cacheMatchIds:', error);
      return false;
    }
  }
}
export const matchHistoryCache = new MatchHistoryCacheService();