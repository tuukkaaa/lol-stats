import { getRiotApi } from '@/lib/riot';
export async function GET(request) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 15000);
  });
  try {
    const {
      searchParams
    } = new URL(request.url);
    const puuid = searchParams.get('puuid');
    const region = searchParams.get('region') || 'euw1';
    const count = parseInt(searchParams.get('count') || '20');
    if (!puuid) {
      return Response.json({
        error: 'puuid is required'
      }, {
        status: 400
      });
    }
    const riotApi = getRiotApi();
    const result = await Promise.race([timeoutPromise, (async () => {
      const matchIds = await riotApi.getMatchHistory(puuid, region, 0, count);
      const batchSize = 3;
      const matches = [];
      let processedCount = 0;
      for (let i = 0; i < matchIds.length; i += batchSize) {
        const batch = matchIds.slice(i, i + batchSize);
        try {
          const batchPromises = batch.map(async matchId => {
            try {
              return await riotApi.getMatchDetails(matchId, region);
            } catch (error) {
              console.warn(`Failed to fetch match ${matchId}, skipping:`, error.message);
              return null;
            }
          });
          const batchResults = await Promise.all(batchPromises);
          const validMatches = batchResults.filter(match => match !== null);
          matches.push(...validMatches);
          processedCount += batch.length;
          if (i + batchSize < matchIds.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          if (matches.length >= Math.min(count, 15)) {
            console.log(`Early exit: Got ${matches.length} matches, stopping batch processing`);
            break;
          }
        } catch (error) {
          console.error(`Error fetching champion performance batch starting at ${i}:`, error);
          continue;
        }
      }
      const [championData, latestVersion] = await Promise.all([riotApi.getChampionData(), riotApi.getLatestVersion()]);
      const processedMatches = matches.filter(match => match && match.info).map(match => {
        const participant = match.info.participants.find(p => p.puuid === puuid);
        if (!participant) {
          console.warn(`Participant not found in match ${match.metadata.matchId}`);
          return null;
        }
        return {
          matchId: match.metadata.matchId,
          gameCreation: match.info.gameCreation,
          gameDuration: match.info.gameDuration,
          gameMode: match.info.gameMode,
          queueId: match.info.queueId,
          participant: {
            championId: participant.championId,
            championName: participant.championName,
            champLevel: participant.champLevel,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            win: participant.win,
            totalMinionsKilled: participant.totalMinionsKilled,
            goldEarned: participant.goldEarned,
            totalDamageDealtToChampions: participant.totalDamageDealtToChampions
          }
        };
      }).filter(match => match !== null);
      console.log(`Successfully processed ${processedMatches.length} out of ${matchIds.length} requested matches`);
      return Response.json({
        matches: processedMatches,
        championData: championData.data,
        latestVersion,
        region,
        totalMatches: processedMatches.length
      });
    })()]);
    return result;
  } catch (error) {
    console.error('Error fetching champion performance data:', error);
    if (error.message === 'Request timeout') {
      return Response.json({
        error: 'Request timeout - please try again with fewer matches'
      }, {
        status: 504
      });
    }
    return Response.json({
      error: 'Failed to fetch champion performance data'
    }, {
      status: 500
    });
  }
}