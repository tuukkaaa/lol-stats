'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { useState } from 'react';
const getRankEmblemUrl = (tier, rank) => {
  if (!tier) return null;
  const tierCapitalized = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  return `/img/${tierCapitalized}.png`;
};
const getRankColor = tier => {
  const colors = {
    IRON: 'bg-gray-500',
    BRONZE: 'bg-amber-700',
    SILVER: 'bg-gray-400',
    GOLD: 'bg-yellow-500',
    PLATINUM: 'bg-cyan-500',
    EMERALD: 'bg-emerald-500',
    DIAMOND: 'bg-blue-500',
    MASTER: 'bg-purple-500',
    GRANDMASTER: 'bg-red-500',
    CHALLENGER: 'bg-gradient-to-r from-yellow-400 to-red-500'
  };
  return colors[tier] || 'bg-gray-500';
};
const LPGainChart = ({
  rankedData,
  matchHistory
}) => {
  return null;
};
const RankCard = ({
  rankData,
  isActive,
  onClick,
  selectedQueue
}) => {
  const [emblemError, setEmblemError] = useState(false);
  if (!rankData) {
    return <Card className={`cursor-pointer transition-all duration-300 bg-stone-900/95 border-stone-700/60 backdrop-blur-sm hover:bg-stone-800/95 ${isActive ? 'ring-2 ring-amber-500/50 shadow-lg' : ''}`} onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-stone-600 to-stone-700 rounded-full flex items-center justify-center shadow-inner">
              <Trophy className="h-7 w-7 text-stone-500" />
            </div>
            <div>
              <p className="text-stone-100 font-medium">Unranked</p>
              <p className="text-stone-400 text-sm">Play ranked to get placed</p>
            </div>
          </div>
        </CardContent>
      </Card>;
  }
  const winRatePercent = parseFloat(rankData.winRate);
  const emblemUrl = getRankEmblemUrl(rankData.tier, rankData.rank);
  const isHighRank = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(rankData.tier);
  return <Card className={`cursor-pointer transition-all duration-300 bg-stone-900/95 border-stone-700/60 backdrop-blur-sm hover:bg-stone-800/95 shadow-lg ${isActive ? 'ring-2 ring-amber-500/70 shadow-amber-500/20' : ''}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {}
          <div className="flex-shrink-0">
            {emblemUrl && !emblemError ? <div className="relative">
                <img src={emblemUrl} alt={`${rankData.tier} ${rankData.rank}`} className="w-16 h-16 drop-shadow-lg" onError={() => setEmblemError(true)} />
                {isHighRank && <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-2 h-2 text-amber-900" />
                  </div>}
              </div> : <div className={`flex items-center justify-center w-16 h-16 rounded-full text-white font-bold text-lg shadow-lg ${getRankColor(rankData.tier)}`}>
                {rankData.tier[0]}{rankData.rank ? rankData.rank[0] : ''}
              </div>}
          </div>

          {}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-stone-100 truncate">
                {rankData.tier.charAt(0) + rankData.tier.slice(1).toLowerCase()} {rankData.rank}
              </h3>
              <Badge variant="outline" className="text-xs text-stone-400 border-stone-600">
                {selectedQueue === 'soloQueue' ? 'Solo/Duo' : 'Flex'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-400">{rankData.leaguePoints} LP</span>
                <span className="text-stone-400">{rankData.wins}W {rankData.losses}L</span>
              </div>
              
              {}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Win Rate</span>
                  <span className={`font-semibold ${winRatePercent >= 60 ? 'text-emerald-400' : winRatePercent >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {rankData.winRate}%
                  </span>
                </div>
                <div className="w-full bg-stone-700 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-300 ${winRatePercent >= 60 ? 'bg-emerald-500' : winRatePercent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{
                  width: `${Math.min(winRatePercent, 100)}%`
                }} />
                </div>
              </div>
              
              {}
              {(rankData.hotStreak || rankData.veteran || rankData.freshBlood) && <div className="flex gap-1 flex-wrap">
                  {rankData.hotStreak && <Badge variant="destructive" className="text-xs px-2 py-0 bg-gradient-to-r from-orange-500 to-red-500 border-0">
                      Hot
                    </Badge>}
                  {rankData.veteran && <Badge variant="outline" className="text-xs px-2 py-0 border-amber-500 text-amber-500">
                      Veteran
                    </Badge>}
                  {rankData.freshBlood && <Badge variant="secondary" className="text-xs px-2 py-0 bg-blue-500/20 text-blue-400">
                      Fresh
                    </Badge>}
                </div>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default function RankedStats({
  rankedData,
  loading
}) {
  const [selectedQueue, setSelectedQueue] = useState('soloQueue');
  if (loading) {
    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="space-y-6">
      {}
      <div className="flex gap-2 p-1 bg-stone-800/50 backdrop-blur-sm rounded-xl border border-stone-700/50">
        <Button variant={selectedQueue === 'soloQueue' ? 'default' : 'ghost'} size="sm" onClick={() => setSelectedQueue('soloQueue')} className={`flex-1 transition-all duration-200 ${selectedQueue === 'soloQueue' ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-900 shadow-lg font-bold' : 'text-stone-300 hover:text-amber-400 hover:bg-amber-500/10'}`}>
          Solo/Duo Queue
        </Button>
        <Button variant={selectedQueue === 'flexQueue' ? 'default' : 'ghost'} size="sm" onClick={() => setSelectedQueue('flexQueue')} className={`flex-1 transition-all duration-200 ${selectedQueue === 'flexQueue' ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-900 shadow-lg font-bold' : 'text-stone-300 hover:text-amber-400 hover:bg-amber-500/10'}`}>
          Flex 5v5 Queue
        </Button>
      </div>
      
      {}
      <RankCard rankData={rankedData?.[selectedQueue]} isActive={true} onClick={() => {}} selectedQueue={selectedQueue} />
    </div>;
}