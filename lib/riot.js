const RIOT_API_CONTINENTAL = {
  na1: 'https://americas.api.riotgames.com',
  br1: 'https://americas.api.riotgames.com',
  la1: 'https://americas.api.riotgames.com',
  la2: 'https://americas.api.riotgames.com',
  oc1: 'https://americas.api.riotgames.com',
  euw1: 'https://europe.api.riotgames.com',
  eun1: 'https://europe.api.riotgames.com',
  tr1: 'https://europe.api.riotgames.com',
  ru: 'https://europe.api.riotgames.com',
  kr: 'https://asia.api.riotgames.com',
  jp1: 'https://asia.api.riotgames.com',
  ph2: 'https://asia.api.riotgames.com',
  sg2: 'https://asia.api.riotgames.com',
  th2: 'https://asia.api.riotgames.com',
  tw2: 'https://asia.api.riotgames.com',
  vn2: 'https://asia.api.riotgames.com'
};
const RIOT_API_REGIONAL = {
  na1: 'https://na1.api.riotgames.com',
  euw1: 'https://euw1.api.riotgames.com',
  eun1: 'https://eun1.api.riotgames.com',
  kr: 'https://kr.api.riotgames.com',
  br1: 'https://br1.api.riotgames.com',
  jp1: 'https://jp1.api.riotgames.com',
  ru: 'https://ru.api.riotgames.com',
  oc1: 'https://oc1.api.riotgames.com',
  tr1: 'https://tr1.api.riotgames.com',
  la1: 'https://la1.api.riotgames.com',
  la2: 'https://la2.api.riotgames.com',
  ph2: 'https://ph2.api.riotgames.com',
  sg2: 'https://sg2.api.riotgames.com',
  th2: 'https://th2.api.riotgames.com',
  tw2: 'https://tw2.api.riotgames.com',
  vn2: 'https://vn2.api.riotgames.com'
};
export const validateRegion = region => {
  const validRegions = Object.keys(RIOT_API_REGIONAL);
  return validRegions.includes(region) ? region : 'euw1';
};
const cache = new Map();
const CACHE_DURATION = 15 * 60 * 1000;
const rateLimitState = {
  lastRequestTime: 0,
  requestCount: 0,
  resetTime: Date.now() + 120000,
  isThrottled: false
};
class RiotAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.latestVersion = null;
    this.requestDelay = 200;
    this.maxRetries = 3;
  }
  async waitForRateLimit() {
    const now = Date.now();
    if (now > rateLimitState.resetTime) {
      rateLimitState.requestCount = 0;
      rateLimitState.resetTime = now + 120000;
      rateLimitState.isThrottled = false;
    }
    if (rateLimitState.requestCount > 80) {
      rateLimitState.isThrottled = true;
      const waitTime = Math.min(5000, 1000 + (rateLimitState.requestCount - 80) * 100);
      console.log(`Rate limit throttling: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    const timeSinceLastRequest = now - rateLimitState.lastRequestTime;
    const delay = rateLimitState.isThrottled ? this.requestDelay * 2 : this.requestDelay;
    if (timeSinceLastRequest < delay) {
      await new Promise(resolve => setTimeout(resolve, delay - timeSinceLastRequest));
    }
    rateLimitState.lastRequestTime = Date.now();
    rateLimitState.requestCount++;
  }
  async makeRequestWithRetry(url, options = {}, retries = this.maxRetries) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.waitForRateLimit();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        const response = await fetch(url, {
          ...options,
          headers: {
            'X-Riot-Token': this.apiKey,
            ...options.headers
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
          console.log(`Rate limited (429), waiting ${waitTime}ms (attempt ${attempt + 1}/${retries + 1})`);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            rateLimitState.isThrottled = true;
            continue;
          }
        }
        if (response.status === 503 || response.status === 502 || response.status === 504) {
          console.log(`Server error (${response.status}), retrying in ${Math.pow(2, attempt) * 1000}ms`);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
        }
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        return response;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error(`Request timeout (attempt ${attempt + 1})`);
        } else {
          console.error(`Request attempt ${attempt + 1} failed:`, error.message);
        }
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
        throw error;
      }
    }
  }
  async getLatestVersion() {
    if (this.latestVersion) {
      return this.latestVersion;
    }
    const cacheKey = 'latest_version';
    return this.getCachedOrFetch(cacheKey, async () => {
      const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
      if (!response.ok) {
        this.latestVersion = '14.24.1';
        return this.latestVersion;
      }
      const versions = await response.json();
      this.latestVersion = versions[0];
      return this.latestVersion;
    });
  }
  getContinentalEndpoint(region) {
    return RIOT_API_CONTINENTAL[region] || RIOT_API_CONTINENTAL.euw1;
  }
  async getCachedOrFetch(cacheKey, fetchFunction) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    const data = await fetchFunction();
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  }
  async getAccountByRiotId(gameName, tagLine, region = 'euw1') {
    const cacheKey = `account_${gameName}_${tagLine}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const continentalEndpoint = this.getContinentalEndpoint(region);
      const url = `${continentalEndpoint}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
      const response = await this.makeRequestWithRetry(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch account: ${response.status}`);
      }
      return response.json();
    });
  }
  async getAccountByPuuid(puuid, region = 'euw1') {
    const cacheKey = `account_puuid_${puuid}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const continentalEndpoint = this.getContinentalEndpoint(region);
      const url = `${continentalEndpoint}/riot/account/v1/accounts/by-puuid/${puuid}`;
      const response = await fetch(url, {
        headers: {
          'X-Riot-Token': this.apiKey
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch account by PUUID: ${response.status}`);
      }
      return response.json();
    });
  }
  async getSummonerByPuuid(puuid, region = 'euw1') {
    const cacheKey = `summoner_${puuid}_${region}_v3`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const normalizedRegion = validateRegion(region.toLowerCase());
      const regionalEndpoint = RIOT_API_REGIONAL[normalizedRegion];
      if (!regionalEndpoint) {
        throw new Error(`Invalid region: ${region}. Normalized to: ${normalizedRegion}`);
      }
      const url = `${regionalEndpoint}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
      const response = await this.makeRequestWithRetry(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch summoner: ${response.status}`);
      }
      return response.json();
    });
  }
  async getMatchHistory(puuid, region = 'euw1', start = 0, count = 20) {
    const cacheKey = `matches_${puuid}_${start}_${count}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const continentalEndpoint = this.getContinentalEndpoint(region);
      const url = `${continentalEndpoint}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;
      const response = await this.makeRequestWithRetry(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch match history: ${response.status}`);
      }
      return response.json();
    });
  }
  async getMatchDetails(matchId, region = 'euw1') {
    const cacheKey = `match_${matchId}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const continentalEndpoint = this.getContinentalEndpoint(region);
      const url = `${continentalEndpoint}/lol/match/v5/matches/${matchId}`;
      const response = await this.makeRequestWithRetry(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch match details: ${response.status}`);
      }
      return response.json();
    });
  }
  async getMatchTimeline(matchId, region = 'euw1') {
    const cacheKey = `timeline_${matchId}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const continentalEndpoint = this.getContinentalEndpoint(region);
      const url = `${continentalEndpoint}/lol/match/v5/matches/${matchId}/timeline`;
      const response = await this.makeRequestWithRetry(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch match timeline: ${response.status}`);
      }
      return response.json();
    });
  }
  async getRankedStats(puuid, region = 'euw1') {
    const cacheKey = `ranked_${puuid}_${region}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const normalizedRegion = validateRegion(region.toLowerCase());
      const regionalEndpoint = RIOT_API_REGIONAL[normalizedRegion];
      if (!regionalEndpoint) {
        throw new Error(`Invalid region: ${region}`);
      }
      const url = `${regionalEndpoint}/lol/league/v4/entries/by-puuid/${puuid}`;
      const response = await fetch(url, {
        headers: {
          'X-Riot-Token': this.apiKey
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ranked stats: ${response.status}`);
      }
      return response.json();
    });
  }
  async getChampionMastery(puuid, championId, region = 'euw1') {
    const cacheKey = `mastery_${puuid}_${championId}_${region}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const normalizedRegion = validateRegion(region.toLowerCase());
      const regionalEndpoint = RIOT_API_REGIONAL[normalizedRegion];
      if (!regionalEndpoint) {
        throw new Error(`Invalid region: ${region}`);
      }
      const url = `${regionalEndpoint}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/by-champion/${championId}`;
      const response = await this.makeRequestWithRetry(url);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch champion mastery: ${response.status}`);
      }
      return response.json();
    });
  }
  async getLiveGame(encryptedPuuid, region = 'euw1') {
    try {
      const normalizedRegion = validateRegion(region.toLowerCase());
      const regionalEndpoint = RIOT_API_REGIONAL[normalizedRegion];
      if (!regionalEndpoint) {
        console.warn(`Invalid region for live game: ${region}`);
        return null;
      }
      const url = `${regionalEndpoint}/lol/spectator/v5/active-games/by-summoner/${encryptedPuuid}`;
      const response = await fetch(url, {
        headers: {
          'X-Riot-Token': this.apiKey
        }
      });
      if (response.status === 404) {
        return null;
      }
      if (response.status === 403) {
        console.warn(`Live game API returned 403 for region ${region}`);
        return null;
      }
      if (!response.ok) {
        console.warn(`Live game API error: ${response.status} for region ${region}`);
        return null;
      }
      return response.json();
    } catch (error) {
      console.warn(`Live game fetch error for region ${region}:`, error.message);
      return null;
    }
  }
  async getChampionData() {
    const cacheKey = 'champion_data';
    return this.getCachedOrFetch(cacheKey, async () => {
      const version = await this.getLatestVersion();
      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch champion data: ${response.status}`);
      }
      return response.json();
    });
  }
  async getItemData() {
    const cacheKey = 'item_data';
    return this.getCachedOrFetch(cacheKey, async () => {
      const version = await this.getLatestVersion();
      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch item data: ${response.status}`);
      }
      return response.json();
    });
  }
  async getSummonerSpellData() {
    const cacheKey = 'summoner_spell_data';
    return this.getCachedOrFetch(cacheKey, async () => {
      const version = await this.getLatestVersion();
      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch summoner spell data: ${response.status}`);
      }
      return response.json();
    });
  }
  async getRuneData() {
    const cacheKey = 'rune_data';
    return this.getCachedOrFetch(cacheKey, async () => {
      const version = await this.getLatestVersion();
      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch rune data: ${response.status}`);
      }
      return response.json();
    });
  }
  async getLeaderboard(tier = 'challenger', region = 'euw1', page = 1) {
    const cacheKey = `leaderboard_${tier}_${region}_${page}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const url = `${RIOT_API_REGIONAL[region]}/lol/league/v4/${tier}leagues/by-queue/RANKED_SOLO_5x5?page=${page}`;
      const response = await fetch(url, {
        headers: {
          'X-Riot-Token': this.apiKey
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${tier} leaderboard: ${response.status}`);
      }
      const data = await response.json();
      if (data.entries) {
        data.entries.sort((a, b) => b.leaguePoints - a.leaguePoints);
      }
      return data;
    });
  }
  async getCombinedLeaderboard(region = 'euw1') {
    const cacheKey = `combined_leaderboard_${region}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        const [challenger, grandmaster, master] = await Promise.all([this.getLeaderboard('challenger', region), this.getLeaderboard('grandmaster', region), this.getLeaderboard('master', region)]);
        const allPlayers = [...challenger.entries.map(entry => ({
          ...entry,
          tier: 'CHALLENGER',
          tierName: 'Challenger'
        })), ...grandmaster.entries.map(entry => ({
          ...entry,
          tier: 'GRANDMASTER',
          tierName: 'Grandmaster'
        })), ...master.entries.slice(0, 50).map(entry => ({
          ...entry,
          tier: 'MASTER',
          tierName: 'Master'
        }))];
        allPlayers.sort((a, b) => b.leaguePoints - a.leaguePoints);
        const topPlayers = allPlayers.slice(0, 100);
        const batchSize = 10;
        const playersWithNames = [];
        for (let i = 0; i < topPlayers.length; i += batchSize) {
          const batch = topPlayers.slice(i, i + batchSize);
          const batchResults = await Promise.all(batch.map(async player => {
            try {
              const accountData = await this.getAccountByPuuid(player.puuid, region);
              return {
                ...player,
                summonerName: `${accountData.gameName}#${accountData.tagLine}`,
                gameName: accountData.gameName,
                tagLine: accountData.tagLine
              };
            } catch (error) {
              console.warn(`Could not fetch account data for PUUID ${player.puuid.slice(-8)}:`, error.message);
              return {
                ...player,
                summonerName: `Player-${player.puuid.slice(-8)}`,
                gameName: `Player-${player.puuid.slice(-8)}`,
                tagLine: region.toUpperCase()
              };
            }
          }));
          playersWithNames.push(...batchResults);
          if (i + batchSize < topPlayers.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        return {
          region: region.toUpperCase(),
          totalPlayers: playersWithNames.length,
          lastUpdated: Date.now(),
          entries: playersWithNames
        };
      } catch (error) {
        console.error(`Error fetching leaderboard for ${region}:`, error);
        return {
          region: region.toUpperCase(),
          totalPlayers: 0,
          lastUpdated: Date.now(),
          entries: [],
          error: error.message
        };
      }
    });
  }
}
export const QUEUE_TYPES = {
  400: 'Normal Draft',
  420: 'Ranked Solo/Duo',
  430: 'Normal Blind',
  440: 'Ranked Flex',
  450: 'ARAM',
  700: 'Clash',
  830: 'Co-op vs AI Intro',
  840: 'Co-op vs AI Beginner',
  850: 'Co-op vs AI Intermediate',
  900: 'URF',
  920: 'Legend of the Poro King',
  1010: 'Snow URF',
  1020: 'One for All',
  1300: 'Nexus Blitz',
  1400: 'Ultimate Spellbook',
  1700: 'Arena',
  1900: 'Pick URF'
};
export const formatGameDuration = duration => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
export const formatKDA = (kills, deaths, assists) => {
  const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;
  return kda.toFixed(2);
};
export const getRankTier = (tier, rank) => {
  if (!tier) return 'Unranked';
  return `${tier} ${rank}`;
};
export const getQueueType = queueId => {
  return QUEUE_TYPES[queueId] || 'Custom';
};
export const getChampionImageUrl = async (championName, version = null) => {
  if (!version) {
    const riotApi = getRiotApi();
    version = await riotApi.getLatestVersion();
  }
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`;
};
export const getItemImageUrl = async (itemId, version = null) => {
  if (!version) {
    const riotApi = getRiotApi();
    version = await riotApi.getLatestVersion();
  }
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`;
};
export const getSummonerSpellImageUrl = async (spellName, version = null) => {
  if (!version) {
    const riotApi = getRiotApi();
    version = await riotApi.getLatestVersion();
  }
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spellName}.png`;
};
export const getProfileIconUrl = async (iconId, version = null) => {
  if (!version) {
    const riotApi = getRiotApi();
    version = await riotApi.getLatestVersion();
  }
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`;
};
export const getRuneImageUrl = (runeIcon, version = '14.24.1') => {
  return `https://ddragon.leagueoflegends.com/cdn/img/${runeIcon}`;
};
export const findRuneById = (runeData, runeId) => {
  if (!runeData || !runeId) return null;
  for (const tree of runeData) {
    if (tree.slots && tree.slots[0]) {
      for (const rune of tree.slots[0].runes) {
        if (rune.id === runeId) {
          return {
            ...rune,
            isKeystone: true,
            tree: tree.key
          };
        }
      }
    }
    if (tree.slots) {
      for (let i = 1; i < tree.slots.length; i++) {
        for (const rune of tree.slots[i].runes) {
          if (rune.id === runeId) {
            return {
              ...rune,
              isKeystone: false,
              tree: tree.key
            };
          }
        }
      }
    }
  }
  return null;
};
let riotApiInstance = null;
export const getRiotApi = () => {
  if (!riotApiInstance) {
    if (!process.env.RIOT_API_KEY) {
      throw new Error('RIOT_API_KEY environment variable is required');
    }
    riotApiInstance = new RiotAPI(process.env.RIOT_API_KEY);
  }
  return riotApiInstance;
};
export default RiotAPI;



