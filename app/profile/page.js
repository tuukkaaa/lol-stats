'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut, linkRiotAccount, removeRiotAccount, setPrimaryRiotAccount } from '@/lib/auth';
import RiotOAuthButton from '@/components/RiotOAuthButton';
import RiotAccountCard from '@/components/RiotAccountCard';
import Navbar from '@/components/Navbar';
function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    riotAccounts,
    loading,
    refreshRiotAccounts
  } = useAuth();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('EUW1');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [addingAccount, setAddingAccount] = useState(false);
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    if (success === 'riot_linked') {
      setSuccessMessage('✅ Riot account successfully linked!');
      router.replace('/profile', undefined, {
        shallow: true
      });
      refreshRiotAccounts();
    }
    if (error) {
      const errorMessages = {
        oauth_access_denied: 'You denied access to your Riot account',
        missing_code: 'OAuth code missing from callback',
        invalid_state: 'Invalid OAuth state - possible CSRF attack',
        not_authenticated: 'You must be logged in to connect Riot accounts',
        summoner_not_found: 'Could not find summoner data for your account',
        link_failed: 'Failed to link Riot account. It may already be linked to another user.',
        oauth_failed: 'OAuth authentication failed. Please try again.'
      };
      setError(errorMessages[error] || 'An error occurred during account linking');
      router.replace('/profile', undefined, {
        shallow: true
      });
    }
  }, [searchParams, router, refreshRiotAccounts]);
  if (!loading && !user) {
    router.push('/auth/login');
    return null;
  }
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>;
  }
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };
  const handleAddAccount = async e => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setAddingAccount(true);
    try {
      const response = await fetch(`/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Summoner not found. Please check your Riot ID and region.');
      }
      const data = await response.json();
      console.log('API Response:', data);
      const {
        account,
        summoner
      } = data;
      if (!account || !account.puuid) {
        throw new Error('Invalid summoner data received from API');
      }
      const {
        data: linkData,
        error: linkError
      } = await linkRiotAccount({
        puuid: account.puuid,
        gameName: account.gameName,
        tagLine: account.tagLine,
        region: region,
        summonerId: summoner.id,
        accountId: summoner.accountId,
        summonerLevel: summoner.summonerLevel,
        profileIconId: summoner.profileIconId,
        isPrimary: riotAccounts.length === 0
      });
      if (linkError) {
        throw linkError;
      }
      setSuccessMessage(`✅ Successfully added ${account.gameName}#${account.tagLine}!`);
      await refreshRiotAccounts();
      setGameName('');
      setTagLine('');
      setShowAddAccount(false);
    } catch (err) {
      console.error('Add account error:', err);
      setError(err.message || 'Failed to add Riot account');
    } finally {
      setAddingAccount(false);
    }
  };
  const handleRemoveAccount = async accountId => {
    if (!confirm('Are you sure you want to remove this Riot account?')) {
      return;
    }
    const {
      error: removeError
    } = await removeRiotAccount(accountId);
    if (!removeError) {
      await refreshRiotAccounts();
    }
  };
  const handleSetPrimary = async accountId => {
    const {
      error: setPrimaryError
    } = await setPrimaryRiotAccount(accountId);
    if (!setPrimaryError) {
      await refreshRiotAccounts();
    }
  };
  const regions = [{
    value: 'EUW1',
    label: 'EUW - Europe West'
  }, {
    value: 'EUN1',
    label: 'EUNE - Europe Nordic & East'
  }, {
    value: 'NA1',
    label: 'NA - North America'
  }, {
    value: 'KR',
    label: 'KR - Korea'
  }, {
    value: 'BR1',
    label: 'BR - Brazil'
  }, {
    value: 'JP1',
    label: 'JP - Japan'
  }, {
    value: 'LA1',
    label: 'LAN - Latin America North'
  }, {
    value: 'LA2',
    label: 'LAS - Latin America South'
  }, {
    value: 'OC1',
    label: 'OCE - Oceania'
  }, {
    value: 'TR1',
    label: 'TR - Turkey'
  }, {
    value: 'RU',
    label: 'RU - Russia'
  }];
  return <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      {}
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {}
        {successMessage && <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6">
            <p className="text-green-400">{successMessage}</p>
          </div>}

        {}
        {error && !showAddAccount && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>}

        {}
        <div className="bg-stone-900/50 backdrop-blur-sm rounded-lg border border-stone-800 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
          <div className="space-y-2">
            <p className="text-stone-400">
              <span className="font-medium text-stone-300">Email:</span> {user.email}
            </p>
            <p className="text-stone-400">
              <span className="font-medium text-stone-300">User ID:</span> {user.id}
            </p>
          </div>
        </div>

        {}
        <div className="bg-stone-900/50 backdrop-blur-sm rounded-lg border border-stone-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Riot Accounts</h2>
            <button onClick={() => setShowAddAccount(!showAddAccount)} className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold rounded-lg transition-colors">
              {showAddAccount ? 'Cancel' : '+ Add Manually'}
            </button>
          </div>

          {}
          {!showAddAccount && process.env.NEXT_PUBLIC_RIOT_CLIENT_ID && <div className="mb-6 p-4 bg-stone-800/30 rounded-lg border border-stone-700">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Quick Connect</h3>
                  <p className="text-sm text-stone-400 mb-4">
                    Link your Riot account instantly using official Riot authentication. This verifies account ownership automatically.
                  </p>
                  <RiotOAuthButton />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-700">
                <p className="text-xs text-stone-500 text-center">
                  Or use manual entry below if you prefer
                </p>
              </div>
            </div>}

          {}
          {showAddAccount && <div className="mb-6 p-4 bg-stone-800/50 rounded-lg border border-stone-700">
              <h3 className="text-lg font-semibold text-white mb-4">Add Riot Account Manually</h3>
              
              {}
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>How to find your Riot ID:</strong><br />
                  Your Riot ID is in the format <code className="bg-stone-700 px-1 rounded">GameName#TAG</code>. 
                  For example: <code className="bg-stone-700 px-1 rounded">Faker#KR1</code><br />
                  You can find it in the League of Legends client or on your Riot account page.
                </p>
              </div>

              <form onSubmit={handleAddAccount} className="space-y-4">
                {error && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Game Name
                    </label>
                    <input type="text" value={gameName} onChange={e => setGameName(e.target.value)} required placeholder="Faker" className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400" disabled={addingAccount} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Tag Line
                    </label>
                    <input type="text" value={tagLine} onChange={e => setTagLine(e.target.value)} required placeholder="KR1" className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400" disabled={addingAccount} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Region
                    </label>
                    <select value={region} onChange={e => setRegion(e.target.value)} className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400" disabled={addingAccount}>
                      {regions.map(r => <option key={r.value} value={r.value}>
                          {r.label}
                        </option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={addingAccount} className="w-full bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {addingAccount ? 'Adding Account...' : 'Add Account'}
                </button>
              </form>
            </div>}

          {}
          {riotAccounts.length === 0 ? <div className="text-center py-8">
              <p className="text-stone-400 mb-4">No Riot accounts connected yet</p>
              <p className="text-sm text-stone-500">
                Add your Riot account to track your League of Legends stats
              </p>
            </div> : <div className="space-y-4">
              {riotAccounts.map(account => <RiotAccountCard key={account.id} account={account} regions={regions} onSetPrimary={handleSetPrimary} onRemove={handleRemoveAccount} onViewStats={acc => router.push(`/summoner/${acc.region}/${acc.game_name}-${acc.tag_line}`)} />)}
            </div>}
        </div>
      </div>
    </div>;
}
export default function ProfilePage() {
  return <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
        </div>
      </div>}>
      <ProfileContent />
    </Suspense>;
}