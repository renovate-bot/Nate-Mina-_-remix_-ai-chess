/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'PvP_LOCAL' | 'PvAI' | 'AIvAI' | 'MULTI';

export type AIDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Grandmaster';

export type PlayerColor = 'w' | 'b';

export interface GameState {
  fen: string;
  history: string[];
  lastMove: any;
  isCheck: boolean;
  isGameOver: boolean;
  winner: PlayerColor | 'draw' | null;
  turn: PlayerColor;
  mode: GameMode;
  difficulty: AIDifficulty;
}
