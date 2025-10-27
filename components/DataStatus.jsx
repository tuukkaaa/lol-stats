'use client';

import { Database, Clock, CheckCircle, WifiOff } from 'lucide-react';
const DataStatus = ({
  lastFetched,
  savedToDb = false,
  isLoading = false,
  error = null,
  className = "",
  size = "sm"
}) => {
  const getTimeAgo = timestamp => {
    if (!timestamp) return null;
    const now = new Date();
    const fetchTime = new Date(timestamp);
    const diffMs = now - fetchTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  const timeAgo = getTimeAgo(lastFetched);
  const iconSize = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";
  if (isLoading) {
    return <div className={`flex items-center gap-1.5 text-stone-400 ${className}`}>
        <div className={`${iconSize} border border-stone-400 border-t-amber-400 rounded-full animate-spin`} />
        <span className={`${textSize} font-medium`}>Loading...</span>
      </div>;
  }
  if (error) {
    return <div className={`flex items-center gap-1.5 text-red-400/70 ${className}`}>
        <WifiOff className={iconSize} />
        <span className={`${textSize} font-medium`}>Offline</span>
      </div>;
  }
  return <div className={`flex items-center gap-2 ${className}`}>
      {}
      {savedToDb && <div className="flex items-center gap-1 text-emerald-400/60">
          <Database className={iconSize} />
          <span className={`${textSize} font-medium`}>Saved</span>
        </div>}
      
      {}
      {timeAgo && <div className="flex items-center gap-1 text-stone-400/70">
          <Clock className={iconSize} />
          <span className={`${textSize} font-medium`}>{timeAgo}</span>
        </div>}
    </div>;
};
export default DataStatus;