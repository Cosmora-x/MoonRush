import React, { useState } from 'react';
import { Trophy, RotateCcw, Home, Send } from 'lucide-react';

interface GameOverProps {
  score: number;
  onRestart: () => void;
  onHome: () => void;
}

export default function GameOver({ score, onRestart, onHome }: GameOverProps) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitted) return;

    setSubmitting(true);
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), score }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit score', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-md mx-auto bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl">
      <h2 className="text-4xl font-black text-white mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
        MISSION FAILED
      </h2>
      
      <div className="text-center mb-8">
        <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Final Score</p>
        <p className="text-5xl font-mono font-bold text-emerald-400">{score}</p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="w-full mb-8 space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Enter name for leaderboard
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={15}
              placeholder="Commander Name"
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {submitting ? '...' : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      ) : (
        <div className="w-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 p-4 rounded-lg text-center mb-8 font-medium">
          Score submitted successfully!
        </div>
      )}

      <div className="flex gap-4 w-full">
        <button
          onClick={onRestart}
          className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
        <button
          onClick={onHome}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors border border-slate-600 flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Menu
        </button>
      </div>
    </div>
  );
}
