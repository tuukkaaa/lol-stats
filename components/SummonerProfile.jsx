'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
export default function SummonerProfile({
  summoner,
  liveGameData,
  onToggleLiveGame
}) {
  const [profileIconUrl, setProfileIconUrl] = useState('');
  useEffect(() => {
    const loadProfileIcon = async () => {
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
    if (summoner?.summoner?.profileIconId) {
      loadProfileIcon();
    }
  }, [summoner?.summoner?.profileIconId]);
  if (!summoner) return null;
  return <Card className="bg-stone-900/95 border-stone-700/60 backdrop-blur-sm shadow-xl">
      <CardContent className="p-8">
        <div className="flex items-center space-x-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full blur-xl"></div>
            <Avatar className="h-24 w-24 border-4 border-amber-500/80 shadow-lg relative z-10">
              <AvatarImage src={profileIconUrl} alt={`${summoner.account.gameName}'s profile icon`} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-stone-700 to-stone-800 text-amber-500 text-3xl font-bold">
                {summoner.account.gameName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute z-10 -bottom-2 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-800 text-sm font-bold rounded-full px-2 py-1 border-2 border-amber-500 shadow-lg">
              {summoner.summoner.summonerLevel}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-bold text-stone-100 tracking-tight">
                  {summoner.account.gameName}
                </h2>
                <span className="text-2xl text-stone-400 font-medium">
                  #{summoner.account.tagLine}
                </span>
                <Badge variant="secondary" className="uppercase bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30 font-bold tracking-wider shadow-md">
                  {summoner.region}
                </Badge>
              </div>
              
              {}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-stone-700/50 hover:bg-stone-600/50 text-stone-300 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 min-w-0" title="Copy profile link">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="sm:inline hidden">Share</span>
                  <span className="sm:hidden inline">Share Profile</span>
                </button>
                <button onClick={onToggleLiveGame} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 min-w-0 ${liveGameData?.inGame ? 'bg-emerald-600/80 hover:bg-emerald-500/80 text-white animate-pulse shadow-lg shadow-emerald-500/20' : 'bg-stone-700/50 hover:bg-stone-600/50 text-stone-300'}`} title={liveGameData?.inGame ? "Currently in live game!" : "Check live game"}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 4h10a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">
                    {liveGameData?.inGame ? 'LIVE' : 'Live Game'}
                  </span>
                </button>
                <button onClick={() => window.location.reload()} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-amber-600/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 min-w-0" title="Refresh data">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="sm:inline hidden">Refresh</span>
                  <span className="sm:hidden inline">Refresh Data</span>
                </button>
              </div>
            </div>
            
            <div className="text-stone-400">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <p className="text-lg font-medium text-stone-300">
                    Level {summoner.summoner.summonerLevel}
                  </p>
                </div>
                <div className="w-px h-4 bg-stone-600"></div>
                <p className="text-sm text-stone-400">
                  Last active: {new Date(summoner.summoner.revisionDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}