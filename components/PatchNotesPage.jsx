'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Filter, Zap, Bug, Wrench, ChevronDown, ChevronUp, Sparkles, Star } from 'lucide-react';
import { patchNotes } from '@/data/patchNotes';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
export default function PatchNotesPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [expandedPatch, setExpandedPatch] = useState(null);
  const filteredPatchNotes = useMemo(() => {
    if (selectedType === 'all') return patchNotes;
    return patchNotes.filter(patch => patch.type === selectedType);
  }, [selectedType]);
  const getTypeIcon = type => {
    switch (type) {
      case 'major':
        return <Sparkles className="h-4 w-4" />;
      case 'balance':
        return <Wrench className="h-4 w-4" />;
      case 'bugfix':
        return <Bug className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };
  const getTypeColor = type => {
    switch (type) {
      case 'major':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'balance':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'bugfix':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };
  const getPriorityColor = priority => {
    switch (priority) {
      case 'major':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'minor':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'patch':
        return 'bg-stone-500/20 text-stone-400 border-stone-500/30';
      default:
        return 'bg-stone-500/20 text-stone-400 border-stone-500/30';
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
  const groupChampionChanges = category => {
    const championCategories = ['Champion Changes', 'Champion Buffs', 'Champion Nerfs', 'Balance Changes', 'Champion Updates', 'Champion Adjustments', 'Gameplay Changes'];
    const shouldGroupChampions = championCategories.some(cat => category.category.toLowerCase().includes(cat.toLowerCase()) || category.category.toLowerCase().includes('champion') || category.category.toLowerCase().includes('buff') || category.category.toLowerCase().includes('nerf'));
    if (!shouldGroupChampions) {
      return {
        championGroups: {},
        otherChanges: category.items
      };
    }
    const champions = ['Aatrox', 'Ahri', 'Akali', 'Akshan', 'Alistar', 'Ammu', 'Anivia', 'Annie', 'Aphelios', 'Ashe', 'Aurelion Sol', 'Azir', 'Bard', 'Bel\'Veth', 'Blitzcrank', 'Brand', 'Braum', 'Briar', 'Caitlyn', 'Camille', 'Cassiopeia', 'Cho\'Gath', 'Corki', 'Darius', 'Diana', 'Dr. Mundo', 'Draven', 'Ekko', 'Elise', 'Evelynn', 'Ezreal', 'Fiddlesticks', 'Fiora', 'Fizz', 'Galio', 'Gangplank', 'Garen', 'Gnar', 'Gragas', 'Graves', 'Gwen', 'Hecarim', 'Heimerdinger', 'Illaoi', 'Irelia', 'Ivern', 'Janna', 'Jarvan IV', 'Jax', 'Jayce', 'Jhin', 'Jinx', 'Kai\'Sa', 'Kalista', 'Karma', 'Karthus', 'Kassadin', 'Katarina', 'Kayle', 'Kayn', 'Kennen', 'Kha\'Zix', 'Kindred', 'Kled', 'Kog\'Maw', 'LeBlanc', 'Lee Sin', 'Leona', 'Lillia', 'Lissandra', 'Lucian', 'Lulu', 'Lux', 'Malphite', 'Malzahar', 'Maokai', 'Master Yi', 'Miss Fortune', 'Mordekaiser', 'Morgana', 'Nami', 'Nasus', 'Nautilus', 'Neeko', 'Nidalee', 'Nilah', 'Nocturne', 'Nunu', 'Olaf', 'Orianna', 'Ornn', 'Pantheon', 'Poppy', 'Pyke', 'Qiyana', 'Quinn', 'Rakan', 'Rammus', 'Rek\'Sai', 'Rell', 'Renata', 'Renekton', 'Rengar', 'Riven', 'Rumble', 'Ryze', 'Samira', 'Sejuani', 'Senna', 'Seraphine', 'Sett', 'Shaco', 'Shen', 'Shyvana', 'Singed', 'Sion', 'Sivir', 'Skarner', 'Sona', 'Soraka', 'Swain', 'Sylas', 'Syndra', 'Tahm Kench', 'Taliyah', 'Talon', 'Taric', 'Teemo', 'Thresh', 'Tristana', 'Trundle', 'Tryndamere', 'Twisted Fate', 'Twitch', 'Udyr', 'Urgot', 'Varus', 'Vayne', 'Veigar', 'Vel\'Koz', 'Vex', 'Vi', 'Viego', 'Viktor', 'Vladimir', 'Volibear', 'Warwick', 'Wukong', 'Xayah', 'Xerath', 'Xin Zhao', 'Yasuo', 'Yone', 'Yorick', 'Yuumi', 'Zac', 'Zed', 'Zeri', 'Ziggs', 'Zilean', 'Zoe', 'Zyra', 'Ambessa'];
    const championGroups = {};
    const otherChanges = [];
    category.items.forEach(item => {
      let foundChampion = null;
      const sortedChampions = [...champions].sort((a, b) => b.length - a.length);
      for (const champion of sortedChampions) {
        const regex = new RegExp(`\\b${champion}\\b`, 'i');
        if (regex.test(item)) {
          foundChampion = champion;
          break;
        }
      }
      if (foundChampion) {
        if (!championGroups[foundChampion]) {
          championGroups[foundChampion] = [];
        }
        championGroups[foundChampion].push(item);
      } else {
        otherChanges.push(item);
      }
    });
    return {
      championGroups,
      otherChanges
    };
  };
  const getChangeType = text => {
    const buffKeywords = ['increased', 'buffed', 'improved', 'enhanced', 'boosted', 'strengthened', 'up from', 'up to'];
    const nerfKeywords = ['decreased', 'nerfed', 'reduced', 'lowered', 'weakened', 'down from', 'down to'];
    const lowerText = text.toLowerCase();
    if (buffKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'buff';
    }
    if (nerfKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'nerf';
    }
    return 'neutral';
  };
  const getChangeColor = changeType => {
    switch (changeType) {
      case 'buff':
        return 'text-green-400';
      case 'nerf':
        return 'text-red-400';
      default:
        return 'text-stone-200';
    }
  };
  return <div className="min-h-screen bg-stone-950">
      <Navbar showSearch={true} />
      
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/20 rounded-full">
              <Star className="h-8 w-8 text-amber-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-100">
              Patch Notes
            </h1>
          </div>
          <p className="text-xl text-stone-400 max-w-2xl mx-auto">
            Stay up to date with the latest League of Legends champion balance changes, item updates, and game improvements
          </p>
        </div>

        {}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-amber-500" />
            <span className="text-stone-300 font-medium">Filter by type:</span>
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48 bg-stone-800 border-stone-700 text-stone-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-stone-800 border-stone-700">
              <SelectItem value="all" className="text-stone-200 focus:bg-stone-700">
                All Patches ({patchNotes.length})
              </SelectItem>
              <SelectItem value="major" className="text-stone-200 focus:bg-stone-700">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Major Updates ({patchNotes.filter(p => p.type === 'major').length})
                </div>
              </SelectItem>
              <SelectItem value="balance" className="text-stone-200 focus:bg-stone-700">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-blue-400" />
                  Balance Changes ({patchNotes.filter(p => p.type === 'balance').length})
                </div>
              </SelectItem>
              <SelectItem value="bugfix" className="text-stone-200 focus:bg-stone-700">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-amber-400" />
                  Bug Fixes ({patchNotes.filter(p => p.type === 'bugfix').length})
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {}
        <div className="space-y-6">
          {filteredPatchNotes.map(patch => <Card key={patch.id} className="bg-stone-900/95 border-stone-700/60 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="cursor-pointer" onClick={() => setExpandedPatch(expandedPatch === patch.id ? null : patch.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${getPriorityColor(patch.priority)} font-medium px-2 py-1`}>
                        v{patch.version}
                      </Badge>
                      <Badge variant="outline" className={`${getTypeColor(patch.type)} font-medium`}>
                        {getTypeIcon(patch.type)}
                        <span className="ml-1 capitalize">{patch.type}</span>
                      </Badge>
                      <div className="flex items-center gap-1 text-stone-400 text-sm">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(patch.date)}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-stone-100 mb-2">
                      {patch.title}
                    </CardTitle>
                    <p className="text-stone-300 leading-relaxed">
                      {patch.summary}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-stone-400 hover:text-amber-400 hover:bg-stone-800">
                    {expandedPatch === patch.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>

              {}
              {expandedPatch === patch.id && <CardContent className="pt-0">
                  <div className="border-t border-stone-700 pt-6">
                    {}
                    {patch.images && patch.images.length > 0 && <div className="mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {patch.images.map((image, index) => <div key={index} className="relative group">
                              <Image src={image} alt={`${patch.title} screenshot ${index + 1}`} width={600} height={400} className="w-full rounded-lg border border-stone-700 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]" />
                              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                            </div>)}
                        </div>
                      </div>}

                    <div className="space-y-6">
                      {patch.changes.map((category, index) => {
                  const {
                    championGroups,
                    otherChanges
                  } = groupChampionChanges(category);
                  return <div key={index}>
                            <h4 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                              {category.category}
                            </h4>
                            
                            {}
                            {Object.entries(championGroups).map(([champion, changes]) => <div key={champion} className="mb-4 ml-4">
                                <div className="flex items-center gap-3 mb-2">
                                  <img src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champion.replace(/[^a-zA-Z]/g, '')}.png`} alt={champion} width="32" height="32" className="rounded-full border border-amber-500/30" onError={e => {
                          e.target.style.display = 'none';
                        }} />
                                  <h5 className="text-md font-medium text-stone-100">{champion}</h5>
                                </div>
                                <ul className="space-y-1 ml-11">
                                  {changes.map((change, changeIndex) => {
                          const changeType = getChangeType(change);
                          return <li key={changeIndex} className="flex items-start gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${changeType === 'buff' ? 'bg-green-400' : changeType === 'nerf' ? 'bg-red-400' : 'bg-stone-500'}`}></div>
                                        <span className={`leading-relaxed ${getChangeColor(changeType)}`}>
                                          {change.replace(new RegExp(`\\b${champion}\\b`, 'gi'), '').trim()}
                                        </span>
                                      </li>;
                        })}
                                </ul>
                              </div>)}
                            
                            {}
                            {otherChanges.length > 0 && <ul className="space-y-2 ml-4">
                                {otherChanges.map((item, itemIndex) => {
                        const changeType = getChangeType(item);
                        return <li key={itemIndex} className="flex items-start gap-3">
                                      <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${changeType === 'buff' ? 'bg-green-400' : changeType === 'nerf' ? 'bg-red-400' : 'bg-stone-500'}`}></div>
                                      <span className={`leading-relaxed ${getChangeColor(changeType)}`}>
                                        {item}
                                      </span>
                                    </li>;
                      })}
                              </ul>}
                          </div>;
                })}

                    </div>
                  </div>
                </CardContent>}
            </Card>)}
        </div>

        {}
        {filteredPatchNotes.length === 0 && <Card className="bg-stone-900/95 border-stone-700/60 backdrop-blur-sm shadow-xl">
            <CardContent className="py-12 text-center">
              <div className="text-stone-400 text-lg">
                No patch notes found for the selected filter.
              </div>
            </CardContent>
          </Card>}

        {}
        <div className="text-center mt-12 text-stone-500">
          <p>Stay tuned for more updates and improvements!</p>
        </div>
      </div>
    </div>;
}