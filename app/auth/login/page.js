'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const {
      data,
      error: signInError
    } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      router.push('/');
      router.refresh();
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">LoL Stats Tracker</h1>
          <p className="text-stone-400">Sign in to your account</p>
        </div>

        {}
        <div className="bg-stone-900/50 backdrop-blur-sm rounded-lg border border-stone-800 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            {error && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>}

            {}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-2">
                Email
              </label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all" placeholder="you@example.com" disabled={loading} />
            </div>

            {}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-300 mb-2">
                Password
              </label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all" placeholder="••••••••" disabled={loading} />
            </div>

            {}
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {}
            <button type="submit" disabled={loading} className="w-full bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]">
              {loading ? <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-stone-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span> : 'Sign In'}
            </button>
          </form>

          {}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-stone-900/50 text-stone-400">Don&apos;t have an account?</span>
            </div>
          </div>

          {}
          <Link href="/auth/signup">
            <button type="button" className="w-full bg-stone-800 hover:bg-stone-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 border border-stone-700 transform hover:scale-[1.02] active:scale-[0.98]">
              Create Account
            </button>
          </Link>
        </div>

        {}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-400 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>;
}