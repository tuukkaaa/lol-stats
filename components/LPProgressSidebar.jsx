'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, BarChart3, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import DataStatus from './DataStatus';
export default function LPProgressSidebar({
  rankedData,
  matchHistory,
  horizontal = false,
  summoner = null,
  liveGameData = null,
  onToggleLiveGame = null,
  onUpdate = null
}) {
  const [profileIconUrl, setProfileIconUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(cooldownRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);
  const handleUpdate = async () => {
    if (!onUpdate || isUpdating || cooldownRemaining > 0) return;
    try {
      setIsUpdating(true);
      await onUpdate();
      setLastUpdateTime(new Date());
      setCooldownRemaining(60);
    } catch (error) {
      console.error('Failed to update and save data:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  useEffect(() => {
    const loadProfileIcon = async () => {
      if (!summoner?.summoner?.profileIconId) return;
      try {
        const versionResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await versionResponse.json();
        const latestVersion = versions[0];
        const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${summoner.summoner.profileIconId}.png`;
        setProfileIconUrl(iconUrl);
      } catch (error) {
        const iconUrl = `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${summoner.summoner.profileIconId}.png`;
        setProfileIconUrl(iconUrl);
      }
    };
    if (horizontal && summoner?.summoner?.profileIconId) {
      loadProfileIcon();
    }
  }, [horizontal, summoner?.summoner?.profileIconId]);
  if (!rankedData?.soloQueue && !horizontal) return null;
  if (!rankedData?.soloQueue && horizontal && !summoner) return null;
  const {
    soloQueue
  } = rankedData || {};
  const currentLP = soloQueue?.leaguePoints || 0;
  const tier = soloQueue?.tier || 'UNRANKED';
  const rank = soloQueue?.rank || '';
  const wins = soloQueue?.wins || 0;
  const losses = soloQueue?.losses || 0;
  const winRate = soloQueue?.winRate || 0;
  const getProgressValue = () => {
    if (tier === 'MASTER' || tier === 'GRANDMASTER' || tier === 'CHALLENGER') {
      return Math.min(currentLP, 100);
    }
    return currentLP;
  };
  const lpProgress = getProgressValue();
  const isHighTier = tier === 'MASTER' || tier === 'GRANDMASTER' || tier === 'CHALLENGER';
  const getNextMilestone = () => {
    if (tier === 'MASTER' || tier === 'GRANDMASTER' || tier === 'CHALLENGER') {
      return tier === 'CHALLENGER' ? 'Rank 1' : tier === 'GRANDMASTER' ? 'Challenger' : 'Grandmaster';
    }
    if (rank === 'I') {
      const tierOrder = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND'];
      const currentIndex = tierOrder.indexOf(tier);
      return currentIndex < tierOrder.length - 1 ? `${tierOrder[currentIndex + 1]} IV` : 'Master';
    }
    const rankOrder = ['IV', 'III', 'II', 'I'];
    const currentIndex = rankOrder.indexOf(rank);
    return currentIndex > 0 ? `${tier} ${rankOrder[currentIndex - 1]}` : `${tier} I`;
  };
  const nextMilestone = getNextMilestone();
  const getLPNeeded = () => {
    if (tier === 'MASTER' || tier === 'GRANDMASTER' || tier === 'CHALLENGER') {
      return null;
    }
    return 100 - currentLP;
  };
  const lpNeeded = getLPNeeded();
  const getTotalLP = () => {
    const tierOrder = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
    const rankOrder = ['IV', 'III', 'II', 'I'];
    if (tier === 'MASTER' || tier === 'GRANDMASTER' || tier === 'CHALLENGER') {
      const baseLP = tierOrder.indexOf('MASTER') * 400;
      if (tier === 'MASTER') return baseLP + currentLP;
      if (tier === 'GRANDMASTER') return baseLP + 1000 + currentLP;
      return baseLP + 2000 + currentLP;
    }
    const tierIndex = tierOrder.indexOf(tier);
    const rankIndex = rankOrder.indexOf(rank);
    return tierIndex * 400 + (3 - rankIndex) * 100 + currentLP;
  };
  const getRecentRankedMatches = () => {
    if (!matchHistory || !Array.isArray(matchHistory)) {
      return null;
    }
    const rankedMatches = matchHistory.filter(match => match.queueId === 420).slice(0, 10);
    if (rankedMatches.length === 0) {
      return null;
    }
    return rankedMatches.map(match => {
      const participant = match.participant;
      const isWin = participant.win;
      return {
        result: isWin ? 'W' : 'L',
        matchId: match.matchId,
        gameCreation: match.gameCreation,
        gameDuration: match.gameDuration,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        championName: participant.championName,
        win: isWin
      };
    });
  };
  const recentRankedMatches = getRecentRankedMatches();
  return <Card className="bg-gradient-to-br from-stone-800/90 to-stone-900/90 border-stone-700/50 backdrop-blur-sm shadow-xl">
      <CardContent className={horizontal ? "space-y-4 py-2" : "space-y-5"}>
        {horizontal ? (<div className="space-y-6">
            {}
            {summoner && <div className="bg-gradient-to-r from-stone-900/95 to-stone-800/95 border border-stone-700/60 rounded-xl p-6 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full blur-xl"></div>
                      <Avatar className="h-16 w-16 border-4 border-amber-500/80 shadow-lg relative z-10">
                        <AvatarImage src={profileIconUrl} alt={`${summoner.account.gameName}'s profile icon`} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-stone-700 to-stone-800 text-amber-500 text-2xl font-bold">
                          {summoner.account.gameName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute z-10 -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-800 text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-amber-500 shadow-lg">
                        {summoner.summoner.summonerLevel}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-stone-100 tracking-tight">
                          {summoner.account.gameName}
                        </h2>
                        <span className="text-xl text-stone-400 font-medium">
                          #{summoner.account.tagLine}
                        </span>
                        <Badge variant="secondary" className="uppercase bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30 font-bold tracking-wider shadow-md">
                          {summoner.region}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 text-stone-400">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          <p className="text-sm font-medium text-stone-300">
                            Level {summoner.summoner.summonerLevel}
                          </p>
                        </div>
                        <div className="w-px h-4 bg-stone-600"></div>
                        <DataStatus lastFetched={rankedData?.lastFetched || new Date(Date.now() - 600000)} savedToDb={rankedData?.savedToDb || false} size="xs" />
                      </div>
                    </div>
                  </div>
                  
                  {}
                  <div className="flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="px-3 py-2 bg-stone-700/50 hover:bg-stone-600/50 text-stone-300 rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer" title="Copy profile link">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Share</span>
                    </button>
                    {onToggleLiveGame && <button onClick={onToggleLiveGame} className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer ${liveGameData?.inGame ? 'bg-emerald-600/80 hover:bg-emerald-500/80 text-white animate-pulse shadow-lg shadow-emerald-500/20' : 'bg-stone-700/50 hover:bg-stone-600/50 text-stone-300'}`} title={liveGameData?.inGame ? "Currently in live game!" : "Check live game"}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 4h10a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden sm:inline">
                          {liveGameData?.inGame ? 'LIVE' : 'Live Game'}
                        </span>
                      </button>}
                    <button onClick={handleUpdate} disabled={isUpdating || cooldownRemaining > 0} className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${isUpdating || cooldownRemaining > 0 ? 'bg-stone-700/30 text-stone-500 cursor-not-allowed' : 'bg-amber-600/20 hover:bg-amber-500/30 text-amber-400 cursor-pointer hover:scale-105'}`} title={cooldownRemaining > 0 ? `Update & save available in ${cooldownRemaining}s` : isUpdating ? 'Fetching latest data and saving to database...' : 'Update data and save to database'}>
                      {isUpdating ? <div className="flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-stone-400 border-t-amber-400 rounded-full animate-spin" />
                          <Database className="w-3 h-3 animate-pulse" />
                        </div> : <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <Database className="w-3.5 h-3.5" />
                        </div>}
                      <span className="hidden sm:inline">
                        {cooldownRemaining > 0 ? `${cooldownRemaining}s` : isUpdating ? 'Saving...' : 'Update & Save'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>}

            {}
            {soloQueue && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {}
            <div className="bg-gradient-to-r from-stone-800/30 to-stone-700/30 rounded-xl p-4 border border-stone-600/20">
              <div className="space-y-3">
                {}
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-amber-600/20 rounded">
                    <svg className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-stone-300">Ranked Status</h4>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <div className="relative p-1 bg-gradient-to-br from-amber-400/10 to-amber-600/5 rounded-xl border border-amber-500/20">
                      <img src={`/img/${tier.toLowerCase()}.png`} alt={tier} className="w-12 h-12 drop-shadow-lg" onError={e => {
                      e.target.style.display = 'none';
                    }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-100 tracking-wide">{tier} {rank}</h3>
                    </div>
                  </div>
                
                <div className="space-y-2">
                  <Progress value={lpProgress} className="h-3 bg-stone-700/50" />
                  <div className="flex justify-between text-xs text-stone-400">
                    {isHighTier ? <span className="font-medium">Ladder Position</span> : <span className="font-medium">0 LP</span>}
                    <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                      {currentLP} LP
                    </span>
                    {isHighTier ? <span className="font-medium">Elite Tier</span> : <span className="font-medium">100 LP</span>}
                  </div>
                </div>
                
                  <div className="text-center">
                    <p className="text-sm text-stone-300">
                      {lpNeeded !== null ? <>
                          <span className="font-bold text-amber-400">{lpNeeded} LP</span> to {nextMilestone}
                        </> : <span className="text-amber-400 font-bold">{currentLP} LP</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="bg-gradient-to-r from-stone-800/30 to-stone-700/30 rounded-xl p-4 border border-stone-600/20">
              <div className="space-y-4">
                {}
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-stone-600/20 rounded">
                    <TrendingUp className="h-3 w-3 text-stone-300" />
                  </div>
                  <h4 className="text-xs font-semibold text-stone-300">Performance & Form</h4>
                </div>

                {}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`text-center p-2 rounded-lg relative overflow-hidden transition-all duration-300 ${winRate >= 55 ? 'bg-emerald-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-500/20' : winRate < 50 ? 'bg-red-500/10 border border-red-500/30 shadow-lg shadow-red-500/20' : 'bg-stone-700/20 border border-stone-600/30'}`}>
                    {(winRate >= 55 || winRate < 50) && <div className={`absolute inset-0 rounded-lg ${winRate >= 55 ? 'bg-gradient-to-br from-emerald-400/5 to-emerald-600/5' : 'bg-gradient-to-br from-red-400/5 to-red-600/5'}`} />}
                    <div className={`relative text-lg font-bold transition-colors duration-300 ${winRate >= 55 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : winRate < 50 ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-stone-100'}`}>
                      {winRate}%
                    </div>
                    <div className={`relative text-xs font-medium ${winRate >= 55 ? 'text-emerald-300' : winRate < 50 ? 'text-red-300' : 'text-stone-400'}`}>
                      Win Rate
                    </div>
                    {winRate >= 55 && <div className="absolute top-1 right-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      </div>}
                    {winRate < 50 && <div className="absolute top-1 right-1">
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      </div>}
                  </div>
                  
                  <div className="text-center p-2 bg-stone-700/20 border border-stone-600/30 rounded-lg">
                    <div className="text-lg font-bold text-stone-100">{wins + losses}</div>
                    <div className="text-xs text-stone-400 font-medium">Games</div>
                    <div className="text-xs text-stone-500">
                      {wins}W • {losses}L
                    </div>
                  </div>
                </div>

                {}
                {recentRankedMatches && recentRankedMatches.length > 0 && <div>
                    <div className="mb-2">
                      <h5 className="text-xs font-medium text-stone-400 text-center mb-2">Recent Matches</h5>
                    </div>
                    
                    <div className="flex gap-2 justify-center">
                      {recentRankedMatches.slice(0, 5).map((match, index) => <div key={match.matchId} className="relative group" title={`${match.championName} - ${match.kills}/${match.deaths}/${match.assists} - ${match.result === 'W' ? 'Victory' : 'Defeat'}`}>
                          <div className={`relative w-11 h-11 rounded-lg overflow-hidden transition-all duration-200 group-hover:scale-105 border-2 ${match.result === 'W' ? 'border-emerald-400/50 shadow-md shadow-emerald-500/20' : 'border-red-400/50 shadow-md shadow-red-500/20'}`}>
                            <img src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/champion/${match.championName}.png`} alt={match.championName} className="w-full h-full object-cover" onError={e => {
                        e.target.style.display = 'none';
                      }} />
                            <div className={`absolute inset-0 transition-opacity duration-200 ${match.result === 'W' ? 'bg-emerald-400/15 group-hover:bg-emerald-400/25' : 'bg-red-400/15 group-hover:bg-red-400/25'}`} />
                            <div className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${match.result === 'W' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          </div>
                        </div>)}
                    </div>
                  </div>}
              </div>
            </div>

            {}
            {(() => {
            const avgKDA = recentRankedMatches && recentRankedMatches.length > 0 ? recentRankedMatches.reduce((sum, match) => {
              const kda = match.deaths === 0 ? match.kills + match.assists : (match.kills + match.assists) / match.deaths;
              return sum + kda;
            }, 0) / recentRankedMatches.length : 0;
            const calculateSkillScore = () => {
              let score = 50;
              if (winRate >= 70) score += 30;else if (winRate >= 60) score += 20;else if (winRate >= 55) score += 10;else if (winRate < 45) score -= 15;else if (winRate < 40) score -= 25;
              if (avgKDA >= 3.0) score += 25;else if (avgKDA >= 2.5) score += 15;else if (avgKDA >= 2.0) score += 10;else if (avgKDA >= 1.5) score += 5;else if (avgKDA < 1.0) score -= 10;
              const rankValues = {
                'CHALLENGER': 20,
                'GRANDMASTER': 18,
                'MASTER': 16,
                'DIAMOND': {
                  'I': 14,
                  'II': 12,
                  'III': 10,
                  'IV': 8
                },
                'PLATINUM': {
                  'I': 6,
                  'II': 4,
                  'III': 2,
                  'IV': 0
                },
                'GOLD': {
                  'I': -2,
                  'II': -4,
                  'III': -6,
                  'IV': -8
                },
                'SILVER': {
                  'I': -10,
                  'II': -12,
                  'III': -14,
                  'IV': -16
                },
                'BRONZE': {
                  'I': -18,
                  'II': -20,
                  'III': -22,
                  'IV': -24
                },
                'IRON': {
                  'I': -26,
                  'II': -28,
                  'III': -30,
                  'IV': -32
                }
              };
              if (rankValues[tier]) {
                if (typeof rankValues[tier] === 'number') {
                  score += rankValues[tier];
                } else if (rankValues[tier][rank]) {
                  score += rankValues[tier][rank];
                }
              }
              const totalGames = wins + losses;
              if (totalGames >= 100) score += 5;else if (totalGames >= 50) score += 2;else if (totalGames < 10) score -= 5;
              return Math.max(0, Math.min(100, Math.round(score)));
            };
            const skillScore = calculateSkillScore();
            const getSkillRating = score => {
              if (score >= 85) return {
                label: 'Exceptional',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/30',
                shadow: 'shadow-purple-500/20'
              };
              if (score >= 75) return {
                label: 'Elite',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/30',
                shadow: 'shadow-blue-500/20'
              };
              if (score >= 65) return {
                label: 'Advanced',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/30',
                shadow: 'shadow-emerald-500/20'
              };
              if (score >= 55) return {
                label: 'Proficient',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/30',
                shadow: 'shadow-amber-500/20'
              };
              if (score >= 45) return {
                label: 'Average',
                color: 'text-stone-400',
                bg: 'bg-stone-500/10',
                border: 'border-stone-500/30',
                shadow: 'shadow-stone-500/20'
              };
              if (score >= 35) return {
                label: 'Developing',
                color: 'text-orange-400',
                bg: 'bg-orange-500/10',
                border: 'border-orange-500/30',
                shadow: 'shadow-orange-500/20'
              };
              return {
                label: 'Learning',
                color: 'text-red-400',
                bg: 'bg-red-500/10',
                border: 'border-red-500/30',
                shadow: 'shadow-red-500/20'
              };
            };
            const skillRating = getSkillRating(skillScore);
            return <div className={`bg-gradient-to-r from-stone-800/30 to-stone-700/30 rounded-xl p-4 border border-stone-600/20 ${skillRating.bg} ${skillRating.shadow}`}>
                  <div className="space-y-4">
                    {}
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-purple-600/20 rounded">
                        <BarChart3 className="h-3 w-3 text-purple-400" />
                      </div>
                      <h4 className="text-xs font-semibold text-stone-300">Player Analytics</h4>
                    </div>

                    {}
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${skillRating.color} drop-shadow-lg`}>
                        {skillScore}
                      </div>
                      <div className="text-xs text-stone-400 font-medium">Skill Score</div>
                      <div className={`text-xs font-semibold ${skillRating.color} mt-1`}>
                        {skillRating.label}
                      </div>
                    </div>

                    {}
                    <div className="space-y-3 pt-3 border-t border-stone-700">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">
                          {avgKDA.toFixed(1)}
                        </div>
                        <div className="text-xs text-stone-400 font-medium">Avg KDA</div>
                      </div>
                      
                      <div className="text-center">
                        {(() => {
                      const recentWins = recentRankedMatches?.slice(0, 5).filter(m => m.result === 'W').length || 0;
                      const trendPercentage = recentRankedMatches?.length > 0 ? Math.round(recentWins / Math.min(5, recentRankedMatches.length) * 100) : 0;
                      const isHotStreak = recentWins >= 4;
                      const isColdStreak = recentWins <= 1 && recentRankedMatches?.length >= 4;
                      let trendLabel = 'Stable';
                      let trendColor = 'text-stone-400';
                      if (isHotStreak) {
                        trendLabel = 'Hot Streak';
                        trendColor = 'text-red-400';
                      } else if (isColdStreak) {
                        trendLabel = 'Cold Streak';
                        trendColor = 'text-blue-400';
                      } else if (trendPercentage >= 80) {
                        trendLabel = 'Climbing';
                        trendColor = 'text-emerald-400';
                      } else if (trendPercentage <= 20) {
                        trendLabel = 'Struggling';
                        trendColor = 'text-red-400';
                      } else if (trendPercentage >= 60) {
                        trendLabel = 'Improving';
                        trendColor = 'text-green-400';
                      }
                      return <>
                              <div className={`text-sm font-bold ${trendColor}`}>
                                {trendLabel}
                              </div>
                              <div className="text-xs text-stone-400 font-medium">Recent Trend</div>
                              {(isHotStreak || isColdStreak) && <div className="text-xs text-stone-500 mt-0.5">
                                  🔥 {recentWins}/5 wins
                                </div>}
                            </>;
                    })()}
                      </div>
                    </div>
                  </div>
                </div>;
          })()}
            </div>}
          </div>) : (<>
            {}
            <div className="bg-gradient-to-r from-stone-800/30 to-stone-700/30 rounded-xl p-4 border border-stone-600/20">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3">
                  {}
                  <div className="relative p-1 bg-gradient-to-br from-amber-400/10 to-amber-600/5 rounded-xl border border-amber-500/20">
                    <img src={`/img/${tier.toLowerCase()}.png`} alt={tier} className="w-14 h-14 drop-shadow-lg" onError={e => {
                  e.target.style.display = 'none';
                }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-stone-100 tracking-wide">{tier} {rank}</h3>
                  </div>
                </div>
            
            {}
            <div className="space-y-2">
              <Progress value={lpProgress} className="h-4 bg-stone-700/50" />
              <div className="flex justify-between text-xs text-stone-400">
                {isHighTier ? <span className="font-medium">Ladder Position</span> : <span className="font-medium">0 LP</span>}
                <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                  {currentLP} LP
                </span>
                {isHighTier ? <span className="font-medium">Elite Tier</span> : <span className="font-medium">100 LP</span>}
              </div>
            </div>
            
                <div className="bg-stone-700/20 rounded-lg p-3">
                  <p className="text-sm text-stone-300">
                    {lpNeeded !== null ? <>
                        <span className="font-bold text-amber-400">{lpNeeded} LP</span> to {nextMilestone}
                      </> : <span className="text-amber-400 font-bold">{currentLP} LP</span>}
                  </p>
                  
                  {}
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {['IV', 'III', 'II', 'I'].map((division, index) => {
                  const isCurrentDivision = division === rank;
                  const divisionOrder = ['IV', 'III', 'II', 'I'];
                  const currentIndex = divisionOrder.indexOf(rank);
                  const thisIndex = divisionOrder.indexOf(division);
                  const isPastDivision = thisIndex > currentIndex;
                  return <div key={division} className="flex items-center">
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isCurrentDivision ? 'border-amber-400 bg-amber-400 shadow-lg shadow-amber-400/30' : isPastDivision ? 'border-emerald-400 bg-emerald-400 shadow-md shadow-emerald-400/20' : 'border-stone-500 bg-stone-800/50'}`}>
                            <span className={`text-xs font-bold ${isCurrentDivision ? 'text-amber-900' : isPastDivision ? 'text-emerald-900' : 'text-stone-400'}`}>
                              {division}
                            </span>
                          </div>
                          {index < 3 && <div className={`w-4 h-1 rounded-full transition-colors duration-200 ${isPastDivision ? 'bg-emerald-400' : 'bg-stone-600'}`} />}
                        </div>;
                })}
                  </div>
                </div>
              </div>
            </div>

        {}
        <div className="grid grid-cols-2 gap-3">
          <div className={`text-center p-3 rounded-lg relative overflow-hidden transition-all duration-300 ${winRate >= 55 ? 'bg-emerald-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-500/20' : winRate < 50 ? 'bg-red-500/10 border border-red-500/30 shadow-lg shadow-red-500/20' : 'bg-stone-700/20 border border-stone-600/30'}`}>
            {}
            {(winRate >= 55 || winRate < 50) && <div className={`absolute inset-0 rounded-lg ${winRate >= 55 ? 'bg-gradient-to-br from-emerald-400/5 to-emerald-600/5' : 'bg-gradient-to-br from-red-400/5 to-red-600/5'}`} />}
            <div className={`relative text-xl font-bold transition-colors duration-300 ${winRate >= 55 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : winRate < 50 ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-stone-100'}`}>
              {winRate}%
            </div>
            <div className={`relative text-xs font-medium ${winRate >= 55 ? 'text-emerald-300' : winRate < 50 ? 'text-red-300' : 'text-stone-400'}`}>
              Win Rate
            </div>
            {}
            {winRate >= 55 && <div className="absolute top-1 right-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              </div>}
            {winRate < 50 && <div className="absolute top-1 right-1">
                <TrendingDown className="w-3 h-3 text-red-400" />
              </div>}
          </div>
          
          <div className="text-center p-3 bg-stone-700/20 border border-stone-600/30 rounded-lg">
            <div className="text-xl font-bold text-stone-100">{wins + losses}</div>
            <div className="text-xs text-stone-400 font-medium">Total Games</div>
            <div className="text-xs text-stone-500 mt-1">
              {wins}W • {losses}L
            </div>
          </div>
        </div>

            {}
            {recentRankedMatches && recentRankedMatches.length > 0 && <div className="bg-gradient-to-r from-stone-800/30 to-stone-700/30 rounded-xl p-4 border border-stone-600/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-stone-600/20 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-stone-300" />
                  </div>
                  <h4 className="text-sm font-semibold text-stone-300">Recent Form</h4>
                </div>
                
                <div className="bg-stone-700/20 rounded-lg p-3">
                  <div className="flex gap-2 justify-center mb-3">
                    {recentRankedMatches.slice(0, 5).map((match, index) => <div key={match.matchId} className="relative group" title={`${match.championName} - ${match.kills}/${match.deaths}/${match.assists} - ${match.result === 'W' ? 'Victory' : 'Defeat'}`}>
                        <div className={`relative w-11 h-11 rounded-lg overflow-hidden transition-all duration-200 group-hover:scale-105 border-2 ${match.result === 'W' ? 'border-emerald-400/50 shadow-lg shadow-emerald-500/20' : 'border-red-400/50 shadow-lg shadow-red-500/20'}`}>
                          {}
                          <img src={`https://ddragon.leagueoflegends.com/cdn/14.21.1/img/champion/${match.championName}.png`} alt={match.championName} className="w-full h-full object-cover" onError={e => {
                    e.target.style.display = 'none';
                  }} />
                          
                          {}
                          <div className={`absolute inset-0 transition-opacity duration-200 ${match.result === 'W' ? 'bg-emerald-400/15 group-hover:bg-emerald-400/25' : 'bg-red-400/15 group-hover:bg-red-400/25'}`} />

                          {}
                          <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${match.result === 'W' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-red-400 shadow-sm shadow-red-400/50'}`} />
                        </div>
                        
                        {}
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-stone-800/95 text-xs text-stone-300 px-2 py-1 rounded-lg whitespace-nowrap z-10 border border-stone-600/50 backdrop-blur-sm">
                          {match.kills}/{match.deaths}/{match.assists}
                        </div>
                      </div>)}
                  </div>
                  
                  <div className="text-xs text-stone-400 text-center font-medium">
                    Last {Math.min(5, recentRankedMatches.length)} ranked games
                  </div>
                </div>
              </div>}

            {}
            <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-400/10 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-xs text-amber-200/90 space-y-1">
                  <p className="font-semibold text-amber-300">LP History Tracking</p>
                  <p className="text-amber-200/70 leading-relaxed">
                    Historical LP data requires database storage as Riot API only provides current values.
                  </p>
                </div>
              </div>
            </div>
          </>)}


      </CardContent>
    </Card>;
}