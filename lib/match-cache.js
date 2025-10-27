import { getSupabaseAdmin, TABLES, CACHE_DURATION, isCacheValid } from './supabase.js';
export class MatchCacheService {
  constructor() {
    this.supabase = getSupabaseAdmin();
  }
  async getCachedMatch(matchId, region) {
    try {
      const {
        data,
        error
      } = await this.supabase.from(TABLES.MATCHES).select('*').eq('match_id', matchId).eq('region', region).single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cached match:', error);
        return null;
      }
      if (!data) return null;
      if (!isCacheValid(data.last_fetched_at, CACHE_DURATION.MATCH)) {
        console.log(`Match ${matchId} cache expired, will refetch`);
        return null;
      }
      console.log(`Match ${matchId} served from cache`);
      return data.match_data;
    } catch (error) {
      console.error('Error in getCachedMatch:', error);
      return null;
    }
  }
  async cacheMatch(matchData, timelineData = null) {
    try {
      const matchId = matchData.metadata.matchId;
      const region = matchData.metadata.matchId.split('_')[0].toLowerCase();
      const cacheEntry = {
        match_id: matchId,
        region: region.toLowerCase(),
        game_creation: new Date(matchData.info.gameCreation),
        game_duration: matchData.info.gameDuration,
        game_mode: matchData.info.gameMode,
        game_type: matchData.info.gameType,
        queue_id: matchData.info.queueId,
        match_data: matchData,
        timeline_data: timelineData,
        last_fetched_at: new Date()
      };
      const {
        data,
        error
      } = await this.supabase.from(TABLES.MATCHES).upsert(cacheEntry, {
        onConflict: 'match_id',
        ignoreDuplicates: false
      }).select().single();
      if (error) {
        console.error('Error caching match:', error);
        return false;
      }
      await this.cacheUserMatches(matchData);
      console.log(`Match ${matchId} cached successfully`);
      return true;
    } catch (error) {
      console.error('Error in cacheMatch:', error);
      return false;
    }
  }
  async cacheUserMatches(matchData) {
    try {
      const matchId = matchData.metadata.matchId;
      const userMatches = matchData.info.participants.map(participant => ({
        puuid: participant.puuid,
        match_id: matchId,
        champion_id: participant.championId,
        champion_name: participant.championName,
        participant_data: participant
      }));
      const {
        error
      } = await this.supabase.from(TABLES.USER_MATCHES).upsert(userMatches, {
        onConflict: 'puuid,match_id',
        ignoreDuplicates: false
      });
      if (error) {
        console.error('Error caching user matches:', error);
      }
    } catch (error) {
      console.error('Error in cacheUserMatches:', error);
    }
  }
  async getCachedMatchHistory(puuid, region, startIndex = 0, count = 20) {
    try {
      console.log(`🔍 Querying cache for puuid: ${puuid}, region: ${region}, start: ${startIndex}, count: ${count}`);
      const {
        data,
        error
      } = await this.supabase.from(TABLES.USER_MATCHES).select(`
          match_id,
          champion_id,
          champion_name,
          participant_data,
          matches!inner(
            match_id,
            region,
            game_creation,
            game_duration,
            game_mode,
            queue_id,
            match_data,
            timeline_data,
            last_fetched_at
          )
        `).eq('puuid', puuid).eq('matches.region', region.toLowerCase()).order('matches(game_creation)', {
        ascending: false
      }).range(startIndex, startIndex + count - 1);
      if (error) {
        console.error('❌ Error fetching cached match history:', error);
        return null;
      }
      if (!data || data.length === 0) {
        console.log(`📭 No cached matches found for ${puuid} in ${region}`);
        return {
          matches: [],
          cached: []
        };
      }
      console.log(`📊 Found ${data.length} potential cache entries for ${puuid}`);
      data.forEach((item, i) => {
        console.log(`   ${i + 1}. Match: ${item.match_id}, Last fetched: ${item.matches.last_fetched_at}`);
      });
      const now = new Date();
      const validMatches = [];
      const expiredMatches = [];
      data.forEach(item => {
        const match = item.matches;
        const isValid = isCacheValid(match.last_fetched_at, CACHE_DURATION.MATCH);
        if (isValid) {
          validMatches.push({
            ...match.match_data,
            timeline: match.timeline_data,
            participant: item.participant_data
          });
        } else {
          expiredMatches.push(match.match_id);
        }
      });
      console.log(`Found ${validMatches.length} cached matches, ${expiredMatches.length} expired for ${puuid}`);
      return {
        matches: validMatches,
        expired: expiredMatches,
        cached: validMatches.map(m => m.metadata.matchId)
      };
    } catch (error) {
      console.error('Error in getCachedMatchHistory:', error);
      return null;
    }
  }
  async getMatchesToFetch(matchIds, region) {
    try {
      const {
        data,
        error
      } = await this.supabase.from(TABLES.MATCHES).select('match_id, last_fetched_at').in('match_id', matchIds).eq('region', region);
      if (error) {
        console.error('Error checking cached matches:', error);
        return matchIds;
      }
      const cachedMatches = new Map();
      data.forEach(match => {
        cachedMatches.set(match.match_id, match.last_fetched_at);
      });
      const toFetch = matchIds.filter(matchId => {
        const lastFetched = cachedMatches.get(matchId);
        return !lastFetched || !isCacheValid(lastFetched, CACHE_DURATION.MATCH);
      });
      console.log(`Need to fetch ${toFetch.length} out of ${matchIds.length} matches`);
      return toFetch;
    } catch (error) {
      console.error('Error in getMatchesToFetch:', error);
      return matchIds;
    }
  }
  async cacheMatches(matches, timelines = {}) {
    try {
      const promises = matches.map(match => this.cacheMatch(match, timelines[match.metadata.matchId]));
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
      console.log(`Cached ${successful} out of ${matches.length} matches`);
      return successful;
    } catch (error) {
      console.error('Error in cacheMatches:', error);
      return 0;
    }
  }
  async cleanupOldMatches() {
    try {
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const {
        error
      } = await this.supabase.from(TABLES.MATCHES).delete().lt('last_fetched_at', cutoffDate.toISOString());
      if (error) {
        console.error('Error cleaning up old matches:', error);
      } else {
        console.log('Old matches cleaned up successfully');
      }
    } catch (error) {
      console.error('Error in cleanupOldMatches:', error);
    }
  }
}
export const matchCache = new MatchCacheService();