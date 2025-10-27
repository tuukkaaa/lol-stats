import { getRiotApi } from '@/lib/riot';
import { matchCache } from '@/lib/match-cache';
import { summonerCache, staticDataCache } from '@/lib/summoner-cache';
import { matchHistoryCache } from '@/lib/match-history-cache';
export async function GET(request) {
  const startTime = Date.now();
  try {
    const {
      searchParams
    } = new URL(request.url);
    const puuid = searchParams.get('puuid');
    const region = searchParams.get('region') || 'euw1';
    const start = parseInt(searchParams.get('start') || '0');
    const count = parseInt(searchParams.get('count') || '5');
    console.log('🚀 Matches API called:', {
      puuid: puuid?.slice(-8),
      region,
      start,
      count,
      environment: process.env.NODE_ENV,
      hasApiKey: !!process.env.RIOT_API_KEY,
      timestamp: new Date().toISOString()
    });
    if (!puuid) {
      console.error('❌ Missing puuid parameter');
      return Response.json({
        error: 'puuid is required'
      }, {
        status: 400
      });
    }
    if (!process.env.RIOT_API_KEY) {
      console.error('❌ RIOT_API_KEY not found in environment variables');
      return Response.json({
        error: 'API configuration error - RIOT_API_KEY missing',
        timestamp: new Date().toISOString()
      }, {
        status: 503
      });
    }
    let riotApi;
    try {
      riotApi = getRiotApi();
      console.log('✅ Riot API instance created successfully');
    } catch (apiError) {
      console.error('❌ Failed to create Riot API instance:', apiError.message);
      return Response.json({
        error: 'API initialization failed',
        details: apiError.message,
        timestamp: new Date().toISOString()
      }, {
        status: 503
      });
    }
    console.log(`🔍 Starting match fetch for ${puuid?.slice(-8)} in ${region}`);
    let matches = [];
    let matchIds = [];
    console.log(`📡 Fetching match IDs from Riot API...`);
    try {
      const matchIdPromise = riotApi.getMatchHistory(puuid, region, start, count);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Match ID fetch timeout')), 8000));
      matchIds = await Promise.race([matchIdPromise, timeoutPromise]);
      console.log(`✅ Got ${matchIds.length} match IDs`);
      if (matchIds.length === 0) {
        console.log('⚠️ No match IDs returned from API');
        return Response.json({
          error: 'No matches found for this summoner',
          details: 'Riot API returned empty match list',
          timestamp: new Date().toISOString()
        }, {
          status: 404
        });
      }
    } catch (matchIdError) {
      console.error('❌ Failed to fetch match IDs:', matchIdError.message);
      return Response.json({
        error: 'Failed to fetch match history',
        details: matchIdError.message,
        timestamp: new Date().toISOString()
      }, {
        status: 500
      });
    }
    console.log(`📦 Fetching details for ${Math.min(matchIds.length, count)} matches`);
    const newMatches = [];
    const maxMatches = Math.min(matchIds.length, count);
    for (let i = 0; i < maxMatches; i++) {
      const matchId = matchIds[i];
      try {
        console.log(`📦 Fetching match ${i + 1}/${maxMatches}: ${matchId}`);
        const matchPromise = riotApi.getMatchDetails(matchId, region);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Match detail timeout')), 5000));
        const match = await Promise.race([matchPromise, timeoutPromise]);
        newMatches.push(match);
        console.log(`✅ Got match ${i + 1}: ${matchId}`);
        if (i < maxMatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (matchError) {
        console.error(`❌ Failed to fetch match ${matchId}:`, matchError.message);
        if (matchError.message.includes('429')) {
          console.log('Rate limited - stopping further requests');
          break;
        }
        continue;
      }
      if (Date.now() - startTime > 12000) {
        console.log('⏱️ Taking too long - stopping at', newMatches.length, 'matches');
        break;
      }
    }
    console.log(`✅ Successfully fetched ${newMatches.length} matches in ${Date.now() - startTime}ms`);
    if (newMatches.length === 0) {
      console.error('❌ No matches could be fetched');
      return Response.json({
        error: 'Unable to fetch match details',
        details: 'All match detail requests failed or timed out',
        timestamp: new Date().toISOString()
      }, {
        status: 404
      });
    }
    newMatches.sort((a, b) => {
      const aTime = a.info?.gameCreation || 0;
      const bTime = b.info?.gameCreation || 0;
      return bTime - aTime;
    });
    console.log(`📊 Processing ${newMatches.length} matches for response`);
    console.log(`📚 Fetching static data...`);
    let staticData;
    try {
      staticData = await getStaticDataWithCache();
      console.log(`✅ Got static data`);
    } catch (staticError) {
      console.error('❌ Failed to get static data:', staticError.message);
      return Response.json({
        error: 'Failed to load game data',
        details: staticError.message,
        timestamp: new Date().toISOString()
      }, {
        status: 500
      });
    }
    const processedMatches = newMatches.map((match, index) => {
      try {
        const participant = match.info.participants.find(p => p.puuid === puuid);
        if (!participant) {
          console.error(`❌ Player not found in match ${match.metadata.matchId}`);
          return null;
        }
        const allParticipants = match.info.participants.map(p => {
          const gameName = p.riotIdGameName || p.riotIdName || p.summonerName;
          const tagLine = p.riotIdTagLine || p.riotIdTag;
          const riotId = gameName && tagLine ? `${gameName}#${tagLine}` : gameName;
          return {
            summonerName: gameName,
            riotId: riotId,
            championId: p.championId,
            championName: p.championName,
            champLevel: p.champLevel,
            teamId: p.teamId,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            win: p.win,
            items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].filter(item => item > 0),
            summoner1Id: p.summoner1Id,
            summoner2Id: p.summoner2Id,
            totalMinionsKilled: p.totalMinionsKilled,
            neutralMinionsKilled: p.neutralMinionsKilled,
            goldEarned: p.goldEarned,
            totalDamageDealtToChampions: p.totalDamageDealtToChampions,
            perks: p.perks,
            puuid: p.puuid
          };
        });
        const team1 = allParticipants.filter(p => p.teamId === 100);
        const team2 = allParticipants.filter(p => p.teamId === 200);
        return {
          matchId: match.metadata.matchId,
          gameCreation: match.info.gameCreation,
          gameDuration: match.info.gameDuration,
          gameMode: match.info.gameMode,
          queueId: match.info.queueId,
          teams: {
            team1: {
              participants: team1,
              win: team1[0]?.win || false
            },
            team2: {
              participants: team2,
              win: team2[0]?.win || false
            }
          },
          participant: {
            championId: participant.championId,
            championName: participant.championName,
            champLevel: participant.champLevel,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            win: participant.win,
            items: [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6].filter(item => item > 0),
            summoner1Id: participant.summoner1Id,
            summoner2Id: participant.summoner2Id,
            totalMinionsKilled: participant.totalMinionsKilled,
            neutralMinionsKilled: participant.neutralMinionsKilled,
            goldEarned: participant.goldEarned,
            totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
            perks: participant.perks
          }
        };
      } catch (processError) {
        console.error(`❌ Error processing match ${match.metadata?.matchId}:`, processError.message);
        return null;
      }
    }).filter(match => match !== null);
    if (processedMatches.length === 0) {
      console.error('❌ No matches could be processed');
      return Response.json({
        error: 'No valid match data found',
        details: 'All matches failed processing',
        timestamp: new Date().toISOString()
      }, {
        status: 404
      });
    }
    console.log(`✅ Returning ${processedMatches.length} processed matches in ${Date.now() - startTime}ms`);
    return Response.json({
      matches: processedMatches,
      championData: staticData.championData,
      itemData: staticData.itemData,
      summonerSpellData: staticData.summonerSpellData,
      runeData: staticData.runeData,
      latestVersion: staticData.latestVersion,
      region,
      meta: {
        fetchTime: Date.now() - startTime,
        matchCount: processedMatches.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const {
      searchParams
    } = new URL(request.url);
    const errorPuuid = searchParams.get('puuid');
    const errorRegion = searchParams.get('region') || 'euw1';
    console.error('❌ Fatal error in matches API:', {
      message: error.message,
      stack: error.stack?.split('\n')[0],
      puuid: errorPuuid?.slice(-8),
      region: errorRegion,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    });
    if (error.message.includes('429') || error.message.includes('Rate limit')) {
      return Response.json({
        error: 'Rate limit exceeded',
        details: 'Too many requests - please wait before trying again',
        retryAfter: 30,
        timestamp: new Date().toISOString()
      }, {
        status: 429
      });
    }
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      return Response.json({
        error: 'Request timeout',
        details: 'The request took too long to process',
        timestamp: new Date().toISOString()
      }, {
        status: 504
      });
    }
    if (error.message.includes('404') || error.message.includes('not found')) {
      return Response.json({
        error: 'No match data found',
        details: 'This summoner has no recent match history',
        timestamp: new Date().toISOString()
      }, {
        status: 404
      });
    }
    return Response.json({
      error: 'Internal server error',
      details: 'An unexpected error occurred while fetching match data',
      code: error.message?.substring(0, 100),
      timestamp: new Date().toISOString()
    }, {
      status: 500
    });
  }
}
async function getStaticDataWithCache() {
  const riotApi = getRiotApi();
  let championData = await staticDataCache.getCachedChampionData();
  if (!championData) {
    const [champs, items, spells, runes, version] = await Promise.all([riotApi.getChampionData(), riotApi.getItemData(), riotApi.getSummonerSpellData(), riotApi.getRuneData(), riotApi.getLatestVersion()]);
    staticDataCache.cacheChampionData(champs.data, version);
    return {
      championData: champs.data,
      itemData: items.data,
      summonerSpellData: spells.data,
      runeData: runes,
      latestVersion: version
    };
  }
  const [itemData, summonerSpellData, runeData, latestVersion] = await Promise.all([riotApi.getItemData(), riotApi.getSummonerSpellData(), riotApi.getRuneData(), riotApi.getLatestVersion()]);
  return {
    championData: championData.data,
    itemData: itemData.data,
    summonerSpellData: summonerSpellData.data,
    runeData: runeData,
    latestVersion: latestVersion
  };
}
async function processAndReturnMatches(matches, puuid, region, riotApiOrStaticData) {
  let staticData;
  if (riotApiOrStaticData.getChampionData) {
    staticData = await getStaticDataWithCache();
  } else {
    staticData = riotApiOrStaticData;
  }
  const processedMatches = matches.map(match => {
    const matchInfo = match.info || match;
    const participants = matchInfo.participants || [];
    const participant = participants.find(p => p.puuid === puuid);
    if (!participant) {
      console.warn(`Participant not found in match ${match.metadata?.matchId || match.matchId}`);
      return null;
    }
    const allParticipants = participants.map(p => {
      const gameName = p.riotIdGameName || p.riotIdName || p.summonerName;
      const tagLine = p.riotIdTagLine || p.riotIdTag;
      const riotId = gameName && tagLine ? `${gameName}#${tagLine}` : null;
      return {
        summonerName: gameName,
        riotId: riotId,
        championId: p.championId,
        championName: p.championName,
        champLevel: p.champLevel,
        teamId: p.teamId,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        win: p.win,
        items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].filter(item => item > 0),
        summoner1Id: p.summoner1Id,
        summoner2Id: p.summoner2Id,
        totalMinionsKilled: p.totalMinionsKilled,
        neutralMinionsKilled: p.neutralMinionsKilled,
        goldEarned: p.goldEarned,
        totalDamageDealtToChampions: p.totalDamageDealtToChampions,
        wardsPlaced: p.wardsPlaced,
        wardsKilled: p.wardsKilled,
        visionWardsBoughtInGame: p.visionWardsBoughtInGame,
        perks: p.perks,
        puuid: p.puuid
      };
    });
    const team1 = allParticipants.filter(p => p.teamId === 100);
    const team2 = allParticipants.filter(p => p.teamId === 200);
    return {
      matchId: match.metadata?.matchId || match.matchId,
      gameCreation: matchInfo.gameCreation,
      gameDuration: matchInfo.gameDuration,
      gameMode: matchInfo.gameMode,
      queueId: matchInfo.queueId,
      teams: {
        team1: {
          participants: team1,
          win: team1[0]?.win || false
        },
        team2: {
          participants: team2,
          win: team2[0]?.win || false
        }
      },
      participant: {
        championId: participant.championId,
        championName: participant.championName,
        champLevel: participant.champLevel,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        win: participant.win,
        items: [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6].filter(item => item > 0),
        summoner1Id: participant.summoner1Id,
        summoner2Id: participant.summoner2Id,
        totalMinionsKilled: participant.totalMinionsKilled,
        neutralMinionsKilled: participant.neutralMinionsKilled,
        goldEarned: participant.goldEarned,
        totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
        perks: participant.perks
      },
      timeline: match.timeline
    };
  }).filter(match => match !== null);
  return Response.json({
    matches: processedMatches,
    championData: staticData.championData,
    itemData: staticData.itemData,
    summonerSpellData: staticData.summonerSpellData,
    runeData: staticData.runeData,
    latestVersion: staticData.latestVersion,
    region,
    cached: true
  });
}