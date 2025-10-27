'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Filter, Sparkles, Star, ArrowRight } from 'lucide-react';
import { allPatches } from '@/data/patches';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
export default function PatchNotesOverview() {
  const [selectedType, setSelectedType] = useState('all');
  const filteredPatches = selectedType === 'all' ? allPatches : allPatches.filter(patch => patch.type === selectedType);
  const getTypeIcon = type => {
    switch (type) {
      case 'major':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };
  const getTypeColor = type => {
    switch (type) {
      case 'major':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return <div className="min-h-screen bg-stone-950">
      <Navbar showSearch={true} />
      
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-6">
            Patch Notes
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Stay updated with the latest League of Legends balance changes, champion updates, and gameplay modifications
          </p>
        </div>

        {}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-stone-600/20 rounded-lg">
              <Filter className="h-4 w-4 text-stone-300" />
            </div>
            <span className="text-stone-400 text-sm font-medium">Filter by type:</span>
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48 bg-gradient-to-r from-stone-800/60 to-stone-700/60 border-stone-600/30 text-stone-200 h-10 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-stone-800 border-stone-700">
              <SelectItem value="all" className="text-stone-200 focus:bg-stone-700 cursor-pointer">
                All Patches ({allPatches.length})
              </SelectItem>
              <SelectItem value="major" className="text-stone-200 focus:bg-stone-700 cursor-pointer">
                Major Updates ({allPatches.filter(p => p.type === 'major').length})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatches.map(patch => <Link href={`/patch-notes/${patch.slug}`} key={patch.id} className="block h-full">
              <Card className="bg-gradient-to-br from-stone-800/90 to-stone-900/90 border-stone-600/20 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full hover:border-amber-500/30">
                {}
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <Image src={patch.thumbnail || patch.images[0] || 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Azir_0.jpg'} alt={patch.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" onError={e => {
                e.target.src = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Azir_0.jpg';
              }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
                  
                  {}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-amber-500/90 text-stone-900 font-bold">
                      v{patch.version}
                    </Badge>
                  </div>

                  {}
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className={`${getTypeColor(patch.type)} font-medium`}>
                      {getTypeIcon(patch.type)}
                      <span className="ml-1 capitalize">{patch.type}</span>
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-stone-400 text-xs mb-2">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(patch.date)}
                  </div>
                  <CardTitle className="text-lg font-bold text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-2">
                    {patch.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-grow pt-0">
                  <p className="text-stone-300 text-sm leading-relaxed mb-3 line-clamp-2">
                    {patch.excerpt || patch.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-amber-400 font-medium">
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      Read Notes
                    </div>
                    <div className="text-stone-500">
                      {patch.changes.length} sections
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>)}
        </div>

        {}
        {filteredPatches.length === 0 && <Card className="bg-gradient-to-br from-stone-800/90 to-stone-900/90 border-stone-600/20 backdrop-blur-sm shadow-xl">
            <CardContent className="py-12 text-center">
              <div className="text-stone-400 text-lg">
                No patch notes found for the selected filter.
              </div>
              <p className="text-stone-500 mt-2 text-sm">
                Try selecting a different filter to see more results.
              </p>
            </CardContent>
          </Card>}

        {}
        <div className="text-center mt-12 text-stone-500">
          <p>Stay tuned for more updates and improvements!</p>
        </div>
      </div>
    </div>;
}