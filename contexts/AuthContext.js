'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, getUser, getUserRiotAccounts } from '@/lib/auth';
const AuthContext = createContext({
  user: null,
  session: null,
  riotAccounts: [],
  loading: true,
  refreshRiotAccounts: async () => {}
});
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [riotAccounts, setRiotAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadRiotAccounts = async () => {
    const {
      data,
      error
    } = await getUserRiotAccounts();
    if (!error && data) {
      setRiotAccounts(data);
    }
  };
  const refreshRiotAccounts = async () => {
    await loadRiotAccounts();
  };
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          user: currentUser
        } = await getUser();
        setUser(currentUser);
        if (currentUser) {
          await loadRiotAccounts();
        }
      } catch (error) {
        console.log('No active session');
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
    const {
      data: {
        subscription
      }
    } = onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        await loadRiotAccounts();
      } else {
        setRiotAccounts([]);
      }
      setLoading(false);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  const value = {
    user,
    session,
    riotAccounts,
    loading,
    refreshRiotAccounts
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}