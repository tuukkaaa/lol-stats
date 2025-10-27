import { NextResponse } from 'next/server';
import { getRiotApi } from '@/lib/riot';
export async function GET(request, {
  params
}) {
  try {
    const matchId = params.matchId;
    if (!matchId) {
      return NextResponse.json({
        error: 'Match ID is required'
      }, {
        status: 400
      });
    }
    const riotApi = getRiotApi();
    const match = await riotApi.getMatchDetails(matchId);
    if (!match) {
      return NextResponse.json({
        error: 'Match not found'
      }, {
        status: 404
      });
    }
    const matchInfo = {
      match: match,
      participants: match.info.participants.map(participant => ({
        summonerName: participant.summonerName || participant.riotIdGameName,
        championName: participant.championName,
        championId: participant.championId,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        win: participant.win,
        teamId: participant.teamId,
        totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
        visionScore: participant.visionScore,
        cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
        items: [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6].filter(item => item !== 0)
      }))
    };
    return NextResponse.json(matchInfo);
  } catch (error) {
    console.error('Error fetching match details:', error);
    return NextResponse.json({
      error: 'Failed to fetch match details'
    }, {
      status: 500
    });
  }
}