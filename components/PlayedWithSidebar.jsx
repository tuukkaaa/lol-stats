'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
export default function PlayedWithSidebar({
  matchData,
  championData,
  latestVersion,
  currentSummonerPuuid,
  region
}) {
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();
  const playedWithStats = useMemo(() => {
    if (!matchData?.matches || !currentSummonerPuuid) return [];
    const stats = {};
    matchData.matches.forEach(match => {
      const currentPlayer = match.teams.team1.participants.find(p => p.puuid === currentSummonerPuuid) || match.teams.team2.participants.find(p => p.puuid === currentSummonerPuuid);
      if (!currentPlayer) return;
      const teammates = currentPlayer.teamId === 100 ? match.teams.team1.participants.filter(p => p.puuid !== currentSummonerPuuid) : match.teams.team2.participants.filter(p => p.puuid !== currentSummonerPuuid);
      teammates.forEach(teammate => {
        const playerId = teammate.puuid || teammate.summonerName || `${teammate.championName}-${Math.random()}`;
        const playerName = teammate.riotId || teammate.summonerName || `Player-${playerId.slice(-8)}`;
        if (!stats[playerId]) {
          stats[playerId] = {
            playerId,
            playerName,
            puuid: teammate.puuid,
            gamesPlayed: 0,
            gamesWon: 0,
            lastChampion: teammate.championName,
            lastChampionId: teammate.championId,
            champions: new Set(),
            totalKills: 0,
            totalDeaths: 0,
            totalAssists: 0,
            lastPlayed: match.gameCreation
          };
        }
        const stat = stats[playerId];
        stat.gamesPlayed++;
        if (teammate.win) stat.gamesWon++;
        stat.champions.add(teammate.championName);
        stat.totalKills += teammate.kills;
        stat.totalDeaths += teammate.deaths;
        stat.totalAssists += teammate.assists;
        if (match.gameCreation > stat.lastPlayed) {
          stat.lastPlayed = match.gameCreation;
          stat.lastChampion = teammate.championName;
          stat.lastChampionId = teammate.championId;
        }
      });
    });
    Object.values(stats).forEach(stat => {
      stat.winRate = stat.gamesWon / stat.gamesPlayed * 100;
      stat.avgKDA = stat.totalDeaths > 0 ? (stat.totalKills + stat.totalAssists) / stat.totalDeaths : stat.totalKills + stat.totalAssists;
      stat.championsCount = stat.champions.size;
    });
    return Object.values(stats).filter(stat => stat.gamesPlayed >= 2).sort((a, b) => b.gamesPlayed - a.gamesPlayed).slice(0, showAll ? undefined : 8);
  }, [matchData, currentSummonerPuuid, showAll]);
  const getChampionImageUrl = championId => {
    if (!championData || !latestVersion) return '';
    const champion = Object.values(championData).find(champ => champ.key === championId.toString());
    return champion ? `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}` : '';
  };
  const handlePlayerClick = async playerData => {
    if (!region) return;
    if (playerData.playerName?.includes('#')) {
      const [gameName, tagLine] = playerData.playerName.split('#');
      if (gameName && tagLine) {
        const riotId = `${gameName}-${tagLine}`;
        router.push(`/summoner/${region}/${encodeURIComponent(riotId)}`);
        return;
      }
    }
    if (playerData.playerName) {
      const riotId = `${playerData.playerName}-000`;
      router.push(`/summoner/${region}/${encodeURIComponent(riotId)}`);
    }
  };
  if (!playedWithStats.length) {
    return null;
  }
  return <Card className="bg-gradient-to-br from-stone-800/90 to-stone-900/90 border-stone-700/50 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-amber-400 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          Played With
        </CardTitle>
        <div className="flex justify-between items-center mt-2">
          <Badge variant="outline" className="text-xs text-stone-400 border-stone-600/50 bg-stone-700/20">
            {playedWithStats.length} players
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {playedWithStats.map(stat => <div key={stat.playerId} onClick={() => handlePlayerClick(stat)} className="bg-gradient-to-r from-stone-800/30 to-stone-700/30 rounded-xl p-3 border border-stone-600/20 hover:border-amber-500/30 transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="relative p-1 bg-gradient-to-br from-amber-400/10 to-amber-600/5 rounded-lg border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                <Avatar className="h-10 w-10 border border-stone-600/50">
                <AvatarImage src={getChampionImageUrl(stat.lastChampionId)} alt={stat.lastChampion} />
                <AvatarFallback className="bg-stone-700 text-amber-500 text-xs font-bold">
                  {stat.playerName[0]?.toUpperCase() || 'P'}
                </AvatarFallback>
              </Avatar>
              {}
              {stat.championsCount > 1 && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-stone-800 border border-amber-500/50 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-400">{stat.championsCount}</span>
                </div>}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-stone-100 text-sm truncate group-hover:text-amber-400 transition-colors">
                  {stat.playerName}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">{stat.gamesPlayed}G</span>
                  <div className="flex items-center gap-1">
                    {stat.winRate >= 60 ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : stat.winRate < 40 ? <TrendingDown className="h-3 w-3 text-red-400" /> : null}
                    <span className={`text-xs font-semibold ${stat.winRate >= 60 ? 'text-emerald-400' : stat.winRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {stat.winRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress value={stat.winRate} className="h-1.5" style={{
                '--progress-background': stat.winRate >= 60 ? 'rgb(34 197 94)' : stat.winRate >= 50 ? 'rgb(245 158 11)' : 'rgb(239 68 68)'
              }} />
                <div className="flex justify-between text-xs text-stone-400">
                  <span>{stat.avgKDA.toFixed(1)} KDA</span>
                  <span className="truncate">{stat.lastChampion}</span>
                </div>
              </div>
              </div>
            </div>
          </div>)}
        
        {matchData?.matches && playedWithStats.length >= 8 && <button onClick={() => setShowAll(!showAll)} className="w-full text-xs text-amber-400 hover:text-amber-300 transition-colors py-2 border-t border-stone-700 mt-3">
            {showAll ? 'Show Less' : 'Show All Players'}
          </button>}
        
        <div className="text-xs text-stone-500 text-center pt-2 border-t border-stone-700">
          Shows players you've played with 2+ times
        </div>
      </CardContent>
    </Card>;
}