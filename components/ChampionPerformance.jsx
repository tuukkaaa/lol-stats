'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Target, TrendingUp, TrendingDown } from 'lucide-react';
const ChampionPerformance = ({
  matchData,
  summoner,
  region,
  loading
}) => {
  const championStats = useMemo(() => {
    if (!matchData?.matches || !matchData.championData) return [];
    const stats = {};
    matchData.matches.forEach(match => {
      const {
        participant
      } = match;
      const championId = participant.championId.toString();
      const champion = Object.values(matchData.championData).find(champ => champ.key === championId);
      if (!champion) return;
      if (!stats[championId]) {
        stats[championId] = {
          champion,
          games: 0,
          wins: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
          totalDamage: 0,
          totalGold: 0,
          totalCS: 0,
          totalGameTime: 0,
          recentForm: []
        };
      }
      const stat = stats[championId];
      stat.games++;
      if (participant.win) stat.wins++;
      stat.totalKills += participant.kills;
      stat.totalDeaths += participant.deaths;
      stat.totalAssists += participant.assists;
      stat.totalDamage += participant.totalDamageDealtToChampions;
      stat.totalGold += participant.goldEarned;
      stat.totalCS += participant.totalMinionsKilled;
      stat.totalGameTime += match.gameDuration;
      if (stat.recentForm.length < 5) {
        stat.recentForm.push(participant.win);
      }
    });
    return Object.values(stats).map(stat => ({
      ...stat,
      winRate: (stat.wins / stat.games * 100).toFixed(1),
      avgKDA: stat.totalDeaths > 0 ? ((stat.totalKills + stat.totalAssists) / stat.totalDeaths).toFixed(2) : 'Perfect',
      avgKills: (stat.totalKills / stat.games).toFixed(1),
      avgDeaths: (stat.totalDeaths / stat.games).toFixed(1),
      avgAssists: (stat.totalAssists / stat.games).toFixed(1),
      avgDamage: Math.round(stat.totalDamage / stat.games),
      avgGold: Math.round(stat.totalGold / stat.games),
      avgCS: (stat.totalCS / stat.games).toFixed(1),
      csPerMin: (stat.totalCS / (stat.totalGameTime / 60) / stat.games).toFixed(1)
    })).filter(stat => stat.games >= 2).sort((a, b) => b.games - a.games);
  }, [matchData]);
  if (loading) {
    return <Card className="bg-stone-800 border-stone-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-amber-500">Champion Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-stone-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-600 rounded w-3/4"></div>
                  <div className="h-3 bg-stone-600 rounded w-1/2"></div>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>;
  }
  if (!championStats.length) {
    return <Card className="bg-stone-800 border-stone-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-amber-500">Champion Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-stone-400 py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Play more games to see champion performance statistics</p>
          </div>
        </CardContent>
      </Card>;
  }
  const getWinRateColor = winRate => {
    const rate = parseFloat(winRate);
    if (rate >= 70) return 'text-green-400';
    if (rate >= 60) return 'text-blue-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };
  const getFormTrend = recentForm => {
    if (recentForm.length < 3) return null;
    const wins = recentForm.filter(Boolean).length;
    const winRate = wins / recentForm.length * 100;
    if (winRate >= 60) return {
      icon: TrendingUp,
      color: 'text-green-400',
      text: 'Hot'
    };
    if (winRate <= 40) return {
      icon: TrendingDown,
      color: 'text-red-400',
      text: 'Cold'
    };
    return null;
  };
  return <Card className="bg-stone-800 border-stone-700 shadow-lg">
      <CardHeader>
        <CardTitle className="text-amber-500">Champion Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {championStats.slice(0, 8).map((stat, index) => {
          const trend = getFormTrend(stat.recentForm);
          return <div key={stat.champion.id} className="flex items-center space-x-4 p-3 bg-stone-700/30 rounded-lg hover:bg-stone-700/50 transition-colors">
                {}
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${stat.champion.image.full}`} alt={stat.champion.name} />
                    <AvatarFallback className="bg-stone-600 text-stone-200 text-xs">
                      {stat.champion.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-amber-900" />
                    </div>}
                </div>

                {}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-stone-100 truncate">{stat.champion.name}</h3>
                    {trend && <Badge variant="outline" className={`text-xs ${trend.color} border-current`}>
                        <trend.icon className="w-3 h-3 mr-1" />
                        {trend.text}
                      </Badge>}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-stone-400">Games:</span>
                      <span className="text-stone-100 ml-1">{stat.games}</span>
                    </div>
                    <div>
                      <span className="text-stone-400">KDA:</span>
                      <span className="text-stone-100 ml-1">{stat.avgKDA}</span>
                    </div>
                    <div>
                      <span className="text-stone-400">CS/min:</span>
                      <span className="text-stone-100 ml-1">{stat.csPerMin}</span>
                    </div>
                    <div>
                      <span className="text-stone-400">Damage:</span>
                      <span className="text-stone-100 ml-1">{(stat.avgDamage / 1000).toFixed(1)}k</span>
                    </div>
                  </div>

                  {}
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-stone-400">Win Rate</span>
                      <span className={`text-xs font-semibold ${getWinRateColor(stat.winRate)}`}>
                        {stat.winRate}% ({stat.wins}W {stat.games - stat.wins}L)
                      </span>
                    </div>
                    <Progress value={parseFloat(stat.winRate)} className="h-1.5 bg-stone-600" />
                  </div>

                  {}
                  {stat.recentForm.length > 0 && <div className="flex items-center space-x-1 mt-2">
                      <span className="text-xs text-stone-400">Recent:</span>
                      {stat.recentForm.map((win, i) => <div key={i} className={`w-2 h-2 rounded-full ${win ? 'bg-green-400' : 'bg-red-400'}`} title={win ? 'Win' : 'Loss'} />)}
                    </div>}
                </div>
              </div>;
        })}
        </div>
      </CardContent>
    </Card>;
};
export default ChampionPerformance;