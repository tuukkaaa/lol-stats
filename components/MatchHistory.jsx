'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatGameDuration, formatKDA, getChampionImageUrl, getItemImageUrl, getSummonerSpellImageUrl } from '@/lib/riot';
import { Clock, Trophy, Target, Coins, ChevronDown, ChevronUp, Users, Zap, Filter } from 'lucide-react';
const ParticipantRow = ({
  participant,
  championData,
  itemData,
  summonerSpellData,
  isUserPlayer = false
}) => {
  const kda = formatKDA(participant.kills, participant.deaths, participant.assists);
  const champion = championData ? Object.values(championData).find(champ => champ.key === participant.championId.toString()) : null;
  const spell1 = summonerSpellData ? Object.values(summonerSpellData).find(spell => spell.key === participant.summoner1Id.toString()) : null;
  const spell2 = summonerSpellData ? Object.values(summonerSpellData).find(spell => spell.key === participant.summoner2Id.toString()) : null;
  return <div className={`flex items-center gap-3 p-2 rounded ${isUserPlayer ? 'bg-blue-50 border border-blue-200' : ''}`}>
      {}
      <div className="flex items-center gap-2 min-w-[120px]">
        <Avatar className="h-8 w-8">
          <AvatarImage src={champion ? getChampionImageUrl(champion.image.full) : ''} alt={participant.championName} />
          <AvatarFallback>{participant.championName[0]}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{participant.championName}</span>
      </div>

      {}
      <div className="min-w-[100px]">
        <span className={`text-sm ${isUserPlayer ? 'font-bold text-blue-700' : ''}`}>
          {participant.summonerName}
        </span>
      </div>

      {}
      <div className="min-w-[80px] text-center">
        <div className="text-sm font-medium">
          {participant.kills}/{participant.deaths}/{participant.assists}
        </div>
        <div className="text-xs text-muted-foreground">({kda})</div>
      </div>

      {}
      <div className="min-w-[60px] text-center">
        <div className="text-sm">{participant.totalMinionsKilled}</div>
        <div className="text-xs text-muted-foreground">CS</div>
      </div>

      {}
      <div className="min-w-[60px] text-center">
        <div className="text-sm">{(participant.goldEarned / 1000).toFixed(1)}k</div>
        <div className="text-xs text-muted-foreground">Gold</div>
      </div>

      {}
      <div className="min-w-[60px] text-center">
        <div className="text-sm">{(participant.totalDamageDealtToChampions / 1000).toFixed(1)}k</div>
        <div className="text-xs text-muted-foreground">Dmg</div>
      </div>

      {}
      <div className="flex gap-1 min-w-[60px]">
        {spell1 && <img src={getSummonerSpellImageUrl(spell1.image.full)} alt={spell1.name} className="w-6 h-6 rounded" title={spell1.name} />}
        {spell2 && <img src={getSummonerSpellImageUrl(spell2.image.full)} alt={spell2.name} className="w-6 h-6 rounded" title={spell2.name} />}
      </div>

      {}
      <div className="flex gap-1 min-w-[200px]">
        {participant.items.map((itemId, index) => <div key={index} className="w-7 h-7 bg-gray-100 rounded border overflow-hidden">
            {itemData && itemData[itemId] && <img src={getItemImageUrl(itemId)} alt={itemData[itemId].name} className="w-full h-full object-cover" title={itemData[itemId].name} />}
          </div>)}
      </div>
    </div>;
};
const TeamSection = ({
  team,
  championData,
  itemData,
  summonerSpellData,
  userPuuid,
  title,
  isWin
}) => {
  return <div className={`border rounded-lg p-3 ${isWin ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          {title}
        </h4>
        <Badge variant={isWin ? 'default' : 'destructive'}>
          {isWin ? 'Victory' : 'Defeat'}
        </Badge>
      </div>
      
      <div className="space-y-1">
        {team.participants.map((participant, index) => {
        const isUserPlayer = userPuuid && (participant.puuid === userPuuid || participant.summonerName);
        return <ParticipantRow key={index} participant={participant} championData={championData} itemData={itemData} summonerSpellData={summonerSpellData} isUserPlayer={isUserPlayer} />;
      })}
      </div>
    </div>;
};
const MatchCard = ({
  match,
  championData,
  itemData,
  summonerSpellData,
  userPuuid
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    participant
  } = match;
  const isWin = participant.win;
  const kda = formatKDA(participant.kills, participant.deaths, participant.assists);
  const duration = formatGameDuration(match.gameDuration);
  const champion = championData ? Object.values(championData).find(champ => champ.key === participant.championId.toString()) : null;
  const gameDate = new Date(match.gameCreation).toLocaleDateString();
  return <Card className={`border-l-4 ${isWin ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardContent className="p-4">
        {}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={champion ? getChampionImageUrl(champion.image.full) : ''} alt={participant.championName} />
              <AvatarFallback>{participant.championName[0]}</AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold">{participant.championName}</h3>
              <p className="text-sm text-muted-foreground">{match.gameMode} • {gameDate}</p>
            </div>
          </div>

          <div className="text-right">
            <Badge variant={isWin ? 'default' : 'destructive'}>
              {isWin ? 'Victory' : 'Defeat'}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {duration}
            </p>
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4" />
              <span className="font-semibold">KDA</span>
            </div>
            <p className="text-sm">
              {participant.kills}/{participant.deaths}/{participant.assists}
            </p>
            <p className="text-xs text-muted-foreground">({kda})</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4" />
              <span className="font-semibold">CS</span>
            </div>
            <p className="text-sm">{participant.totalMinionsKilled}</p>
            <p className="text-xs text-muted-foreground">
              {(participant.totalMinionsKilled / (match.gameDuration / 60)).toFixed(1)}/min
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="h-4 w-4" />
              <span className="font-semibold">Gold</span>
            </div>
            <p className="text-sm">{(participant.goldEarned / 1000).toFixed(1)}k</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">Damage</span>
            </div>
            <p className="text-sm">{(participant.totalDamageDealtToChampions / 1000).toFixed(1)}k</p>
          </div>
        </div>

        {}
        <div className="border-t pt-3 mb-3">
          <p className="text-xs text-muted-foreground mb-2">Your Items</p>
          <div className="flex gap-1">
            {participant.items.map((itemId, index) => <div key={index} className="w-8 h-8 bg-gray-100 rounded border overflow-hidden">
                {itemData && itemData[itemId] && <img src={getItemImageUrl(itemId)} alt={itemData[itemId].name} className="w-full h-full object-cover" title={itemData[itemId].name} />}
              </div>)}
          </div>
        </div>

        {}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              {isExpanded ? <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Match Details
                </> : <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show All Players
                </>}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            <TeamSection team={match.teams.team1} championData={championData} itemData={itemData} summonerSpellData={summonerSpellData} userPuuid={userPuuid} title="Blue Team" isWin={match.teams.team1.win} />
            
            <TeamSection team={match.teams.team2} championData={championData} itemData={itemData} summonerSpellData={summonerSpellData} userPuuid={userPuuid} title="Red Team" isWin={match.teams.team2.win} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>;
};
export default function MatchHistory({
  matches,
  championData,
  itemData,
  summonerSpellData,
  loading,
  userPuuid
}) {
  const [gameTypeFilter, setGameTypeFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [championFilter, setChampionFilter] = useState('all');
  const filteredMatches = matches?.filter(match => {
    const userParticipant = match.participants.find(p => p.puuid === userPuuid);
    if (gameTypeFilter !== 'all' && match.queueId.toString() !== gameTypeFilter) {
      return false;
    }
    if (resultFilter !== 'all') {
      if (resultFilter === 'wins' && !userParticipant?.win) return false;
      if (resultFilter === 'losses' && userParticipant?.win) return false;
    }
    if (championFilter !== 'all' && userParticipant?.championName !== championFilter) {
      return false;
    }
    return true;
  }) || [];
  const uniqueChampions = [...new Set(matches?.map(match => {
    const userParticipant = match.participants.find(p => p.puuid === userPuuid);
    return userParticipant?.championName;
  }).filter(Boolean))] || [];
  const gameTypes = [{
    value: '420',
    label: 'Ranked Solo/Duo'
  }, {
    value: '440',
    label: 'Ranked Flex'
  }, {
    value: '400',
    label: 'Normal Draft'
  }, {
    value: '430',
    label: 'Normal Blind'
  }, {
    value: '450',
    label: 'ARAM'
  }];
  if (loading) {
    return <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Match History</CardTitle>
          </CardHeader>
        </Card>
        {[...Array(5)].map((_, i) => <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => <div key={j} className="h-8 bg-gray-200 rounded"></div>)}
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>;
  }
  if (!matches || matches.length === 0) {
    return <Card>
        <CardHeader>
          <CardTitle>Match History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No matches found</p>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Recent Matches
            <Badge variant="secondary" className="ml-2">
              {filteredMatches.length} / {matches?.length || 0}
            </Badge>
          </CardTitle>
          
          {}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-400">Game Type:</span>
              <Select value={gameTypeFilter} onValueChange={setGameTypeFilter}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {gameTypes.map(type => <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-400">Result:</span>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="wins">Wins</SelectItem>
                  <SelectItem value="losses">Losses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-400">Champion:</span>
              <Select value={championFilter} onValueChange={setChampionFilter}>
                <SelectTrigger className="w-36 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Champions</SelectItem>
                  {uniqueChampions.map(champion => <SelectItem key={champion} value={champion}>
                      {champion}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {}
            {(gameTypeFilter !== 'all' || resultFilter !== 'all' || championFilter !== 'all') && <Button variant="outline" size="sm" onClick={() => {
            setGameTypeFilter('all');
            setResultFilter('all');
            setChampionFilter('all');
          }} className="h-8">
                Clear Filters
              </Button>}
          </div>
        </CardHeader>
      </Card>
      
      {filteredMatches.map(match => <MatchCard key={match.matchId} match={match} championData={championData} itemData={itemData} summonerSpellData={summonerSpellData} userPuuid={userPuuid} />)}
    </div>;
}