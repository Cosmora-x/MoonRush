import React from 'react';
import { Play, Trophy, Rocket } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  onLeaderboard: () => void;
}

export default function MainMenu({ onStart, onLeaderboard }: MainMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-md mx-auto bg-slate-900/80 backdrop-blur-md p-10 rounded-3xl border border-slate-700 shadow-2xl">
      <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
        <Rocket className="w-10 h-10 text-blue-400" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter text-center">
        MOON ROVER
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          RUSH
        </span>
      </h1>
      
      <p className="text-slate-400 text-center mb-10 max-w-xs">
        Jump over craters, collect space gems, and survive the lunar surface.
      </p>

      <div className="w-full space-y-4">
        <button
          onClick={onStart}
          className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
        >
          <Play className="w-6 h-6 fill-current" />
          START MISSION
        </button>
        
        <button
          onClick={onLeaderboard}
          className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg transition-all border border-slate-600 flex items-center justify-center gap-3"
        >
          <Trophy className="w-6 h-6 text-yellow-400" />
          LEADERBOARD
        </button>
      </div>
    </div>
  );
}
