'use client';

import { useState, useEffect } from 'react';
export default function AuthStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        setStatus({
          status: 'error',
          message: 'Failed to check auth status',
          error: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);
  if (loading) {
    return <div className="fixed bottom-4 right-4 bg-stone-900 border border-stone-700 rounded-lg p-4 shadow-xl max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-amber-400"></div>
          <span className="text-stone-300">Checking auth status...</span>
        </div>
      </div>;
  }
  if (!status) return null;
  const statusColors = {
    ready: 'border-green-500 bg-green-500/10',
    needs_setup: 'border-yellow-500 bg-yellow-500/10',
    error: 'border-red-500 bg-red-500/10'
  };
  const statusIcons = {
    ready: '✅',
    needs_setup: '⚠️',
    error: '❌'
  };
  return <div className={`fixed bottom-4 right-4 border rounded-lg p-4 shadow-xl max-w-sm ${statusColors[status.status] || 'bg-stone-900 border-stone-700'}`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <span className="text-xl">{statusIcons[status.status]}</span>
            <div>
              <h3 className="font-semibold text-white">Auth Status</h3>
              <p className="text-sm text-stone-300">{status.message}</p>
            </div>
          </div>
        </div>

        {status.checks && <div className="text-xs space-y-1 border-t border-stone-700 pt-2">
            <div className="flex justify-between">
              <span className="text-stone-400">Connection:</span>
              <span className={status.checks.connection ? 'text-green-400' : 'text-red-400'}>
                {status.checks.connection ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Riot Accounts:</span>
              <span className={status.checks.user_riot_accounts ? 'text-green-400' : 'text-red-400'}>
                {status.checks.user_riot_accounts ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Preferences:</span>
              <span className={status.checks.user_preferences ? 'text-green-400' : 'text-red-400'}>
                {status.checks.user_preferences ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Activity Log:</span>
              <span className={status.checks.user_activity_log ? 'text-green-400' : 'text-red-400'}>
                {status.checks.user_activity_log ? '✓' : '✗'}
              </span>
            </div>
          </div>}

        {status.instructions && <div className="text-xs text-amber-300 border-t border-stone-700 pt-2">
            <strong>Instructions:</strong> {status.instructions}
          </div>}
      </div>
    </div>;
}