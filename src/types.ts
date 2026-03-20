export type GameState = 'MENU' | 'PLAYING' | 'GAME_OVER' | 'LEADERBOARD';

export interface LeaderboardEntry {
  name: string;
  score: number;
}
