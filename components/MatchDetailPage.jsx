'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Trophy, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
export default function MatchDetailPage({
  matchData
}) {
  const [copied, setCopied] = useState(false);
  const {
    match,
    participants
  } = matchData;
  const gameDuration = Math.floor(match.info.gameDuration / 60);
  const gameSeconds = Math.floor(match.info.gameDuration % 60);
  const gameDate = new Date(match.info.gameCreation).toLocaleDateString();
  const team1 = participants.filter(p => p.teamId === 100);
  const team2 = participants.filter(p => p.teamId === 200);
  const team1Win = team1[0]?.win;
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `League of Legends Match - ${match.info.gameMode}`,
          text: `Check out this ${match.info.gameMode} match!`,
          url: url
        });
      } catch (error) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };
  const copyToClipboard = async text => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };
  const formatKDA = (kills, deaths, assists) => {
    const kda = deaths === 0 ? kills + assists : ((kills + assists) / deaths).toFixed(2);
    return `${kills}/${deaths}/${assists} (${kda})`;
  };
  const TeamCard = ({
    team,
    isWinner,
    teamName
  }) => <Card className={`${isWinner ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 ${isWinner ? 'text-emerald-400' : 'text-red-400'}`}>
          <Trophy className="h-5 w-5" />
          {teamName} {isWinner ? 'Victory' : 'Defeat'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {team.map((player, index) => <div key={index} className="flex items-center gap-3 p-2 bg-stone-800/30 rounded-lg">
              <Image src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${player.championName}.png`} alt={player.championName} width={32} height={32} className="rounded-full" onError={e => {
            e.target.src = 'https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/Azir.png';
          }} />
              <div className="flex-1">
                <div className="font-medium text-stone-100">{player.summonerName}</div>
                <div className="text-sm text-stone-400">{player.championName}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-stone-200">
                  {formatKDA(player.kills, player.deaths, player.assists)}
                </div>
                <div className="text-sm text-stone-400">
                  {player.cs} CS • {Math.round(player.totalDamageDealtToChampions / 1000)}k DMG
                </div>
              </div>
            </div>)}
        </div>
      </CardContent>
    </Card>;
  return <div className="min-h-screen bg-stone-950">
      <Navbar showSearch={true} />
      
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-stone-100 mb-2">
              {match.info.gameMode} Match
            </h1>
            <div className="flex items-center gap-4 text-stone-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {gameDuration}:{gameSeconds.toString().padStart(2, '0')}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {participants.length} players
              </div>
              <span>{gameDate}</span>
            </div>
          </div>
          
          <Button onClick={handleShare} className="bg-amber-500 hover:bg-amber-600 text-stone-900">
            {copied ? <>
                <Copy className="h-4 w-4 mr-2" />
                Copied!
              </> : <>
                <Share2 className="h-4 w-4 mr-2" />
                Share Match
              </>}
          </Button>
        </div>

        {}
        <Card className="bg-stone-900/95 border-stone-700/60 mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-lg px-4 py-2">
                {match.info.gameMode}
              </Badge>
              <div className="mt-4 text-stone-300">
                Match ID: {match.metadata.matchId}
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamCard team={team1} isWinner={team1Win} teamName="Blue Team" />
          <TeamCard team={team2} isWinner={!team1Win} teamName="Red Team" />
        </div>

        {}
        <Card className="bg-stone-900/95 border-stone-700/60 mt-8">
          <CardHeader>
            <CardTitle className="text-amber-400">Share this Match</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-stone-300 mb-4">
              Share this match URL in Discord to create a rich embed with match details, champion info, and stats!
            </p>
            <div className="bg-stone-800/50 p-3 rounded-lg font-mono text-sm text-stone-200">
              {typeof window !== 'undefined' ? window.location.href : ''}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}