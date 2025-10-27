'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
export default function RiotOAuthButton({
  className = ''
}) {
  const {
    user
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const isConfigured = process.env.NEXT_PUBLIC_RIOT_CLIENT_ID;
  const handleRiotConnect = async () => {
    if (!user) {
      alert('Please log in first to connect your Riot account');
      return;
    }
    setLoading(true);
    try {
      const state = btoa(JSON.stringify({
        userId: user.id,
        timestamp: Date.now()
      }));
      const clientId = process.env.NEXT_PUBLIC_RIOT_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/auth/riot/callback`;
      const authUrl = `https://auth.riotgames.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid&state=${state}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating Riot OAuth:', error);
      alert('Failed to start Riot authentication. Please try again.');
      setLoading(false);
    }
  };
  if (!isConfigured) {
    return null;
  }
  return <button onClick={handleRiotConnect} disabled={loading || !user} className={`flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
      {loading ? <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Connecting...</span>
        </> : <>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.87-7-4.87-7-9.5V8.5l7-3.5 7 3.5v2c-.55 0-1 .45-1 1s.45 1 1 1v2c-.55 0-1 .45-1 1s.45 1 1 1c0 4.63-3.14 8.63-7 9.5z" />
          </svg>
          <span>Connect with Riot</span>
        </>}
    </button>;
}