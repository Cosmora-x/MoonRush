import React, { useState, useEffect } from 'react';
import { Trophy, Play, Loader2 } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  onBack: () => void;
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-md mx-auto bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-yellow-400" />
        <h2 className="text-3xl font-bold text-white tracking-tight">Top Rovers</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="w-full space-y-2 mb-8">
          {entries.length === 0 ? (
            <div className="text-center text-slate-400 py-4">No scores yet. Be the first!</div>
          ) : (
            entries.map((entry, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-bold w-6 text-center ${
                    index === 0 ? 'text-yellow-400' : 
                    index === 1 ? 'text-slate-300' : 
                    index === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="text-white font-medium">{entry.name}</span>
                </div>
                <span className="text-emerald-400 font-mono font-bold">{entry.score}</span>
              </div>
            ))
          )}
        </div>
      )}

      <button
        onClick={onBack}
        className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors border border-slate-600"
      >
        Back to Menu
      </button>
    </div>
  );
}
