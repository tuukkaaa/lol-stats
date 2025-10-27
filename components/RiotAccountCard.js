'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
export default function RiotAccountCard({
  account,
  regions,
  onSetPrimary,
  onRemove,
  onViewStats
}) {
  const [rankedData, setRankedData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchRankedData = async () => {
      try {
        const response = await fetch(`/api/ranked?region=${account.region}&puuid=${account.puuid}`);
        if (response.ok) {
          const data = await response.json();
          const soloQueue = data.soloQueue;
          setRankedData(soloQueue);
        }
      } catch (error) {
        console.error('Error fetching ranked data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankedData();
  }, [account]);
  const getProfileIconUrl = iconId => {
    return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${iconId}.png`;
  };
  const getRankBadge = () => {
    if (!rankedData) return null;
    const tierColors = {
      IRON: 'from-stone-600 to-stone-700',
      BRONZE: 'from-amber-700 to-amber-800',
      SILVER: 'from-slate-400 to-slate-500',
      GOLD: 'from-yellow-400 to-yellow-600',
      PLATINUM: 'from-cyan-400 to-cyan-600',
      EMERALD: 'from-emerald-400 to-emerald-600',
      DIAMOND: 'from-blue-400 to-blue-600',
      MASTER: 'from-purple-500 to-purple-700',
      GRANDMASTER: 'from-red-500 to-red-700',
      CHALLENGER: 'from-amber-400 to-yellow-500'
    };
    const bgGradient = tierColors[rankedData.tier] || 'from-stone-600 to-stone-700';
    return <div className={`bg-gradient-to-br ${bgGradient} px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg`}>
        {rankedData.tier} {rankedData.rank} • {rankedData.leaguePoints} LP
      </div>;
  };
  return <div className="flex items-center justify-between p-4 bg-stone-800/30 rounded-lg border border-stone-700 hover:border-stone-600 transition-colors">
      <div className="flex items-center space-x-4">
        {}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-stone-600 shadow-lg">
          <Image src={getProfileIconUrl(account.profile_icon_id)} alt={`${account.game_name} icon`} width={64} height={64} className="object-cover" unoptimized />
          {account.is_primary && <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1">
              <svg className="w-3 h-3 text-stone-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>}
        </div>

        {}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-white">
              {account.game_name}#{account.tag_line}
            </h3>
            {account.is_primary && <span className="px-2 py-0.5 bg-amber-400/20 text-amber-400 text-xs font-medium rounded">
                Primary
              </span>}
          </div>
          
          <div className="flex items-center space-x-3">
            <p className="text-sm text-stone-400">
              {regions.find(r => r.value === account.region)?.label || account.region}
            </p>
            <span className="text-stone-600">•</span>
            <p className="text-sm text-stone-400">
              Level {account.summoner_level}
            </p>
          </div>

          {}
          {loading ? <div className="mt-2 h-6 w-32 bg-stone-700 animate-pulse rounded-full"></div> : rankedData && <div className="mt-2">
                {getRankBadge()}
              </div>}
        </div>
      </div>

      {}
      <div className="flex items-center space-x-2">
        {!account.is_primary && <button onClick={() => onSetPrimary(account.id)} className="px-3 py-1 bg-stone-700 hover:bg-stone-600 text-white text-sm rounded transition-colors">
            Set Primary
          </button>}
        <button onClick={() => onViewStats(account)} className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-stone-900 text-sm font-medium rounded transition-colors">
          View Stats
        </button>
        <button onClick={() => onRemove(account.id)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded transition-colors">
          Remove
        </button>
      </div>
    </div>;
}