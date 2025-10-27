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
    const continentalEndpoint = riotApi.getContinentalEndpoint(region);
    const url = `${continentalEndpoint}/riot/account/v1/accounts/by-puuid/${puuid}`;
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': process.env.RIOT_API_KEY
      }
    });
    if (!response.ok) {
      if (response.status === 404) {
        return Response.json({
          error: 'Account not found'
        }, {
          status: 404
        });
      }
      throw new Error(`Failed to resolve PUUID: ${response.status}`);
    }
    const accountData = await response.json();
    return Response.json({
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      riotId: `${accountData.gameName}#${accountData.tagLine}`
    });
  } catch (error) {
    console.error('Error resolving PUUID:', error);
    return Response.json({
      error: 'Failed to resolve PUUID'
    }, {
      status: 500
    });
  }
}