import { getSupabaseAdmin, TABLES, CACHE_DURATION, isCacheValid } from './supabase.js';
export class SummonerCacheService {
  constructor() {
    this.supabase = getSupabaseAdmin();
  }
  async getCachedSummoner(puuid, region) {
    try {
      const {
        data,
        error
      } = await this.supabase.from(TABLES.SUMMONERS).select('*').eq('puuid', puuid).eq('region', region).single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cached summoner:', error);
        return null;
      }
      if (!data) return null;
      if (!isCacheValid(data.last_fetched_at, CACHE_DURATION.SUMMONER)) {
        console.log(`Summoner ${puuid} cache expired, will refetch`);
        return null;
      }
      console.log(`Summoner ${puuid} served from cache`);
      return {
        id: data.summoner_id,
        accountId: data.account_id,
        puuid: data.puuid,
        name: data.summoner_name,
        profileIconId: data.profile_icon_id,
        summonerLevel: data.summoner_level,
        revisionDate: new Date(data.updated_at).getTime()
      };
    } catch (error) {
      console.error('Error in getCachedSummoner:', error);
      return null;
    }
  }
  async cacheSummoner(summonerData, region) {
    try {
      const cacheEntry = {
        puuid: summonerData.puuid,
        summoner_id: summonerData.id,
        account_id: summonerData.accountId,
        summoner_name: summonerData.name,
        profile_icon_id: summonerData.profileIconId,
        summoner_level: summonerData.summonerLevel,
        region: region,
        last_fetched_at: new Date()
      };
      const {
        data,
        error
      } = await this.supabase.from(TABLES.SUMMONERS).upsert(cacheEntry, {
        onConflict: 'puuid',
        ignoreDuplicates: false
      }).select().single();
      if (error) {
        console.error('Error caching summoner:', error);
        return false;
      }
      console.log(`Summoner ${summonerData.name} cached successfully`);
      return true;
    } catch (error) {
      console.error('Error in cacheSummoner:', error);
      return false;
    }
  }
  async getCachedSummonerByName(summonerName, region) {
    try {
      const {
        data,
        error
      } = await this.supabase.from(TABLES.SUMMONERS).select('*').ilike('summoner_name', summonerName).eq('region', region).single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cached summoner by name:', error);
        return null;
      }
      if (!data) return null;
      if (!isCacheValid(data.last_fetched_at, CACHE_DURATION.SUMMONER)) {
        console.log(`Summoner ${summonerName} cache expired, will refetch`);
        return null;
      }
      console.log(`Summoner ${summonerName} served from cache`);
      return {
        id: data.summoner_id,
        accountId: data.account_id,
        puuid: data.puuid,
        name: data.summoner_name,
        profileIconId: data.profile_icon_id,
        summonerLevel: data.summoner_level,
        revisionDate: new Date(data.updated_at).getTime()
      };
    } catch (error) {
      console.error('Error in getCachedSummonerByName:', error);
      return null;
    }
  }
}
export class RankedCacheService {
  constructor() {
    this.supabase = getSupabaseAdmin();
  }
  async getCachedRankedData(puuid, region) {
    try {
      const {
        data,
        error
      } = await this.supabase.from(TABLES.RANKED_DATA).select('*').eq('puuid', puuid).eq('region', region);
      if (error) {
        console.error('Error fetching cached ranked data:', error);
        return null;
      }
      if (!data || data.length === 0) return null;
      const validData = data.filter(entry => isCacheValid(entry.last_fetched_at, CACHE_DURATION.RANKED));
      if (validData.length === 0) {
        console.log(`Ranked data for ${puuid} expired, will refetch`);
        return null;
      }
      console.log(`Ranked data for ${puuid} served from cache`);
      return validData.map(entry => ({
        leagueId: entry.id,
        queueType: entry.queue_type,
        tier: entry.tier,
        rank: entry.rank_division,
        leaguePoints: entry.league_points,
        wins: entry.wins,
        losses: entry.losses,
        veteran: entry.veteran,
        inactive: entry.inactive,
        freshBlood: entry.fresh_blood,
        hotStreak: entry.hot_streak
      }));
    } catch (error) {
      console.error('Error in getCachedRankedData:', error);
      return null;
    }
  }
  async cacheRankedData(rankedDataArray, puuid, region) {
    try {
      await this.supabase.from(TABLES.RANKED_DATA).delete().eq('puuid', puuid).eq('region', region);
      if (!rankedDataArray || rankedDataArray.length === 0) {
        console.log(`No ranked data to cache for ${puuid}`);
        return true;
      }
      const cacheEntries = rankedDataArray.map(entry => ({
        puuid: puuid,
        queue_type: entry.queueType,
        tier: entry.tier,
        rank_division: entry.rank,
        league_points: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses,
        veteran: entry.veteran,
        inactive: entry.inactive,
        fresh_blood: entry.freshBlood,
        hot_streak: entry.hotStreak,
        region: region,
        last_fetched_at: new Date()
      }));
      const {
        error
      } = await this.supabase.from(TABLES.RANKED_DATA).insert(cacheEntries);
      if (error) {
        console.error('Error caching ranked data:', error);
        return false;
      }
      console.log(`Ranked data for ${puuid} cached successfully`);
      return true;
    } catch (error) {
      console.error('Error in cacheRankedData:', error);
      return false;
    }
  }
}
export class StaticDataCacheService {
  constructor() {
    this.supabase = getSupabaseAdmin();
  }
  async getCachedChampionData() {
    try {
      const {
        data,
        error
      } = await this.supabase.from(TABLES.CHAMPION_DATA).select('*').order('created_at', {
        ascending: false
      }).limit(1).single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cached champion data:', error);
        return null;
      }
      if (!data) return null;
      if (!isCacheValid(data.created_at, CACHE_DURATION.STATIC_DATA)) {
        console.log('Champion data cache expired, will refetch');
        return null;
      }
      console.log('Champion data served from cache');
      return {
        data: data.champion_data,
        version: data.version
      };
    } catch (error) {
      console.error('Error in getCachedChampionData:', error);
      return null;
    }
  }
  async cacheChampionData(championData, version) {
    try {
      const cacheEntry = {
        champion_id: version,
        champion_data: championData,
        version: version
      };
      const {
        error
      } = await this.supabase.from(TABLES.CHAMPION_DATA).upsert(cacheEntry, {
        onConflict: 'champion_id',
        ignoreDuplicates: false
      });
      if (error) {
        console.error('Error caching champion data:', error);
        return false;
      }
      console.log(`Champion data v${version} cached successfully`);
      return true;
    } catch (error) {
      console.error('Error in cacheChampionData:', error);
      return false;
    }
  }
}
export const summonerCache = new SummonerCacheService();
export const rankedCache = new RankedCacheService();
export const staticDataCache = new StaticDataCacheService();