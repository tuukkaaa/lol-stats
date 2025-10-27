'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowLeft, Share2, Sparkles, Star, ChevronUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
export default function PatchNotesDetail({
  patch
}) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const getChampionImageName = championName => {
    const championMappings = {
      'Wukong': 'MonkeyKing',
      'Aurelion Sol': 'AurelionSol',
      'Cho\'Gath': 'Chogath',
      'Dr. Mundo': 'DrMundo',
      'Jarvan IV': 'JarvanIV',
      'Kai\'Sa': 'Kaisa',
      'Kha\'Zix': 'Khazix',
      'Kog\'Maw': 'KogMaw',
      'LeBlanc': 'Leblanc',
      'Lee Sin': 'LeeSin',
      'Master Yi': 'MasterYi',
      'Miss Fortune': 'MissFortune',
      'Nunu': 'Nunu',
      'Rek\'Sai': 'RekSai',
      'Renata': 'Renata',
      'Tahm Kench': 'TahmKench',
      'Twisted Fate': 'TwistedFate',
      'Vel\'Koz': 'Velkoz',
      'Xin Zhao': 'XinZhao'
    };
    return championMappings[championName] || championName.replace(/[^a-zA-Z]/g, '');
  };
  if (!patch) {
    return <div className="min-h-screen bg-stone-950">
        <Navbar showSearch={true} />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-stone-900/95 border-stone-700/60">
            <CardContent className="py-12 text-center">
              <h1 className="text-2xl font-bold text-stone-100 mb-4">Patch Not Found</h1>
              <p className="text-stone-400 mb-6">The requested patch notes could not be found.</p>
              <Link href="/patch-notes">
                <Button variant="outline" className="bg-stone-700 border-stone-600 text-stone-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All Patches
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
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
        return 'text-emerald-300';
      case 'nerf':
        return 'text-red-300';
      default:
        return 'text-stone-200';
    }
  };
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
        <div className="mb-6">
          <Link href="/patch-notes">
            <Button variant="outline" className="bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700 hover:border-stone-600 transition-all duration-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Patches
            </Button>
          </Link>
        </div>

        {}
        <Card className="bg-stone-900/95 border-stone-700/60 backdrop-blur-sm shadow-xl mb-8">
          {}
          {patch.images && patch.images.length > 0 && <div className="relative aspect-[21/9] overflow-hidden rounded-t-lg">
              <Image src={patch.images[0]} alt={patch.title} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent" />
              
              {}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <Badge className="bg-amber-500 text-stone-900 font-bold text-lg px-4 py-2">
                    v{patch.version}
                  </Badge>
                  <Badge variant="outline" className={`${getTypeColor(patch.type)} font-medium px-3 py-1`}>
                    {getTypeIcon(patch.type)}
                    <span className="ml-1 capitalize">{patch.type} Update</span>
                  </Badge>
                  <div className="flex items-center gap-2 text-stone-300 bg-stone-900/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    <CalendarDays className="h-4 w-4" />
                    <span className="font-medium">{formatDate(patch.date)}</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-stone-100 mb-4 leading-tight">
                  {patch.title}
                </h1>
                <p className="text-xl text-stone-300 max-w-4xl leading-relaxed">
                  {patch.summary}
                </p>
                
                {}
                <div className="flex items-center gap-6 mt-6 text-sm">
                  <div className="flex items-center gap-2 text-amber-400">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="font-medium">{patch.changes.length} Categories</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="font-medium">
                      {patch.changes.reduce((acc, cat) => acc + cat.items.length, 0)} Changes
                    </span>
                  </div>
                </div>
              </div>
            </div>}
        </Card>

        {}
        {(() => {
        const allChampions = new Set();
        patch.changes.forEach(category => {
          const {
            championGroups
          } = groupChampionChanges(category);
          Object.keys(championGroups).forEach(champion => allChampions.add(champion));
        });
        const championList = Array.from(allChampions).sort();
        if (championList.length > 0) {
          return <Card id="champion-navigation" className="bg-stone-900/95 border-stone-700/60 backdrop-blur-sm shadow-xl mb-6 scroll-mt-24">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-amber-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      Champion Changes ({championList.length})
                    </CardTitle>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span className="text-stone-400">Mostly Buffs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-stone-400">Mostly Nerfs</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                    {championList.map(champion => {
                  let buffs = 0,
                    nerfs = 0;
                  patch.changes.forEach(category => {
                    const {
                      championGroups
                    } = groupChampionChanges(category);
                    if (championGroups[champion]) {
                      championGroups[champion].forEach(change => {
                        const changeType = getChangeType(change);
                        if (changeType === 'buff') buffs++;else if (changeType === 'nerf') nerfs++;
                      });
                    }
                  });
                  const dominantType = buffs > nerfs ? 'buff' : nerfs > buffs ? 'nerf' : 'neutral';
                  return <button key={champion} onClick={() => {
                    const element = document.getElementById(`champion-${champion.replace(/[^a-zA-Z0-9]/g, '-')}`);
                    if (element) {
                      element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                      element.classList.add('animate-pulse');
                      setTimeout(() => element.classList.remove('animate-pulse'), 2000);
                    }
                  }} className="group flex flex-col items-center p-2 rounded-lg bg-stone-800/40 hover:bg-stone-800/60 border border-stone-700/40 hover:border-amber-500/40 transition-all duration-200 hover:scale-105 relative" title={`Jump to ${champion} changes (${buffs} buffs, ${nerfs} nerfs)`}>
                          {}
                          {dominantType !== 'neutral' && <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-stone-900 ${dominantType === 'buff' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>}
                          
                          <img src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${getChampionImageName(champion)}.png`} alt={champion} width="32" height="32" className="rounded-full border border-stone-600 group-hover:border-amber-500/60 transition-colors" onError={e => {
                      e.target.src = 'https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/Azir.png';
                    }} />
                          <span className="text-xs text-stone-400 group-hover:text-amber-400 transition-colors mt-1 text-center leading-tight">
                            {champion.length > 8 ? champion.substring(0, 6) + '...' : champion}
                          </span>
                        </button>;
                })}
                  </div>
                </CardContent>
              </Card>;
        }
        return null;
      })()}

        {}
        <div className="space-y-6">
          {patch.changes.map((category, index) => {
          const {
            championGroups,
            otherChanges
          } = groupChampionChanges(category);
          return <Card key={index} className="bg-stone-900/95 border-stone-700/60 backdrop-blur-sm shadow-xl overflow-hidden">
                <CardHeader className="bg-stone-800/30 border-b border-stone-700/60 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-amber-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      {category.category}
                      <div className="ml-2 text-xs text-stone-400 bg-stone-700/60 px-2 py-1 rounded">
                        {category.items.length}
                      </div>
                    </CardTitle>
                    <button onClick={() => {
                  const element = document.getElementById('champion-navigation');
                  if (element) {
                    element.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }} className="text-stone-400 hover:text-amber-400 text-xs transition-colors duration-200" title="Back to champion navigation">
                      ↑ Champions
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {}
                  {Object.entries(championGroups).map(([champion, changes]) => <div key={champion} id={`champion-${champion.replace(/[^a-zA-Z0-9]/g, '-')}`} className="mb-6 last:mb-0 scroll-mt-24">
                      <div className="flex items-center gap-3 mb-3 p-2 bg-stone-800/20 rounded-lg target:bg-amber-500/10 target:border target:border-amber-500/30 transition-all duration-300">
                        <img src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${getChampionImageName(champion)}.png`} alt={champion} width="32" height="32" className="rounded-full border border-amber-500/40" onError={e => {
                    e.target.style.display = 'none';
                  }} />
                        <div>
                          <h4 className="text-lg font-bold text-stone-100">{champion}</h4>
                          <p className="text-stone-400 text-xs">{changes.length} change{changes.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="space-y-2 ml-11">
                        {changes.map((change, changeIndex) => {
                    const changeType = getChangeType(change);
                    return <div key={changeIndex} className="flex items-start gap-3 p-2 bg-stone-800/10 rounded hover:bg-stone-800/20 transition-colors">
                              <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${changeType === 'buff' ? 'bg-emerald-400' : changeType === 'nerf' ? 'bg-red-400' : 'bg-stone-500'}`}></div>
                              <div className="flex-1">
                                <span className={`leading-relaxed text-sm ${getChangeColor(changeType)}`}>
                                  {change.replace(new RegExp(`\\b${champion}\\b`, 'gi'), '').trim()}
                                </span>
                                {changeType !== 'neutral' && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${changeType === 'buff' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {changeType === 'buff' ? 'BUFF' : 'NERF'}
                                  </span>}
                              </div>
                            </div>;
                  })}
                      </div>
                    </div>)}
                  
                  {}
                  {otherChanges.length > 0 && <div className="space-y-3">
                      {Object.keys(championGroups).length > 0 && <div className="border-t border-stone-700/60 pt-4 mt-4">
                          <h4 className="text-base font-bold text-stone-200 mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-stone-400 rounded-full"></div>
                            General Changes
                          </h4>
                        </div>}
                      {otherChanges.map((item, itemIndex) => {
                  const changeType = getChangeType(item);
                  return <div key={itemIndex} className="flex items-start gap-3 p-2 bg-stone-800/10 rounded hover:bg-stone-800/20 transition-colors">
                            <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${changeType === 'buff' ? 'bg-emerald-400' : changeType === 'nerf' ? 'bg-red-400' : 'bg-stone-500'}`}></div>
                            <div className="flex-1">
                              <span className={`leading-relaxed text-sm ${getChangeColor(changeType)}`}>
                                {item}
                              </span>
                              {changeType !== 'neutral' && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${changeType === 'buff' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {changeType === 'buff' ? 'BUFF' : 'NERF'}
                                </span>}
                            </div>
                          </div>;
                })}
                    </div>}
                </CardContent>
              </Card>;
        })}
        </div>

        {}
        <div className="mt-16 text-center">
          <div className="bg-stone-900/95 border border-stone-700/60 rounded-xl p-8 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-stone-100 mb-4">
              Ready to climb with these changes?
            </h3>
            <p className="text-stone-400 mb-6 max-w-2xl mx-auto">
              Head back to our patch notes overview to stay updated with the latest League of Legends changes and balance updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/patch-notes">
                <Button variant="outline" className="bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700 hover:border-stone-600 transition-all duration-200">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  View All Patch Notes
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium transition-all duration-200">
                  Back to Stats Tracker
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {}
      {showScrollTop && <button onClick={scrollToTop} className="fixed bottom-8 right-8 p-3 bg-amber-500 hover:bg-amber-600 text-stone-900 rounded-full shadow-lg transition-all duration-300 z-50" title="Scroll to top">
          <ChevronUp className="h-5 w-5" />
        </button>}
    </div>;
}