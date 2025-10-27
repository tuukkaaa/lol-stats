'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
export default function AuthNav() {
  const {
    user,
    loading
  } = useAuth();
  const pathname = usePathname();
  if (pathname?.startsWith('/auth')) {
    return null;
  }
  if (loading) {
    return <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-stone-800 rounded-full animate-pulse"></div>
      </div>;
  }
  if (user) {
    return <div className="flex items-center space-x-4">
        <Link href="/profile" className="flex items-center space-x-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden md:inline">Profile</span>
        </Link>
      </div>;
  }
  return <div className="flex items-center space-x-4">
      <Link href="/auth/login" className="px-4 py-2 text-white hover:text-amber-400 transition-colors">
        Login
      </Link>
      <Link href="/auth/signup" className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold rounded-lg transition-colors">
        Sign Up
      </Link>
    </div>;
}