/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameState } from './types';
import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import GameOver from './components/GameOver';
import Leaderboard from './components/Leaderboard';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [lastScore, setLastScore] = useState(0);

  const handleGameOver = (score: number) => {
    setLastScore(score);
    setGameState('GAME_OVER');
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans selection:bg-blue-500/30">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {gameState === 'MENU' && (
          <MainMenu 
            onStart={() => setGameState('PLAYING')} 
            onLeaderboard={() => setGameState('LEADERBOARD')} 
          />
        )}
        
        {gameState === 'PLAYING' && (
          <GameCanvas onGameOver={handleGameOver} />
        )}
        
        {gameState === 'GAME_OVER' && (
          <GameOver 
            score={lastScore} 
            onRestart={() => setGameState('PLAYING')}
            onHome={() => setGameState('MENU')}
          />
        )}
        
        {gameState === 'LEADERBOARD' && (
          <Leaderboard onBack={() => setGameState('MENU')} />
        )}
      </div>
    </div>
  );
}

