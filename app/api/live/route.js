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
    const liveGame = await riotApi.getLiveGame(puuid, region);
    if (!liveGame) {
      return Response.json({
        inGame: false
      });
    }
    const [championData, summonerSpellData, runeData, latestVersion] = await Promise.all([riotApi.getChampionData(), riotApi.getSummonerSpellData(), riotApi.getRuneData(), riotApi.getLatestVersion()]);
    const participantPromises = liveGame.participants.map(async participant => {
      try {
        const playerPuuid = participant.puuid;
        if (!playerPuuid) {
          console.warn('Participant missing PUUID:', participant);
          return participant;
        }
        const rankedStats = await riotApi.getRankedStats(playerPuuid, region);
        const soloQueue = rankedStats.find(entry => entry.queueType === 'RANKED_SOLO_5x5');
        return {
          ...participant,
          rankedStats: soloQueue ? {
            tier: soloQueue.tier,
            rank: soloQueue.rank,
            leaguePoints: soloQueue.leaguePoints,
            wins: soloQueue.wins,
            losses: soloQueue.losses,
            winRate: (soloQueue.wins / (soloQueue.wins + soloQueue.losses) * 100).toFixed(1)
          } : null
        };
      } catch (error) {
        console.warn(`Could not get ranked stats for player:`, error.message);
        return participant;
      }
    });
    const enrichedParticipants = await Promise.all(participantPromises);
    const team1 = enrichedParticipants.filter(p => p.teamId === 100);
    const team2 = enrichedParticipants.filter(p => p.teamId === 200);
    const processedLiveGame = {
      inGame: true,
      gameId: liveGame.gameId,
      gameMode: liveGame.gameMode,
      gameType: liveGame.gameType,
      gameLength: liveGame.gameLength,
      gameStartTime: liveGame.gameStartTime,
      teams: {
        team1,
        team2
      },
      championData: championData.data,
      summonerSpellData: summonerSpellData.data,
      runeData,
      latestVersion
    };
    return Response.json(processedLiveGame);
  } catch (error) {
    console.error('Error fetching live game:', error);
    return Response.json({
      inGame: false
    });
  }
}