import { getRiotApi } from '@/lib/riot';
export async function GET(request) {
  try {
    const {
      searchParams
    } = new URL(request.url);
    const puuid = searchParams.get('puuid');
    const region = searchParams.get('region') || 'euw1';
    console.log('🚀 Matches Debug API called:', {
      puuid: puuid?.slice(-8),
      region,
      environment: process.env.NODE_ENV,
      hasApiKey: !!process.env.RIOT_API_KEY
    });
    if (!puuid) {
      return Response.json({
        error: 'puuid is required'
      }, {
        status: 400
      });
    }
    if (!process.env.RIOT_API_KEY) {
      return Response.json({
        error: 'API configuration error - RIOT_API_KEY not found'
      }, {
        status: 503
      });
    }
    const riotApi = getRiotApi();
    const startTime = Date.now();
    const matchIds = await riotApi.getMatchHistory(puuid, region, 0, 3);
    const matchIdsTime = Date.now() - startTime;
    console.log(`✅ Got ${matchIds.length} match IDs in ${matchIdsTime}ms`);
    let matchDetail = null;
    let matchDetailTime = 0;
    if (matchIds.length > 0) {
      const detailStartTime = Date.now();
      try {
        matchDetail = await riotApi.getMatchDetails(matchIds[0], region);
        matchDetailTime = Date.now() - detailStartTime;
        console.log(`✅ Got match detail in ${matchDetailTime}ms`);
      } catch (error) {
        console.error(`❌ Match detail failed:`, error.message);
      }
    }
    return Response.json({
      success: true,
      timing: {
        matchIds: `${matchIdsTime}ms`,
        matchDetail: matchDetail ? `${matchDetailTime}ms` : 'failed'
      },
      data: {
        matchIdsCount: matchIds.length,
        hasMatchDetail: !!matchDetail,
        sampleMatchId: matchIds[0] || null
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasApiKey: !!process.env.RIOT_API_KEY,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, {
      status: 500
    });
  }
}