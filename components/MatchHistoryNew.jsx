'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CompactMatchCard from './CompactMatchCard';
import DataStatus from './DataStatus';
import { formatGameDuration, formatKDA, getQueueType, getRuneImageUrl, findRuneById, QUEUE_TYPES } from '@/lib/riot';
import { Clock, Trophy, Target, Coins, ChevronDown, ChevronUp, Filter, Plus, AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react';
const MatchCard = ({
  match,
  championData,
  itemData,
  summonerSpellData,
  runeData,
  latestVersion,
  currentRegion
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const {
    participant
  } = match;
  const isWin = participant.win;
  const kda = formatKDA(participant.kills, participant.deaths, participant.assists);
  const duration = formatGameDuration(match.gameDuration);
  const queueType = getQueueType(match.queueId);
  const champion = championData ? Object.values(championData).find(champ => champ.key === participant.championId.toString()) : null;
  const getImageUrl = (type, id, fallback = '') => {
    if (!latestVersion) return fallback;
    switch (type) {
      case 'champion':
        return `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${id}`;
      case 'item':
        return `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/${id}.png`;
      case 'spell':
        return `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${id}`;
      default:
        return fallback;
    }
  };
  const handlePlayerClick = async (playerData, event) => {
    event.stopPropagation();
    const region = currentRegion || match.platformId?.toLowerCase() || 'euw1';
    console.log('Player data:', playerData);
    console.log('Region for navigation:', region);
    if (playerData.riotId && playerData.riotId.includes('#')) {
      const [gameName, tagLine] = playerData.riotId.split('#');
      if (gameName && tagLine) {
        const riotId = `${gameName}-${tagLine}`;
        console.log('Navigating with riotId:', riotId);
        router.push(`/summoner/${region}/${encodeURIComponent(riotId)}`);
        return;
      }
    }
    if (playerData.puuid && !playerData.riotId) {
      try {
        console.log('Resolving PUUID to riotId...');
        const response = await fetch(`/api/resolve-puuid?puuid=${playerData.puuid}&region=${region}`);
        if (response.ok) {
          const resolvedData = await response.json();
          const riotId = `${resolvedData.gameName}-${resolvedData.tagLine}`;
          console.log('Resolved riotId:', riotId);
          router.push(`/summoner/${region}/${encodeURIComponent(riotId)}`);
          return;
        }
      } catch (error) {
        console.error('Failed to resolve PUUID:', error);
      }
    }
    if (playerData.summonerName) {
      const riotId = `${playerData.summonerName}-000`;
      console.log('Navigating with summonerName fallback:', riotId);
      router.push(`/summoner/${region}/${encodeURIComponent(riotId)}`);
      return;
    }
    console.log('Unable to navigate - insufficient player data');
  };
  const TeamDisplay = ({
    team,
    teamName
  }) => <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center gap-2 text-stone-200">
        {teamName}
        <Badge variant={team.win ? 'default' : 'destructive'} className="text-xs">
          {team.win ? 'Victory' : 'Defeat'}
        </Badge>
      </h4>
      <div className="grid gap-2">
        {team.participants.map((p, index) => {
        const pChampion = championData ? Object.values(championData).find(champ => champ.key === p.championId.toString()) : null;
        const spell1 = summonerSpellData ? Object.values(summonerSpellData).find(spell => spell.key === p.summoner1Id.toString()) : null;
        const spell2 = summonerSpellData ? Object.values(summonerSpellData).find(spell => spell.key === p.summoner2Id.toString()) : null;
        return <div key={index} onClick={e => handlePlayerClick(p, e)} className="flex items-center gap-3 p-3 bg-stone-700/30 hover:bg-stone-600/40 rounded-lg text-sm transition-all duration-200 cursor-pointer group border border-stone-600/40 hover:border-stone-500/60 hover:shadow-md">
              <div className="relative">
                <Avatar className="h-9 w-9 border border-stone-600 group-hover:border-amber-500/50 transition-all duration-200 hover:scale-105">
                  <AvatarImage src={pChampion ? getImageUrl('champion', pChampion.image.full) : ''} alt={p.championName} />
                  <AvatarFallback className="text-xs bg-stone-600 text-stone-200 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors">
                    {p.championName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-stone-100 group-hover:text-amber-400 transition-colors">
                  {p.riotId || p.summonerName}
                </p>
                <p className="text-xs text-stone-400">{p.championName}</p>
              </div>
              
              <div className="text-center">
                <p className="font-mono text-xs text-stone-100">{p.kills}/{p.deaths}/{p.assists}</p>
                <p className="text-xs text-stone-400">
                  {formatKDA(p.kills, p.deaths, p.assists)} KDA
                </p>
              </div>
              
              <div className="flex gap-1">
                {spell1 && <img src={getImageUrl('spell', spell1.image.full)} alt={spell1.name} className="w-4 h-4 rounded" title={spell1.name} />}
                {spell2 && <img src={getImageUrl('spell', spell2.image.full)} alt={spell2.name} className="w-4 h-4 rounded" title={spell2.name} />}
              </div>
              
              <div className="flex gap-1">
                {p.items.slice(0, 6).map((itemId, itemIndex) => <div key={itemIndex} className="w-4 h-4 bg-stone-700/30 rounded border border-stone-600/40 overflow-hidden hover:border-amber-500/50 transition-all duration-200 hover:scale-110">
                    {itemData && itemData[itemId] && <img src={getImageUrl('item', itemId)} alt={itemData[itemId].name} className="w-full h-full object-cover" title={itemData[itemId].name} />}
                  </div>)}
              </div>
            </div>;
      })}
      </div>
    </div>;
  return <Card className={`group transition-all duration-300 hover:shadow-lg cursor-pointer border-l-4 ${isWin ? 'border-l-emerald-400 bg-stone-900/95 shadow-emerald-500/10 hover:shadow-emerald-500/20 border-emerald-500/20 hover:border-emerald-400/40' : 'border-l-red-400 bg-stone-900/95 shadow-red-500/10 hover:shadow-red-500/20 border-red-500/20 hover:border-red-400/40'} border-stone-700/60 hover:border-stone-600/80 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-[1.01] transform origin-center`} onClick={() => setIsExpanded(!isExpanded)}>
      <CardContent className="p-3 relative overflow-hidden">
        {}
        <div className={`absolute inset-0 pointer-events-none rounded transition-all duration-300 ${isWin ? 'bg-gradient-to-r from-emerald-500/8 via-emerald-500/4 to-transparent group-hover:from-emerald-500/12 group-hover:via-emerald-500/6' : 'bg-gradient-to-r from-red-500/8 via-red-500/4 to-transparent group-hover:from-red-500/12 group-hover:via-red-500/6'}`}></div>
        
        {}
        <div className={`absolute top-0 left-0 right-0 h-px transition-all duration-300 ${isWin ? 'bg-gradient-to-r from-emerald-400/30 via-emerald-400/10 to-transparent group-hover:from-emerald-400/50' : 'bg-gradient-to-r from-red-400/30 via-red-400/10 to-transparent group-hover:from-red-400/50'}`}></div>
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative group/avatar">
              <div className={`absolute inset-0 rounded-full blur-sm transition-all duration-300 ${isWin ? 'bg-emerald-400/20 group-hover:bg-emerald-400/30' : 'bg-red-400/20 group-hover:bg-red-400/30'}`}></div>
              <Avatar className="h-12 w-12 border border-stone-600 relative z-10 group-hover/avatar:border-stone-500 transition-colors">
                <AvatarImage src={champion ? getImageUrl('champion', champion.image.full) : ''} alt={participant.championName} />
                <AvatarFallback className="bg-stone-700 text-amber-500 font-bold">{participant.championName[0]}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-stone-800 shadow-lg backdrop-blur-sm transition-all duration-300 z-20 ${isWin ? 'bg-stone-700/90 text-emerald-300 border-emerald-500/30 group-hover:bg-stone-600/90 group-hover:text-emerald-200' : 'bg-stone-700/90 text-red-300 border-red-500/30 group-hover:bg-stone-600/90 group-hover:text-red-200'}`}>
                {participant.champLevel}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-stone-100">{participant.championName}</h3>
              <p className="text-xs text-stone-400">{queueType}</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <Badge className={`font-bold text-xs px-2 py-1 shadow-md ${isWin ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0' : 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0'}`}>
              {isWin ? 'Victory' : 'Defeat'}
            </Badge>
            <p className="text-xs text-stone-400 flex items-center justify-end gap-1">
              <Clock className="h-3 w-3" />
              {duration}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-3 relative z-10">
          <div className="text-center bg-stone-700/30 hover:bg-stone-600/40 transition-all duration-200 rounded-lg p-2.5 border border-stone-600/40 hover:border-stone-500/60">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-3 w-3 text-amber-400" />
              <span className="font-semibold text-stone-100 text-xs">KDA</span>
            </div>
            <p className="font-bold text-stone-100 text-sm font-mono">
              <span className="text-white">{participant.kills}</span>/
              <span className="text-red-400">{participant.deaths}</span>/
              <span className="text-white">{participant.assists}</span>
            </p>
            <p className="text-xs text-amber-400 font-medium">({kda})</p>
          </div>

          <div className="text-center bg-stone-700/30 hover:bg-stone-600/40 transition-all duration-200 rounded-lg p-2.5 border border-stone-600/40 hover:border-stone-500/60">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-3 w-3 text-amber-400" />
              <span className="font-semibold text-stone-100 text-xs">CS</span>
            </div>
            <p className="font-bold text-stone-100 text-sm">{(participant.totalMinionsKilled || 0) + (participant.neutralMinionsKilled || 0)}</p>
            <p className="text-xs text-amber-400 font-medium">
              {(((participant.totalMinionsKilled || 0) + (participant.neutralMinionsKilled || 0)) / (match.gameDuration / 60)).toFixed(1)}/min
            </p>
          </div>

          <div className="text-center bg-stone-700/30 hover:bg-stone-600/40 transition-all duration-200 rounded-lg p-2.5 border border-stone-600/40 hover:border-stone-500/60">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="h-3 w-3 text-amber-400" />
              <span className="font-semibold text-stone-100 text-xs">Gold</span>
            </div>
            <p className="font-bold text-stone-100 text-sm">{(participant.goldEarned / 1000).toFixed(1)}k</p>
            <p className="text-xs text-amber-400 font-medium">Earned</p>
          </div>

          <div className="text-center bg-stone-700/30 hover:bg-stone-600/40 transition-all duration-200 rounded-lg p-2.5 border border-stone-600/40 hover:border-stone-500/60">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="h-3 w-3 text-amber-400">💥</div>
              <span className="font-semibold text-stone-100 text-xs">Damage</span>
            </div>
            <p className="font-bold text-stone-100 text-sm">{(participant.totalDamageDealtToChampions / 1000).toFixed(1)}k</p>
            <p className="text-xs text-amber-400 font-medium">To Champs</p>
          </div>
        </div>

        <div className="border-t border-stone-600/60 pt-3 mb-3 relative z-10">
          <p className="text-xs text-stone-400 mb-2 font-medium">Items</p>
          <div className="flex gap-1.5">
            {participant.items.map((itemId, index) => <div key={index} className="w-7 h-7 bg-stone-700/30 rounded border border-stone-600 overflow-hidden hover:border-amber-500/50 transition-all duration-200 hover:scale-110 hover:shadow-lg">
                {itemData && itemData[itemId] && <img src={getImageUrl('item', itemId)} alt={itemData[itemId].name} className="w-full h-full object-cover" title={itemData[itemId].name} />}
              </div>)}
          </div>
        </div>

        {}
        {participant.perks && runeData && <div className="border-t border-stone-600/60 pt-3 mb-3 relative z-10">
            <p className="text-xs text-stone-400 mb-2 font-medium">Runes</p>
            <div className="flex gap-2">
              {}
              {participant.perks.styles && participant.perks.styles[0] && <div className="flex items-center gap-2">
                  {participant.perks.styles[0].selections && participant.perks.styles[0].selections[0] && <div className="relative">
                      {(() => {
                const keystoneId = participant.perks.styles[0].selections[0].perk;
                const keystone = findRuneById(runeData, keystoneId);
                return keystone ? <img src={getRuneImageUrl(keystone.icon)} alt={keystone.name} className="w-6 h-6 rounded-full border border-amber-500/50 hover:border-amber-400 transition-colors hover:scale-110 duration-200" title={`${keystone.name} (Keystone)`} /> : null;
              })()}
                    </div>}
                  
                  {}
                  {participant.perks.styles[1] && <div className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity">
                      {(() => {
                const secondaryTree = runeData.find(tree => tree.id === participant.perks.styles[1].style);
                return secondaryTree ? <img src={getRuneImageUrl(secondaryTree.icon)} alt={secondaryTree.name} className="w-full h-full hover:scale-110 transition-transform duration-200" title={`${secondaryTree.name} (Secondary)`} /> : null;
              })()}
                    </div>}
                </div>}
            </div>
          </div>}

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {isExpanded ? 'Hide' : 'Show'} all players
          </div>
        </div>

        {isExpanded && <div className="space-y-4 mt-4 pt-3 border-t border-stone-600">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TeamDisplay team={match.teams.team1} teamName="Blue Team" />
              <TeamDisplay team={match.teams.team2} teamName="Red Team" />
            </div>
          </div>}
      </CardContent>
    </Card>;
};
export default function MatchHistoryNew({
  matchData,
  isLoading,
  compact = false,
  maxMatches = null,
  region,
  summoner,
  error,
  loadMoreMatches,
  loadingMore = false,
  loadMoreError,
  hasMoreMatches = true
}) {
  const defaultQueueFilter = 'all';
  const [queueFilter, setQueueFilter] = useState(defaultQueueFilter);
  const [visibleMatches, setVisibleMatches] = useState(maxMatches || (compact ? 5 : 10));
  const matches = matchData?.matches || [];
  const championData = matchData?.championData || {};
  const itemData = matchData?.itemData || {};
  const summonerSpellData = matchData?.summonerSpellData || {};
  const runeData = matchData?.runeData || [];
  const latestVersion = matchData?.latestVersion || '';
  const availableQueues = useMemo(() => {
    if (!matches || matches.length === 0) return [];
    const queues = [...new Set(matches.map(match => match.queueId))];
    const queueCounts = {};
    matches.forEach(match => {
      queueCounts[match.queueId] = (queueCounts[match.queueId] || 0) + 1;
    });
    return queues.map(queueId => ({
      id: queueId,
      name: getQueueType(queueId),
      count: queueCounts[queueId],
      priority: queueId === 420 ? 1 : queueId === 440 ? 2 : 3
    })).sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.count - a.count;
    });
  }, [matches]);
  const filteredMatches = useMemo(() => {
    if (!matches || queueFilter === 'all') return matches;
    return matches.filter(match => match.queueId.toString() === queueFilter);
  }, [matches, queueFilter]);
  const displayMatches = useMemo(() => {
    if (!filteredMatches) return [];
    const limit = compact ? Math.min(visibleMatches, filteredMatches.length) : visibleMatches;
    return filteredMatches.slice(0, limit);
  }, [filteredMatches, visibleMatches, compact]);
  const hasMoreMatchesLocal = filteredMatches.length > displayMatches.length;
  const hasMoreMatchesToShow = loadMoreMatches ? hasMoreMatches : hasMoreMatchesLocal;
  const overallStats = useMemo(() => {
    if (!filteredMatches || filteredMatches.length === 0) return null;
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalCS = 0;
    let totalGold = 0;
    let totalDamage = 0;
    let totalGameDuration = 0;
    let wins = 0;
    let losses = 0;
    const championPlayCount = {};
    const recentMatches = filteredMatches.slice(0, 10);
    filteredMatches.forEach(match => {
      const {
        participant
      } = match;
      totalKills += participant.kills;
      totalDeaths += participant.deaths;
      totalAssists += participant.assists;
      totalCS += participant.totalMinionsKilled + (participant.neutralMinionsKilled || 0);
      totalGold += participant.goldEarned;
      totalDamage += participant.totalDamageDealtToChampions;
      totalGameDuration += match.gameDuration;
      if (participant.win) {
        wins++;
      } else {
        losses++;
      }
      const championName = participant.championName;
      championPlayCount[championName] = (championPlayCount[championName] || 0) + 1;
    });
    const matchCount = filteredMatches.length;
    const avgKills = (totalKills / matchCount).toFixed(1);
    const avgDeaths = (totalDeaths / matchCount).toFixed(1);
    const avgAssists = (totalAssists / matchCount).toFixed(1);
    const avgKDA = totalDeaths === 0 ? 'Perfect' : ((totalKills + totalAssists) / totalDeaths).toFixed(2);
    const avgCS = Math.round(totalCS / matchCount);
    const avgGold = Math.round(totalGold / matchCount / 1000);
    const avgDamage = Math.round(totalDamage / matchCount / 1000);
    const avgGameDurationMinutes = totalGameDuration / matchCount / 60;
    const avgCSPerMin = (totalCS / matchCount / avgGameDurationMinutes).toFixed(1);
    const avgGoldPerMin = Math.round(totalGold / matchCount / avgGameDurationMinutes);
    const avgDamagePerMin = Math.round(totalDamage / matchCount / avgGameDurationMinutes);
    const winRate = Math.round(wins / matchCount * 100);
    const mostPlayedChampion = Object.keys(championPlayCount).length > 0 ? Object.entries(championPlayCount).reduce((a, b) => championPlayCount[a[0]] > championPlayCount[b[0]] ? a : b) : null;
    const recentWinStreak = recentMatches.map(match => match.participant.win);
    return {
      winRate,
      wins,
      losses,
      avgKDA,
      avgKills,
      avgDeaths,
      avgAssists,
      avgCS,
      avgCSPerMin,
      avgGold,
      avgGoldPerMin,
      avgDamage,
      avgDamagePerMin,
      mostPlayedChampion: mostPlayedChampion ? {
        name: mostPlayedChampion[0],
        games: mostPlayedChampion[1]
      } : null,
      recentWinStreak
    };
  }, [filteredMatches]);
  const loadMoreMatchesLocal = () => {
    setVisibleMatches(prev => prev + (compact ? 5 : 10));
  };
  const handleLoadMore = loadMoreMatches || loadMoreMatchesLocal;
  if (isLoading) {
    return <div className="space-y-4">
        {!compact && <Card className="bg-stone-800 border-stone-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-500 font-bold">Match History</CardTitle>
            </CardHeader>
          </Card>}
        {[...Array(compact ? 3 : 5)].map((_, i) => <Card key={i} className="bg-stone-800 border-stone-700 shadow-lg">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-stone-600 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-stone-600 rounded w-32"></div>
                    <div className="h-3 bg-stone-600 rounded w-20"></div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => <div key={j} className="h-8 bg-stone-600 rounded"></div>)}
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>;
  }
  if (error) {
    return <Card className="bg-stone-800 border-stone-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-amber-500 font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Match History Error
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="text-stone-300 mb-4">
            {error?.message?.includes('429') ? <div>
                <p>Rate limit exceeded. Please wait a moment before refreshing.</p>
                <p className="text-sm text-stone-400 mt-2">
                  Too many requests - the server is being throttled for optimal performance.
                </p>
              </div> : error?.message?.includes('404') ? <p>No match history found for this summoner.</p> : error?.message?.includes('timeout') || error?.message?.includes('504') ? <div>
                <p>Server timeout - trying to fetch match data took too long.</p>
                <p className="text-sm text-stone-400 mt-2">
                  This can happen with large match histories. Try using the Update button to fetch with fewer matches.
                </p>
              </div> : <div>
                <p>Unable to load match history right now.</p>
                <p className="text-sm text-stone-400 mt-2">
                  {error?.message || 'Please try refreshing the page.'}
                </p>
              </div>}
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="bg-stone-700 border-stone-600 text-stone-200 hover:bg-stone-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </CardContent>
      </Card>;
  }
  if (!matches || matches.length === 0) {
    return <Card className="bg-stone-800 border-stone-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-amber-500 font-bold">Match History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-stone-400">No matches found</p>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-4">
      {}
      <Card className="bg-gradient-to-br from-stone-800/90 to-stone-900/90 border-stone-700/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                {compact ? 'Recent Matches' : 'Match History'}
              </CardTitle>
              <Badge variant="outline" className="text-xs text-stone-400 border-stone-600/50 bg-stone-700/20">
                {filteredMatches.length} matches
              </Badge>
              <DataStatus lastFetched={matchData?.lastFetched || new Date(Date.now() - 300000)} savedToDb={matchData?.savedToDb || true} isLoading={isLoading} error={error} size="xs" />
            </div>
            
            {}
            {availableQueues.length > 1 && <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-amber-500" />
                <Select value={queueFilter} onValueChange={setQueueFilter}>
                  <SelectTrigger className="w-40 h-8 bg-stone-700/50 border-stone-600 text-stone-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-800 border-stone-600">
                    <SelectItem value="all" className="text-stone-200 focus:bg-stone-700 text-xs">
                      All ({matches.length})
                    </SelectItem>
                    {availableQueues.map(queue => <SelectItem key={queue.id} value={queue.id.toString()} className="text-stone-200 focus:bg-stone-700 text-xs">
                        {queue.name} ({queue.count})
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>}
          </div>
        </CardHeader>
      </Card>



      {}
      {displayMatches.map(match => <CompactMatchCard key={match.matchId} match={match} championData={championData} itemData={itemData} summonerSpellData={summonerSpellData} runeData={runeData} latestVersion={latestVersion} currentRegion={region} />)}
      
      {}
      {filteredMatches.length === 0 && queueFilter !== 'all' && <Card className="bg-stone-800 border-stone-700 shadow-lg">
          <CardContent className="p-4">
            <p className="text-center text-stone-400">
              No matches found for the selected queue type
            </p>
          </CardContent>
        </Card>}
      
      {}
      {hasMoreMatchesToShow && <Card className="bg-stone-900 border-stone-700 shadow-lg">
          <CardContent className="p-4 text-center">
            <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-stone-900 font-semibold transition-colors disabled:opacity-50">
              {loadingMore ? <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </> : <>
                  <Plus className="w-4 h-4 mr-2" />
                  Load More Matches
                  {!loadMoreMatches && ` (${filteredMatches.length - displayMatches.length} remaining)`}
                </>}
            </Button>
            {loadMoreError && <p className="text-red-400 text-sm mt-2">
                {loadMoreError}
              </p>}
          </CardContent>
        </Card>}
      
      {}
      {compact && !hasMoreMatchesToShow && filteredMatches.length > 0 && <div className="text-center">
          <p className="text-sm text-stone-400">
            Showing {displayMatches.length} of {filteredMatches.length} matches
            {queueFilter !== 'all' && ` (${getQueueType(parseInt(queueFilter))})`}
          </p>
        </div>}
    </div>;
}