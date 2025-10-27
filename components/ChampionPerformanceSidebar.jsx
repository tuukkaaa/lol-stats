'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
const fetcher = url => fetch(url).then(res => res.json());
export default function ChampionPerformanceSidebar({
  summoner,
  region,
  matchData,
  championData,
  latestVersion,
  allGames = true
}) {
  const [showAll, setShowAll] = useState(false);
  const {
    data: seasonData,
    isLoading: seasonLoading,
    error: seasonError
  } = useSWR(allGames && summoner?.account?.puuid && region ? `/api/champion-performance?puuid=${summoner.account.puuid}&region=${region}&count=25` : null, fetcher, {
    refreshInterval: 300000,
    fallbackData: null,
    onError: error => {
      console.log('Season data fetch error:', error);
    }
  });
  const dataToUse = useMemo(() => {
    if (allGames && seasonData?.matches) {
      console.log('Using season data:', seasonData.matches.length, 'matches');
      return seasonData;
    }
    console.log('Using match data:', matchData?.matches?.length || 0, 'matches');
    return matchData;
  }, [allGames, seasonData, matchData]);
  const championStats = useMemo(() => {
    if (!dataToUse?.matches?.length) {
      console.log('No matches available for champion stats');
      return [];
    }
    const stats = {};
    const matchesToProcess = dataToUse.matches;
    console.log('Processing', matchesToProcess.length, 'matches for champion stats');
    matchesToProcess.forEach(match => {
      const {
        participant
      } = match;
      const championName = participant.championName;
      if (!stats[championName]) {
        stats[championName] = {
          championName,
          championId: participant.championId,
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          totalDamage: 0,
          cs: 0,
          gold: 0
        };
      }
      const stat = stats[championName];
      stat.games++;
      if (participant.win) stat.wins++;
      stat.kills += participant.kills;
      stat.deaths += participant.deaths;
      stat.assists += participant.assists;
      stat.totalDamage += participant.totalDamageDealtToChampions;
      stat.cs += participant.totalMinionsKilled;
      stat.gold += participant.goldEarned;
    });
    Object.values(stats).forEach(stat => {
      stat.winRate = stat.wins / stat.games * 100;
      stat.avgKDA = stat.deaths > 0 ? (stat.kills + stat.assists) / stat.deaths : stat.kills + stat.assists;
      stat.avgKills = stat.kills / stat.games;
      stat.avgDeaths = stat.deaths / stat.games;
      stat.avgAssists = stat.assists / stat.games;
      stat.avgDamage = stat.totalDamage / stat.games;
      stat.avgCS = stat.cs / stat.games;
      stat.avgGold = stat.gold / stat.games;
    });
    const result = Object.values(stats).sort((a, b) => b.games - a.games).slice(0, showAll ? undefined : 5);
    console.log('Champion stats calculated:', result.length, 'champions');
    return result;
  }, [dataToUse, showAll]);
  const getChampionImageUrl = championId => {
    const champData = dataToUse?.championData || championData;
    const version = dataToUse?.latestVersion || latestVersion;
    if (!champData || !version) return '';
    const champion = Object.values(champData).find(champ => champ.key === championId.toString());
    return champion ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}` : '';
  };
  if (allGames && seasonLoading && !seasonData && !matchData?.matches?.length) {
    return <Card className="bg-stone-900/95 border-stone-700/60 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-amber-400">
            Champion Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="flex items-center gap-3 p-2">
                <div className="h-10 w-10 bg-stone-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-600 rounded w-3/4"></div>
                  <div className="h-2 bg-stone-600 rounded"></div>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>;
  }
  if (!dataToUse?.matches?.length) {
    console.log('No data available, not rendering champion performance');
    return null;
  }
  const totalMatches = dataToUse?.totalMatches || dataToUse?.matches?.length || 0;
  return <Card className="bg-gradient-to-br from-stone-800/90 to-stone-900/90 border-stone-700/50 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-amber-400 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          Champion Performance
        </CardTitle>
        <div className="flex justify-between items-center mt-2">
          <Badge variant="outline" className="text-xs text-stone-400 border-stone-600/50 bg-stone-700/20">
            {allGames ? `Season Stats (${totalMatches})` : 'Recent 20'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {championStats.map(stat => <div key={stat.championName} className="bg-gradient-to-r from-stone-800/30 to-stone-700/30 rounded-xl p-3 border border-stone-600/20">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-gradient-to-br from-amber-400/10 to-amber-600/5 rounded-lg border border-amber-500/20">
                <Avatar className="h-10 w-10 border border-stone-600/50">
                  <AvatarImage src={getChampionImageUrl(stat.championId)} alt={stat.championName} />
                  <AvatarFallback className="bg-stone-700 text-amber-500 text-xs font-bold">
                    {stat.championName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-stone-100 text-sm truncate">{stat.championName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 bg-stone-700/30 px-2 py-1 rounded-full">{stat.games}G</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.winRate >= 60 ? 'text-emerald-400 bg-emerald-500/10' : stat.winRate >= 50 ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {stat.winRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              
              <div className="space-y-1">
                <Progress value={stat.winRate} className="h-1.5" style={{
                '--progress-background': stat.winRate >= 60 ? 'rgb(34 197 94)' : stat.winRate >= 50 ? 'rgb(245 158 11)' : 'rgb(239 68 68)'
              }} />
                <div className="flex justify-between text-xs text-stone-400">
                  <span>{stat.avgKDA.toFixed(1)} KDA</span>
                  <span>{(stat.avgDamage / 1000).toFixed(0)}k DMG</span>
                </div>
              </div>
              </div>
            </div>
          </div>)}
        
        {dataToUse?.matches && championStats.length < Object.keys(dataToUse.matches.reduce((acc, match) => {
        acc[match.participant.championName] = true;
        return acc;
      }, {})).length && <button onClick={() => setShowAll(!showAll)} className="w-full text-xs text-amber-400 hover:text-amber-300 transition-colors py-2 border-t border-stone-700 mt-3">
            {showAll ? 'Show Less' : 'Show All Champions'}
          </button>}
      </CardContent>
    </Card>;
}