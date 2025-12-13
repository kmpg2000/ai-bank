
import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export const VisitorCounter: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true);
        // countapi.xyz is deprecated/down. Switched to counterapi.dev.
        // This provides a persistent counter without authentication.
        // We use a specific namespace for this app to ensure continuity.
        const namespace = 'ai-bank-official-site';
        const key = 'visits';
        
        // The 'up' endpoint increments the counter and returns the new value.
        const response = await fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`);
        
        if (!response.ok) {
           throw new Error('Counter API Error');
        }
        
        const data = await response.json();
        // Add 10,000 offset as requested
        setCount(data.count + 10000);
      } catch (error) {
        console.warn('Visitor counter error:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50 animate-pulse">
        <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
        <div className="w-16 h-3 bg-gray-600 rounded"></div>
      </div>
    );
  }

  // If error occurs, do not show random numbers. Hide the component to ensure accuracy.
  if (error || count === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono bg-gray-800/40 px-3 py-1.5 rounded-full border border-gray-700/50 hover:bg-gray-800/60 transition-colors cursor-help group" title="現在の総アクセス数">
      <Users size={12} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
      <span className="uppercase tracking-widest text-gray-500 group-hover:text-gray-400">Total Visits</span>
      <span className="text-indigo-300 font-bold tabular-nums text-xs group-hover:text-indigo-200 group-hover:scale-105 transition-all inline-block">
        {count.toLocaleString()}
      </span>
    </div>
  );
};