'use client';

import Link from 'next/link';
import { Trophy, Menu, X } from 'lucide-react';
import SummonerSearch from './SummonerSearch';
import AuthNavDropdown from './AuthNavDropdown';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export default function Navbar({
  showSearch = false,
  onSummonerFound = null
}) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleSummonerFound = data => {
    if (onSummonerFound) {
      onSummonerFound(data);
    } else {
      const {
        account,
        region
      } = data;
      router.push(`/summoner/${region}/${encodeURIComponent(account.gameName)}-${encodeURIComponent(account.tagLine)}`);
    }
  };
  return <nav className="bg-gradient-to-r from-stone-900/90 to-stone-800/90 backdrop-blur-md border-b border-stone-700/50 shadow-xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer">
                  LoL Tracker
                </h1>
              </Link>
            </div>
            
            {}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/leaderboard" className="text-stone-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-2 cursor-pointer">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Link>
              <Link href="/patch-notes" className="text-stone-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-2 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Patch Notes
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {showSearch && <div className="hidden md:block w-80">
                <SummonerSearch onSummonerFound={handleSummonerFound} compact />
              </div>}
            
            {}
            <div className="hidden md:block">
              <AuthNavDropdown />
            </div>
            
            {}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-stone-300 hover:text-amber-400 transition-colors cursor-pointer">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {}
        {isMobileMenuOpen && <div className="md:hidden border-t border-stone-700/50 bg-stone-900/95 backdrop-blur-md">
            <div className="py-4 space-y-4">
              <Link href="/leaderboard" className="flex items-center gap-2 px-4 py-2 text-stone-300 hover:text-amber-400 hover:bg-stone-800/50 transition-colors rounded-lg mx-2 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Link>
              <Link href="/patch-notes" className="flex items-center gap-2 px-4 py-2 text-stone-300 hover:text-amber-400 hover:bg-stone-800/50 transition-colors rounded-lg mx-2 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Patch Notes
              </Link>
              
              {}
              <div className="px-2 border-t border-stone-700/50 pt-4">
                <AuthNavDropdown />
              </div>
              
              {showSearch && <div className="px-2 pt-2">
                  <SummonerSearch onSummonerFound={data => {
              handleSummonerFound(data);
              setIsMobileMenuOpen(false);
            }} compact />
                </div>}
            </div>
          </div>}
      </div>
    </nav>;
}