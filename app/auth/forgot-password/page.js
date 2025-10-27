'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/auth';
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const {
      error: resetError
    } = await resetPassword(email);
    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
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
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-stone-400 mb-6">
              We&apos;ve sent you a password reset link. Please check your email and follow the instructions.
            </p>
            <Link href="/auth/login">
              <button className="w-full bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold py-3 px-4 rounded-lg transition-colors">
                Back to Login
              </button>
            </Link>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">LoL Stats Tracker</h1>
          <p className="text-stone-400">Reset your password</p>
        </div>

        {}
        <div className="bg-stone-900/50 backdrop-blur-sm rounded-lg border border-stone-800 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            {error && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>}

            <div className="text-center mb-6">
              <p className="text-stone-300 text-sm">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-2">
                Email
              </label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all" placeholder="you@example.com" disabled={loading} />
            </div>

            {}
            <button type="submit" disabled={loading} className="w-full bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {}
          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
              ← Back to Login
            </Link>
          </div>
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