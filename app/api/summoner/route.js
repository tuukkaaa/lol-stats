import { getRiotApi } from '@/lib/riot';
export async function GET(request) {
  try {
    console.log('Environment check:', {
      hasRiotKey: !!process.env.RIOT_API_KEY,
      keyPrefix: process.env.RIOT_API_KEY?.substring(0, 10) + '...',
      nodeEnv: process.env.NODE_ENV
    });
    const {
      searchParams
    } = new URL(request.url);
    const gameName = searchParams.get('gameName');
    const tagLine = searchParams.get('tagLine');
    const region = searchParams.get('region') || 'euw1';
    if (!gameName || !tagLine) {
      return Response.json({
        error: 'gameName and tagLine are required'
      }, {
        status: 400
      });
    }
    const riotApi = getRiotApi();
    const account = await riotApi.getAccountByRiotId(gameName, tagLine, region);
    const summoner = await riotApi.getSummonerByPuuid(account.puuid, region);
    return Response.json({
      account,
      summoner,
      region
    });
  } catch (error) {
    console.error('Error fetching summoner:', {
      message: error.message,
      stack: error.stack,
      gameName,
      tagLine,
      region
    });
    if (error.message.includes('RIOT_API_KEY environment variable is required')) {
      return Response.json({
        error: 'Server configuration error: Missing API key'
      }, {
        status: 500
      });
    }
    if (error.message.includes('404')) {
      return Response.json({
        error: 'Summoner not found'
      }, {
        status: 404
      });
    }
    if (error.message.includes('403')) {
      return Response.json({
        error: 'API key invalid or expired'
      }, {
        status: 403
      });
    }
    return Response.json({
      error: `Failed to fetch summoner data: ${error.message}`
    }, {
      status: 500
    });
  }
}