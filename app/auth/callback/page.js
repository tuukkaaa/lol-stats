'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    const handleAuthCallback = async () => {
      const {
        error
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Error during auth callback:', error);
        router.push('/auth/login?error=callback_failed');
        return;
      }
      router.push('/profile');
    };
    handleAuthCallback();
  }, [router]);
  return <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
        <p className="text-white">Verifying your account...</p>
      </div>
    </div>;
}