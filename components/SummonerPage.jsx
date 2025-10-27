'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import SummonerSearch from './SummonerSearch';
import RankedStats from './RankedStats';
import MatchHistoryNew from './MatchHistoryNew';
import LiveGameNew from './LiveGameNew';
import ChampionPerformanceSidebar from './ChampionPerformanceSidebar';
import PlayedWithSidebar from './PlayedWithSidebar';
import LPProgressSidebar from './LPProgressSidebar';
import Breadcrumb from './Breadcrumb';
import Navbar from './Navbar';
import Link from 'next/link';
const fetcher = async (url, retryCount = 0) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      if (response.status === 504) {
        error.message = 'Server timeout - trying with fewer matches';
        if (url.includes('/api/matches') && retryCount < 2) {
          const currentCountMatch = url.match(/count=(\d+)/);
          const currentCount = currentCountMatch ? parseInt(currentCountMatch[1]) : 5;
          const newCount = Math.max(3, currentCount - 2);
          const reducedUrl = url.replace(/count=\d+/, `count=${newCount}`);
          console.log(`504 timeout - retrying with ${newCount} matches:`, reducedUrl);
          return fetcher(reducedUrl, retryCount + 1);
        }
      } else if (response.status === 429) {
        error.message = 'Rate limit exceeded - please wait a moment';
      } else if (response.status >= 500) {
        error.message = 'Server error - please try refreshing';
      } else if (response.status === 404) {
        error.message = 'Data not found';
      }
      throw error;
    }
    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid response format from server');
    }
  } catch (fetchError) {
    clearTimeout(timeoutId);
    if (fetchError.name === 'AbortError') {
      throw new Error('Request timeout - server took too long to respond');
    }
    throw fetchError;
  }
};
export default function SummonerPage({
  gameName,
  tagLine,
  region
}) {
  const router = useRouter();
  const [summoner, setSummoner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLiveGame, setShowLiveGame] = useState(false);
  const [additionalMatches, setAdditionalMatches] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [hasMoreMatches, setHasMoreMatches] = useState(true);
  useEffect(() => {
    setAdditionalMatches([]);
    setLoadMoreError(null);
    setHasMoreMatches(true);
  }, [gameName, tagLine, region]);
  useEffect(() => {
    const fetchSummoner = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`);
        if (!response.ok) {
          throw new Error('Summoner not found');
        }
        const data = await response.json();
        setSummoner(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSummoner();
  }, [gameName, tagLine, region]);
  const {
    data: rankedData,
    isLoading: rankedLoading,
    mutate: mutateRanked
  } = useSWR(summoner ? `/api/ranked?puuid=${summoner.account.puuid}&region=${summoner.region}` : null, fetcher, {
    refreshInterval: 600000
  });
  const matchCount = typeof window !== 'undefined' && window.location.hostname.includes('netlify') ? 5 : 20;
  const {
    data: matchData,
    isLoading: matchLoading,
    error: matchError,
    mutate: mutateMatches
  } = useSWR(summoner ? `/api/matches?puuid=${summoner.account.puuid}&region=${summoner.region}&count=${matchCount}` : null, fetcher, {
    refreshInterval: 600000,
    errorRetryCount: 2,
    errorRetryInterval: 8000,
    timeout: 35000,
    revalidateOnReconnect: true,
    shouldRetryOnError: error => {
      return !error.message.includes('404') && !error.message.includes('Rate limit');
    },
    onError: err => {
      console.error('Match data error:', err);
    },
    onErrorRetry: (error, key, config, revalidate, {
      retryCount
    }) => {
      if (retryCount >= 2) return;
      if (error.message.includes('404') || error.message.includes('Rate limit')) return;
      setTimeout(() => revalidate({
        retryCount
      }), Math.pow(2, retryCount) * 3000);
    }
  });
  const {
    data: liveGameData,
    isLoading: liveGameLoading
  } = useSWR(summoner ? `/api/live?puuid=${summoner.account.puuid}&region=${summoner.region}` : null, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true
  });
  const handleNewSearch = data => {
    const {
      account,
      region: newRegion
    } = data;
    router.push(`/summoner/${newRegion}/${encodeURIComponent(account.gameName)}-${encodeURIComponent(account.tagLine)}`);
  };
  const handleUpdate = async () => {
    if (!summoner) return;
    const isProduction = process.env.NODE_ENV === 'production' || window.location.hostname.includes('netlify');
    const matchCount = isProduction ? 10 : 20;
    const rankedUrl = `/api/ranked?puuid=${summoner.account.puuid}&region=${summoner.region}&force=true&save=true`;
    const matchUrl = `/api/matches?puuid=${summoner.account.puuid}&region=${summoner.region}&count=${matchCount}&force=true&save=true`;
    await Promise.all([mutateRanked(fetcher(rankedUrl), {
      revalidate: false
    }), mutateMatches(fetcher(matchUrl), {
      revalidate: false
    })]);
  };
  const loadMoreMatches = async () => {
    if (!summoner || loadingMore || !hasMoreMatches) return;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const currentMatchCount = (matchData?.matches?.length || 0) + additionalMatches.length;
      const batchSize = 5;
      const response = await fetcher(`/api/matches?puuid=${summoner.account.puuid}&region=${summoner.region}&start=${currentMatchCount}&count=${batchSize}`);
      if (response.matches && response.matches.length > 0) {
        setAdditionalMatches(prev => [...prev, ...response.matches]);
        if (response.matches.length < batchSize) {
          setHasMoreMatches(false);
        }
      } else {
        setHasMoreMatches(false);
      }
    } catch (error) {
      console.error('Failed to load more matches:', error);
      setLoadMoreError(error.message || 'Failed to load more matches');
    } finally {
      setLoadingMore(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-amber-500 text-xl font-semibold">Loading summoner data...</div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <Card className="bg-stone-800 border-stone-700 shadow-xl max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-400 text-xl mb-4 font-semibold">Summoner Not Found</div>
            <p className="text-stone-300 mb-4">
              Could not find summoner "{gameName}#{tagLine}" in {region.toUpperCase()}
            </p>
            <Button onClick={() => router.push('/')} className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-stone-950">
      <Navbar showSearch={true} onSummonerFound={handleNewSearch} />

      {}
      <div className="container mx-auto px-4 py-6">
        {}
        <Breadcrumb items={[{
        label: 'Leaderboard',
        href: '/leaderboard'
      }, {
        label: `${gameName}#${tagLine}`
      }]} />

        {}
        {showLiveGame && <div className="mb-8">
            <LiveGameNew liveGameData={liveGameData} isLoading={liveGameLoading} summoner={summoner} />
          </div>}

        {}
        <div className="mb-6">
          <LPProgressSidebar rankedData={rankedData} matchHistory={matchData?.matches} horizontal={true} summoner={summoner} liveGameData={liveGameData} onToggleLiveGame={() => setShowLiveGame(!showLiveGame)} onUpdate={handleUpdate} />
        </div>

        {}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {}
          <div className="xl:col-span-2">
            <MatchHistoryNew matchData={{
            ...matchData,
            matches: [...(matchData?.matches || []), ...additionalMatches]
          }} summoner={summoner} region={summoner.region} isLoading={matchLoading} error={matchError} loadMoreMatches={loadMoreMatches} loadingMore={loadingMore} loadMoreError={loadMoreError} hasMoreMatches={hasMoreMatches} />
          </div>
          
          {}
          <div className="space-y-6">
            {}
            <ChampionPerformanceSidebar summoner={summoner} region={summoner.region} matchData={matchData} championData={matchData?.championData} latestVersion={matchData?.latestVersion} allGames={true} />
            
            {}
            <PlayedWithSidebar matchData={matchData} championData={matchData?.championData} latestVersion={matchData?.latestVersion} currentSummonerPuuid={summoner?.account?.puuid} region={summoner?.region} />
          </div>
        </div>
      </div>
    </div>;
}