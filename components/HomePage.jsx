'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Gamepad2, Trophy } from 'lucide-react';
import SummonerSearch from './SummonerSearch';
import Navbar from './Navbar';
export default function HomePage() {
  const router = useRouter();
  const handleSummonerFound = data => {
    const {
      account,
      region
    } = data;
    router.push(`/summoner/${region}/${encodeURIComponent(account.gameName)}-${encodeURIComponent(account.tagLine)}`);
  };
  return <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-6">
            League Of Legends Stats
          </h1>
          <p className="text-xl text-stone-300 mb-8">
            Track your League of Legends performance, match history, and live games
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Card className="bg-gradient-to-br from-stone-800/90 to-stone-900/90 border-stone-700/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-lg font-bold text-amber-400 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Search Summoner
              </CardTitle>
              <CardDescription className="text-stone-400">
                Enter your Riot ID to view detailed stats and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SummonerSearch onSummonerFound={handleSummonerFound} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-stone-800/30 to-stone-700/30 backdrop-blur-sm rounded-xl p-6 border border-stone-600/20 hover:border-amber-500/50 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer group">
              <div className="p-2 bg-amber-600/20 rounded-lg w-fit mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-amber-400">Player Analytics</h3>
              <p className="text-stone-300 text-sm">Advanced performance metrics, skill scores, and detailed match analytics</p>
            </div>
            <div className="bg-gradient-to-r from-stone-800/30 to-stone-700/30 backdrop-blur-sm rounded-xl p-6 border border-stone-600/20 hover:border-emerald-500/50 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer group">
              <div className="p-2 bg-emerald-600/20 rounded-lg w-fit mx-auto mb-4">
                <Gamepad2 className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-emerald-400">Live Games</h3>
              <p className="text-stone-300 text-sm">Real-time game tracking with team compositions and player statistics</p>
            </div>
            <div className="bg-gradient-to-r from-stone-800/30 to-stone-700/30 backdrop-blur-sm rounded-xl p-6 border border-stone-600/20 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer group">
              <div className="p-2 bg-purple-600/20 rounded-lg w-fit mx-auto mb-4">
                <Trophy className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-purple-400">Rank Progression</h3>
              <p className="text-stone-300 text-sm">LP tracking, win streaks, and comprehensive ranked queue analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}