import { getRiotApi } from '@/lib/riot';
export async function GET(request) {
  try {
    const {
      searchParams
    } = new URL(request.url);
    const region = searchParams.get('region') || 'euw1';
    const tier = searchParams.get('tier') || 'combined';
    const riotApi = getRiotApi();
    if (tier === 'combined') {
      const leaderboardData = await riotApi.getCombinedLeaderboard(region);
      return Response.json({
        success: true,
        data: leaderboardData
      });
    } else {
      const leaderboardData = await riotApi.getLeaderboard(tier, region);
      return Response.json({
        success: true,
        data: {
          region: region.toUpperCase(),
          tier: tier.toUpperCase(),
          totalPlayers: leaderboardData.entries?.length || 0,
          lastUpdated: Date.now(),
          entries: leaderboardData.entries || []
        }
      });
    }
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch leaderboard data',
      details: error.message
    }, {
      status: 500
    });
  }
}