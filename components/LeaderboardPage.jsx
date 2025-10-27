'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import Navbar from './Navbar';
import Link from 'next/link';
const fetcher = url => fetch(url).then(res => res.json());
const regions = [{
  value: 'euw1',
  label: 'Europe West',
  shortLabel: 'EUW',
  flag: '🇪🇺',
  popular: true
}, {
  value: 'na1',
  label: 'North America',
  shortLabel: 'NA',
  flag: '🇺🇸',
  popular: true
}, {
  value: 'kr',
  label: 'Korea',
  shortLabel: 'KR',
  flag: '🇰🇷',
  popular: true
}, {
  value: 'eun1',
  label: 'Europe Nordic & East',
  shortLabel: 'EUNE',
  flag: '🇪🇺',
  popular: false
}, {
  value: 'br1',
  label: 'Brazil',
  shortLabel: 'BR',
  flag: '🇧🇷',
  popular: false
}, {
  value: 'jp1',
  label: 'Japan',
  shortLabel: 'JP',
  flag: '🇯🇵',
  popular: false
}, {
  value: 'oc1',
  label: 'Oceania',
  shortLabel: 'OCE',
  flag: '🇦🇺',
  popular: false
}, {
  value: 'tr1',
  label: 'Turkey',
  shortLabel: 'TR',
  flag: '🇹🇷',
  popular: false
}];
const tierImages = {
  'CHALLENGER': '/img/Challenger.png',
  'GRANDMASTER': '/img/Grandmaster.png',
  'MASTER': '/img/Master.png'
};
export default function LeaderboardPage() {
  const [selectedRegion, setSelectedRegion] = useState('euw1');
  const {
    data: leaderboardData,
    isLoading,
    error
  } = useSWR(`/api/leaderboard?region=${selectedRegion}&tier=combined`, fetcher, {
    refreshInterval: 600000,
    revalidateOnFocus: false
  });
  const getRankIcon = position => {
    return <span className="w-8 h-8 flex items-center justify-center text-stone-300 font-bold text-lg">#{position}</span>;
  };
  const getTierBadge = tier => {
    const imageSrc = tierImages[tier];
    return <div className="flex items-center bg-stone-800/50 rounded-full p-1.5 border border-stone-700">
        <img src={imageSrc} alt={tier.toLowerCase()} className="w-5 h-5 object-contain" />
      </div>;
  };
  const formatLP = lp => {
    return lp.toLocaleString();
  };
  const formatWinRate = (wins, losses) => {
    const total = wins + losses;
    if (total === 0) return '0%';
    return `${Math.round(wins / total * 100)}%`;
  };
  const getWinLossBar = (wins, losses) => {
    const total = wins + losses;
    if (total === 0) return null;
    const winPercentage = wins / total * 100;
    return <div className="flex items-center space-x-2 mt-1">
        <div className="flex-1 bg-stone-700 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300" style={{
          width: `${winPercentage}%`
        }} />
        </div>
        <span className="text-xs text-stone-400 min-w-[3rem]">
          {Math.round(winPercentage)}%
        </span>
      </div>;
  };
  const formatLastUpdated = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
        <Card className="bg-stone-900/60 border-stone-700 backdrop-blur-sm max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-400 text-xl mb-4 font-semibold">Failed to Load Leaderboard</div>
            <p className="text-stone-300 mb-4">
              Unable to fetch leaderboard data. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      <Navbar showSearch={true} />
      
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-6">
            Leaderboard
          </h1>

          
          {}
          <div className="max-w-4xl mx-auto">
            <label className="block text-stone-300 text-lg font-medium mb-6">Select Region</label>
            
            {}
            <div className="mb-6">
              <h3 className="text-stone-400 text-sm font-medium mb-3 text-left">Popular Regions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {regions.filter(region => region.popular).map(region => <button key={region.value} onClick={() => setSelectedRegion(region.value)} className={`p-4 rounded-xl border transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl ${selectedRegion === region.value ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-amber-600/20 shadow-amber-500/20' : 'border-stone-600/20 bg-gradient-to-r from-stone-800/30 to-stone-700/30 hover:border-amber-500/30'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{region.flag}</span>
                      <div className="text-left">
                        <div className={`font-bold text-lg ${selectedRegion === region.value ? 'text-amber-400' : 'text-stone-100 group-hover:text-amber-400'}`}>
                          {region.shortLabel}
                        </div>
                        <div className="text-stone-400 text-sm">{region.label}</div>
                      </div>
                      {selectedRegion === region.value && <div className="ml-auto">
                          <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                        </div>}
                    </div>
                  </button>)}
              </div>
            </div>

            {}
            <div>
              <h3 className="text-stone-400 text-sm font-medium mb-3 text-left">Other Regions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {regions.filter(region => !region.popular).map(region => <button key={region.value} onClick={() => setSelectedRegion(region.value)} className={`p-3 rounded-xl border transition-all duration-300 group cursor-pointer shadow-md hover:shadow-lg ${selectedRegion === region.value ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-400 shadow-amber-500/20' : 'border-stone-600/20 bg-gradient-to-r from-stone-800/30 to-stone-700/30 text-stone-300 hover:border-amber-500/30 hover:text-amber-400'}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{region.flag}</span>
                      <span className="text-xs font-medium">{region.shortLabel}</span>
                    </div>
                  </button>)}
              </div>
            </div>
          </div>
        </div>

        {}
        <Card className="bg-gradient-to-br from-stone-800/90 to-stone-900/90 border-stone-700/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <div className="p-1.5 bg-amber-600/20 rounded-lg">
                <Trophy className="w-4 h-4" />
              </div>
              Top Ranked Players
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse ml-2" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="text-center py-12">
                <div className="text-stone-400 text-lg">Loading leaderboard...</div>
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              </div> : leaderboardData?.success && leaderboardData.data?.entries?.length > 0 ? <div className="space-y-2">
                {leaderboardData.data.entries.map((player, index) => <div key={`${player.puuid}-${index}`} className={`
                      flex items-center justify-between p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer
                      ${index < 3 ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 hover:border-amber-500/50 shadow-amber-500/10' : 'bg-gradient-to-r from-stone-800/30 to-stone-700/30 border border-stone-600/20 hover:border-stone-500/40'}
                    `}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3">
                          <Link href={`/summoner/${selectedRegion}/${encodeURIComponent(player.gameName || 'unknown')}-${encodeURIComponent(player.tagLine || selectedRegion.toUpperCase())}`} className="font-semibold text-white hover:text-amber-400 transition-colors cursor-pointer">
                            {player.summonerName || `Player-${player.puuid?.slice(-8)}`}
                          </Link>
                          {getTierBadge(player.tier)}
                        </div>
                        <div className="text-stone-400 text-sm">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="text-green-400 font-medium">{player.wins}W</span>
                            <span className="text-red-400 font-medium">{player.losses}L</span>
                          </div>
                          {getWinLossBar(player.wins, player.losses)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-amber-400">
                        {formatLP(player.leaguePoints)} LP
                      </div>
                      {player.hotStreak && <Badge className="mt-1 bg-red-500/20 text-red-400 border-red-500/30">
                          Hot Streak
                        </Badge>}
                    </div>
                  </div>)}
              </div> : <div className="text-center py-12">
                <div className="text-stone-400 text-lg">No leaderboard data available</div>
                <p className="text-stone-500 mt-2">Try selecting a different region</p>
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
}