'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRankTier } from '@/lib/riot';
import { Users, Clock, Zap, Trophy, Target, Sword, ExternalLink } from 'lucide-react';
import DataStatus from './DataStatus';
const TeamCard = ({
  team,
  championData,
  summonerSpellData,
  title,
  latestVersion,
  teamColor,
  router,
  region = 'euw1'
}) => {
  const getImageUrl = (type, id, fallback = '') => {
    if (!latestVersion) return fallback;
    switch (type) {
      case 'champion':
        return `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${id}`;
      case 'spell':
        return `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${id}`;
      default:
        return fallback;
    }
  };
  const teamStats = {
    avgLevel: Math.round(team.reduce((sum, p) => sum + (p.level || 1), 0) / team.length),
    totalMastery: team.reduce((sum, p) => sum + (p.championPoints || 0), 0),
    rankedPlayers: team.filter(p => p.rankedStats).length
  };
  const handlePlayerClick = player => {
    if (player.riotId || player.summonerName) {
      const name = player.riotId || player.summonerName;
      let gameName, tagLine;
      if (name.includes('#')) {
        [gameName, tagLine] = name.split('#');
      } else {
        gameName = name;
        tagLine = region.toUpperCase();
      }
      router.push(`/summoner/${region}/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`);
    }
  };
  return <Card className={`${teamColor === 'blue' ? 'border-l-4 border-l-blue-400/50 bg-gradient-to-r from-blue-900/20 to-stone-800/90' : 'border-l-4 border-l-red-400/50 bg-gradient-to-r from-red-900/20 to-stone-800/90'} border-stone-700 shadow-lg backdrop-blur-sm h-fit`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base flex items-center gap-2 ${teamColor === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>
            {teamColor === 'blue' ? <Target className="h-4 w-4" /> : <Sword className="h-4 w-4" />}
            {title}
          </CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <div className="bg-stone-700/30 rounded px-2 py-1">
              <span className="text-amber-400 font-medium">Avg Lv. {teamStats.avgLevel}</span>
            </div>
            <div className="bg-stone-700/30 rounded px-2 py-1">
              <span className="text-emerald-400 font-medium">{teamStats.rankedPlayers}/5 Ranked</span>
            </div>
            <div className="bg-stone-700/30 rounded px-2 py-1">
              <span className="text-purple-400 font-medium">{Math.round(teamStats.totalMastery / 1000)}k Mastery</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-3">
        <div className="space-y-2">
          {team.map((player, index) => {
          const champion = championData ? Object.values(championData).find(champ => champ.key === player.championId.toString()) : null;
          const spell1 = summonerSpellData ? Object.values(summonerSpellData).find(spell => spell.key === player.spell1Id.toString()) : null;
          const spell2 = summonerSpellData ? Object.values(summonerSpellData).find(spell => spell.key === player.spell2Id.toString()) : null;
          const primaryRune = player.perks?.perkIds?.[0];
          const secondaryTree = player.perks?.perkSubStyle;
          const getRuneTreeImage = styleId => {
            const runeTreeMap = {
              8100: 'Domination',
              8000: 'Precision',
              8300: 'Inspiration',
              8400: 'Resolve',
              8200: 'Sorcery'
            };
            const treeName = runeTreeMap[styleId];
            return treeName ? `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/RunesReforged/${treeName}/${treeName}.png` : null;
          };
          return <div key={player.puuid || index} onClick={() => handlePlayerClick(player)} className="flex items-center gap-2 p-2 bg-stone-700/20 rounded-lg border border-stone-600/30 hover:bg-stone-600/30 hover:border-stone-500/50 transition-all duration-200 cursor-pointer group min-h-[60px]">
                {}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-10 w-10 border-2 border-stone-600">
                    <AvatarImage src={champion ? getImageUrl('champion', champion.image.full) : ''} alt={champion?.name || 'Champion'} />
                    <AvatarFallback className="bg-stone-600 text-stone-200 text-xs font-bold">{champion?.name?.[0] || 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {player.level || 1}
                  </div>
                </div>

                {}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  {spell1 && <img src={getImageUrl('spell', spell1.image.full)} alt={spell1.name} className="w-5 h-5 rounded border border-stone-600/50" title={spell1.name} />}
                  {spell2 && <img src={getImageUrl('spell', spell2.image.full)} alt={spell2.name} className="w-5 h-5 rounded border border-stone-600/50" title={spell2.name} />}
                </div>

                {}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  {player.perks?.perkStyle && <img src={getRuneTreeImage(player.perks.perkStyle)} alt="Primary Rune Tree" className="w-5 h-5 rounded border border-stone-600/50" title="Primary Rune Tree" onError={e => {
                e.target.style.display = 'none';
              }} />}
                  {player.perks?.perkSubStyle && <img src={getRuneTreeImage(player.perks.perkSubStyle)} alt="Secondary Rune Tree" className="w-5 h-5 rounded border border-stone-600/50 opacity-70" title="Secondary Rune Tree" onError={e => {
                e.target.style.display = 'none';
              }} />}
                </div>

                {}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-medium text-stone-100 group-hover:text-amber-400 transition-colors truncate text-sm">
                      {player.riotId || player.summonerName || 'Unknown'}
                    </h4>
                    <ExternalLink className="h-3 w-3 text-stone-400 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                  </div>
                  <div className="text-xs text-stone-400 truncate">
                    {champion?.name || 'Unknown Champion'}
                  </div>
                </div>

                {}
                <div className="flex items-center gap-1 flex-shrink-0 min-w-[60px]">
                  {player.rankedStats ? <>
                      <img src={`/img/${player.rankedStats.tier.charAt(0).toUpperCase() + player.rankedStats.tier.slice(1).toLowerCase()}.png`} alt={`${player.rankedStats.tier} ${player.rankedStats.rank}`} className="w-5 h-5" onError={e => {
                  e.target.style.display = 'none';
                }} />
                      <div className="text-right">
                        <div className="font-bold text-xs text-amber-400 leading-tight">
                          {player.rankedStats.tier.charAt(0).toUpperCase()}{player.rankedStats.rank}
                        </div>
                        <div className="text-xs text-stone-300 leading-tight">
                          {player.rankedStats.leaguePoints}LP
                        </div>
                      </div>
                    </> : <div className="text-xs text-stone-400 font-medium">Unranked</div>}
                </div>

                {}
                <div className="text-right flex-shrink-0 min-w-[40px]">
                  {player.rankedStats ? <>
                      <div className={`font-bold text-xs ${player.rankedStats.winRate >= 60 ? 'text-emerald-400' : player.rankedStats.winRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {player.rankedStats.winRate}%
                      </div>
                      <div className="text-xs text-stone-400">
                        {player.rankedStats.wins}W {player.rankedStats.losses}L
                      </div>
                    </> : <div className="font-bold text-xs text-amber-400">
                      {player.championPoints ? `${Math.round(player.championPoints / 1000)}k` : '0'}
                    </div>}
                </div>

                {}
                {player.rankedStats && <div className="text-right flex-shrink-0 min-w-[30px]">
                    <div className="font-bold text-xs text-amber-400">
                      {player.championPoints ? `${Math.round(player.championPoints / 1000)}k` : '0'}
                    </div>
                    <div className="text-xs text-stone-400">
                      {player.championLevel ? `M${player.championLevel}` : 'M0'}
                    </div>
                  </div>}
              </div>;
        })}
        </div>
      </CardContent>
    </Card>;
};
export default function LiveGame({
  liveGameData,
  isLoading,
  summoner
}) {
  const router = useRouter();
  if (isLoading) {
    return <Card className="bg-gradient-to-r from-stone-800/90 to-stone-900/90 border-stone-700 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Zap className="h-5 w-5" />
            Live Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-stone-600/50 rounded w-1/2"></div>
            <div className="h-32 bg-stone-600/50 rounded"></div>
          </div>
        </CardContent>
      </Card>;
  }
  if (!liveGameData || !liveGameData.inGame) {
    return <Card className="bg-gradient-to-r from-stone-800/90 to-stone-900/90 border-stone-700 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Zap className="h-5 w-5" />
            Live Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-stone-400">
            <div className="bg-stone-700/30 rounded-full p-4 w-fit mx-auto mb-4">
              <Users className="h-12 w-12 opacity-70" />
            </div>
            <p className="font-medium text-stone-300">Not currently in a game</p>
            <p className="text-sm mt-2 text-stone-400">Live game data will appear here when {summoner?.account.gameName} is playing</p>
          </div>
        </CardContent>
      </Card>;
  }
  const gameLength = liveGameData.gameLength;
  const minutes = Math.floor(gameLength / 60);
  const seconds = gameLength % 60;
  return <div className="space-y-4">
      <Card className="bg-gradient-to-r from-stone-800/90 to-stone-900/90 border-stone-700 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Zap className="h-5 w-5" />
              Live Game
            </CardTitle>
            <DataStatus lastFetched={liveGameData?.lastFetched || new Date(Date.now() - 30000)} savedToDb={false} size="xs" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-stone-700/30 rounded-lg p-3">
                <h3 className="font-bold text-base text-stone-100">{liveGameData.gameMode}</h3>
                <p className="text-xs text-stone-400">{liveGameData.gameType}</p>
              </div>
              <Badge className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border-emerald-500/30 px-3 py-1 text-sm font-bold">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2 shadow-lg shadow-emerald-500/50"></div>
                Live Match
              </Badge>
            </div>
            <div className="text-center bg-stone-700/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-stone-100">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="font-mono text-xl font-bold">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium">Game Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <TeamCard team={liveGameData.teams.team1} championData={liveGameData.championData} summonerSpellData={liveGameData.summonerSpellData} latestVersion={liveGameData.latestVersion} title="Blue Team" teamColor="blue" router={router} region={liveGameData.region || 'euw1'} />
        
        <TeamCard team={liveGameData.teams.team2} championData={liveGameData.championData} summonerSpellData={liveGameData.summonerSpellData} latestVersion={liveGameData.latestVersion} title="Red Team" teamColor="red" router={router} region={liveGameData.region || 'euw1'} />
      </div>
    </div>;
}