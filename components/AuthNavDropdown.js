'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
export default function AuthNavDropdown() {
  const {
    user,
    riotAccounts
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const primaryAccount = riotAccounts.find(acc => acc.is_primary) || riotAccounts[0];
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  if (!user) {
    return <div className="flex items-center space-x-4">
        <Link href="/auth/login" className="text-stone-300 hover:text-white transition-colors">
          Login
        </Link>
        <Link href="/auth/signup" className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-900 font-medium rounded-lg transition-colors">
          Sign Up
        </Link>
      </div>;
  }
  return <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-stone-800/50 transition-colors cursor-pointer">
        {primaryAccount ? <>
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-700">
              <Image src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${primaryAccount.profile_icon_id}.png`} alt={`${primaryAccount.game_name} icon`} fill className="object-cover" unoptimized />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-white">
                {primaryAccount.game_name}
              </div>
              <div className="text-xs text-stone-400">
                #{primaryAccount.tag_line}
              </div>
            </div>
          </> : <>
            <div className="w-10 h-10 rounded-lg bg-stone-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-white">
                {user.email?.split('@')[0] || 'Profile'}
              </div>
              <div className="text-xs text-stone-400">
                No account connected
              </div>
            </div>
          </>}
        <svg className={`w-4 h-4 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && <div className="absolute right-0 mt-2 w-48 bg-stone-800 border border-stone-700 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {riotAccounts.length > 0 && <>
              <div className="px-4 py-2 text-xs text-stone-500 border-b border-stone-700">
                {riotAccounts.length} {riotAccounts.length === 1 ? 'account' : 'accounts'} connected
              </div>
            </>}
          <Link href="/profile" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-stone-300 hover:bg-stone-700 hover:text-white transition-colors cursor-pointer">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </div>
          </Link>
          <hr className="border-stone-700 my-1" />
          <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-stone-700 transition-colors cursor-pointer">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </div>
          </button>
        </div>}
    </div>;
}