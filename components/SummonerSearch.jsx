'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User } from 'lucide-react';
const regions = [{
  value: 'euw1',
  label: 'Europe West'
}, {
  value: 'eun1',
  label: 'Europe Nordic & East'
}, {
  value: 'na1',
  label: 'North America'
}, {
  value: 'kr',
  label: 'Korea'
}, {
  value: 'br1',
  label: 'Brazil'
}, {
  value: 'jp1',
  label: 'Japan'
}, {
  value: 'ru',
  label: 'Russia'
}, {
  value: 'oc1',
  label: 'Oceania'
}, {
  value: 'tr1',
  label: 'Turkey'
}, {
  value: 'la1',
  label: 'Latin America North'
}, {
  value: 'la2',
  label: 'Latin America South'
}, {
  value: 'ph2',
  label: 'Philippines'
}, {
  value: 'sg2',
  label: 'Singapore'
}, {
  value: 'th2',
  label: 'Thailand'
}, {
  value: 'tw2',
  label: 'Taiwan'
}, {
  value: 'vn2',
  label: 'Vietnam'
}];
export default function SummonerSearch({
  onSummonerFound,
  loading,
  compact = false
}) {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('euw1');
  const [error, setError] = useState('');
  const handleSearch = async e => {
    e.preventDefault();
    setError('');
    if (!gameName.trim() || !tagLine.trim()) {
      setError('Please enter both game name and tag line');
      return;
    }
    try {
      const response = await fetch(`/api/summoner?gameName=${encodeURIComponent(gameName.trim())}&tagLine=${encodeURIComponent(tagLine.trim())}&region=${region}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch summoner');
      }
      const data = await response.json();
      onSummonerFound(data);
    } catch (err) {
      setError(err.message);
    }
  };
  if (compact) {
    return <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <Input type="text" placeholder="Name" value={gameName} onChange={e => setGameName(e.target.value)} disabled={loading} className="w-24 bg-stone-700/50 border-stone-600 text-stone-100 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-500/20 transition-colors" />
        <Input type="text" placeholder="Tag" value={tagLine} onChange={e => setTagLine(e.target.value)} disabled={loading} className="w-16 bg-stone-700/50 border-stone-600 text-stone-100 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-500/20 transition-colors" />
        <Select value={region} onValueChange={setRegion} disabled={loading}>
          <SelectTrigger className="w-20 bg-stone-700/50 border-stone-600 text-stone-100 focus:border-amber-500 focus:ring-amber-500/20 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-stone-800 border-stone-700">
            {regions.map(r => <SelectItem key={r.value} value={r.value} className="text-stone-100 focus:bg-amber-500 focus:text-stone-900">
                {r.value.toUpperCase()}
              </SelectItem>)}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" disabled={loading} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-900 border-0 shadow-md transition-all duration-200 cursor-pointer">
          <Search className="h-4 w-4" />
        </Button>
      </form>;
  }
  return <div className="w-full">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gameName" className="block text-sm font-medium mb-2 text-stone-300">
              Game Name
            </label>
            <Input id="gameName" type="text" placeholder="Enter game name" value={gameName} onChange={e => setGameName(e.target.value)} disabled={loading} className="bg-stone-800/50 border-stone-600 text-stone-100 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-500/20 transition-all duration-200 backdrop-blur-sm" />
          </div>
          <div>
            <label htmlFor="tagLine" className="block text-sm font-medium mb-2 text-stone-300">
              Tag Line
            </label>
            <Input id="tagLine" type="text" placeholder="Enter tag (e.g., EUW)" value={tagLine} onChange={e => setTagLine(e.target.value)} disabled={loading} className="bg-stone-800/50 border-stone-600 text-stone-100 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-500/20 transition-all duration-200 backdrop-blur-sm" />
          </div>
        </div>
        
        <div>
          <label htmlFor="region" className="block text-sm font-medium mb-2 text-stone-300">
            Region
          </label>
          <Select value={region} onValueChange={setRegion} disabled={loading}>
            <SelectTrigger className="bg-stone-800/50 border-stone-600 text-stone-100 focus:border-amber-500 focus:ring-amber-500/20 transition-all duration-200 backdrop-blur-sm">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent className="bg-stone-800 border-stone-700 backdrop-blur-sm">
              {regions.map(r => <SelectItem key={r.value} value={r.value} className="text-stone-100 focus:bg-amber-500/20 focus:text-amber-400 hover:bg-stone-700/50">
                  {r.label}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 p-3 rounded-lg backdrop-blur-sm">
            {error}
          </div>}

        <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-900 font-medium border-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          {loading ? 'Searching...' : 'Search Summoner'}
        </Button>
      </form>
    </div>;
}