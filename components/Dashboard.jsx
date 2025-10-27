'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SummonerSearch from '@/components/SummonerSearch';
import SummonerProfile from '@/components/SummonerProfile';
import RankedStats from '@/components/RankedStats';
import MatchHistory from '@/components/MatchHistoryNew';
import LiveGame from '@/components/LiveGameNew';
const fetcher = url => fetch(url).then(res => res.json());
export default function Dashboard() {
  const [summoner, setSummoner] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const {
    data: rankedData,
    isLoading: rankedLoading
  } = useSWR(summoner ? `/api/ranked?puuid=${summoner.account.puuid}&region=${summoner.region}` : null, fetcher, {
    refreshInterval: 600000
  });
  const {
    data: matchData,
    isLoading: matchLoading
  } = useSWR(summoner ? `/api/matches?puuid=${summoner.account.puuid}&region=${summoner.region}` : null, fetcher, {
    refreshInterval: 600000
  });
  const {
    data: liveGameData,
    isLoading: liveGameLoading
  } = useSWR(summoner ? `/api/live?puuid=${summoner.account.puuid}&region=${summoner.region}` : null, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true
  });
  const handleSummonerFound = async data => {
    setSearchLoading(true);
    setSummoner(data);
    setSearchLoading(false);
  };
  return <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">
              LoL Stats Tracker
            </h1>
            <p className="text-stone-300">
              Track your League of Legends performance and stats
            </p>
          </div>

          {}
          <SummonerSearch onSummonerFound={handleSummonerFound} loading={searchLoading} />

          {}
          {summoner && <div className="space-y-6">
              {}
              <SummonerProfile summoner={summoner.summoner} account={summoner.account} region={summoner.region} />

              {}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-stone-900/80 backdrop-blur-sm border border-stone-700">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-stone-300 font-medium">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="matches" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-stone-300 font-medium">
                    Matches
                  </TabsTrigger>
                  <TabsTrigger value="ranked" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-stone-300 font-medium">
                    Ranked
                  </TabsTrigger>
                  <TabsTrigger value="live" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-stone-300 font-medium">
                    Live Game
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-stone-900/60 backdrop-blur-sm rounded-lg border border-stone-700 p-6">
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent mb-4">
                        Ranked Stats
                      </h2>
                      <RankedStats rankedData={rankedData} loading={rankedLoading} />
                    </div>
                    <div className="bg-stone-900/60 backdrop-blur-sm rounded-lg border border-stone-700 p-6">
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent mb-4">
                        Live Game Status
                      </h2>
                      <LiveGame liveGameData={liveGameData} isLoading={liveGameLoading} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="matches">
                  <MatchHistory matches={matchData?.matches} championData={matchData?.championData} itemData={matchData?.itemData} summonerSpellData={matchData?.summonerSpellData} latestVersion={matchData?.latestVersion} loading={matchLoading} />
                </TabsContent>

                <TabsContent value="ranked">
                  <RankedStats rankedData={rankedData} loading={rankedLoading} />
                </TabsContent>

                <TabsContent value="live">
                  <LiveGame liveGameData={liveGameData} isLoading={liveGameLoading} />
                </TabsContent>
              </Tabs>
            </div>}

          {}
          <div className="text-center text-sm text-stone-400 mt-12">
            <p>
              LoL Stats Tracker isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties.
            </p>
          </div>
        </div>
      </div>
    </div>;
}