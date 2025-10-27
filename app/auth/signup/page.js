'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    const {
      data,
      error: signUpError
    } = await signUp(email, password);
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }
  };
  if (success) {
    return <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-stone-900/50 backdrop-blur-sm rounded-lg border border-stone-800 p-8 shadow-xl text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
            <p className="text-stone-400 mb-4">
              Please check your email to verify your account.
            </p>
            <p className="text-sm text-stone-500">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">LoL Stats Tracker</h1>
          <p className="text-stone-400">Create your account</p>
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
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all" placeholder="••••••••" disabled={loading} />
              <p className="mt-1 text-xs text-stone-500">Must be at least 6 characters</p>
            </div>

            {}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-300 mb-2">
                Confirm Password
              </label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all" placeholder="••••••••" disabled={loading} />
            </div>

            {}
            <button type="submit" disabled={loading} className="w-full bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]">
              {loading ? <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-stone-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span> : 'Create Account'}
            </button>
          </form>

          {}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-stone-900/50 text-stone-400">Already have an account?</span>
            </div>
          </div>

          {}
          <Link href="/auth/login">
            <button type="button" className="w-full bg-stone-800 hover:bg-stone-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 border border-stone-700 transform hover:scale-[1.02] active:scale-[0.98]">
              Sign In
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