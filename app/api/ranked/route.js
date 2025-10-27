import { getRiotApi } from '@/lib/riot';
export async function GET(request) {
  try {
    const {
      searchParams
    } = new URL(request.url);
    const puuid = searchParams.get('puuid');
    const region = searchParams.get('region') || 'euw1';
    if (!puuid) {
      return Response.json({
        error: 'puuid is required'
      }, {
        status: 400
      });
    }
    const riotApi = getRiotApi();
    const rankedStats = await riotApi.getRankedStats(puuid, region);
    const processedStats = {
      soloQueue: null,
      flexQueue: null
    };
    rankedStats.forEach(entry => {
      const processedEntry = {
        tier: entry.tier,
        rank: entry.rank,
        leaguePoints: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses,
        winRate: (entry.wins / (entry.wins + entry.losses) * 100).toFixed(1),
        hotStreak: entry.hotStreak,
        veteran: entry.veteran,
        freshBlood: entry.freshBlood,
        inactive: entry.inactive
      };
      if (entry.queueType === 'RANKED_SOLO_5x5') {
        processedStats.soloQueue = processedEntry;
      } else if (entry.queueType === 'RANKED_FLEX_SR') {
        processedStats.flexQueue = processedEntry;
      }
    });
    return Response.json(processedStats);
  } catch (error) {
    console.error('Error fetching ranked stats:', error);
    return Response.json({
      error: 'Failed to fetch ranked data'
    }, {
      status: 500
    });
  }
}