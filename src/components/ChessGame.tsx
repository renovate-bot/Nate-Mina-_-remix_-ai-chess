/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Users, 
  Bot, 
  Settings, 
  ChevronLeft,
  Loader2,
  Play,
  Volume2,
  VolumeX,
  Timer,
  Undo,
  RefreshCw,
  Sword,
  Sliders,
  Award
} from 'lucide-react';
import { GameMode, AIDifficulty, PlayerColor } from '../types';

// ==========================================
// PIECE SQUARE MOVEMENT TABLES
// ==========================================
const pawnEval = [
  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,
  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,
  1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0,
  0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5,
  0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0,
  0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5,
  0.5,  1.0,  1.0, -2.0, -2.0,  1.0,  1.0,  0.5,
  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0
];

const knightEval = [
  -5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0,
  -4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0,
  -3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0,
  -3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0,
  -3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0,
  -3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0,
  -4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0,
  -5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0
];

const bishopEval = [
  -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0,
  -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0,
  -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0,
  -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0,
  -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0,
  -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
  -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0,
  -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0
];

const rookEval = [
   0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,
   0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5,
  -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
  -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
  -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
  -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
  -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
   0.0,  0.0,  0.0,  0.5,  0.5,  0.0,  0.0,  0.0
];

const queenEval = [
  -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0,
  -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0,
  -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0,
  -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5,
   0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5,
  -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0,
  -1.0,  0.0,  0.5,  0.0,  0.0,  0.5,  0.0, -1.0,
  -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0
];

const kingEvalActive = [
  -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
  -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
  -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
  -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
  -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0,
  -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0,
   2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0,
   2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0
];

// ==========================================
// AUDIO SYNTHESIZER
// ==========================================
function playChessSound(type: 'move' | 'capture' | 'check' | 'gameover', isMuted: boolean) {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'move') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'capture') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'check') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'gameover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Web Audio API unavailable for sound type: ${type}`, e);
    }
  }
}

// ==========================================
// CAPTURE UTILS
// ==========================================
interface CapturedPieces {
  w: string[]; // captured white pieces
  b: string[]; // captured black pieces
}

const PIECE_UNICHAR: { [key: string]: string } = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚'
};

function getCapturedPieces(gameInstance: Chess): CapturedPieces {
  const starting = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const currentWhite = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  const currentBlack = { p: 0, n: 0, b: 0, r: 0, q: 0 };

  try {
    const board = gameInstance.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type !== 'k') {
          const type = piece.type as keyof typeof starting;
          if (piece.color === 'w') {
            currentWhite[type]++;
          } else {
            currentBlack[type]++;
          }
        }
      }
    }
  } catch (e) {
    // Fallback if board() is unavailable
  }

  const capturedWhite: string[] = [];
  const capturedBlack: string[] = [];

  (Object.keys(starting) as Array<keyof typeof starting>).forEach((type) => {
    const diff = starting[type] - currentBlack[type];
    for (let i = 0; i < diff; i++) {
      capturedBlack.push(type);
    }
  });

  (Object.keys(starting) as Array<keyof typeof starting>).forEach((type) => {
    const diff = starting[type] - currentWhite[type];
    for (let i = 0; i < diff; i++) {
      capturedWhite.push(type);
    }
  });

  return { w: capturedWhite, b: capturedBlack };
}

function getScoreDifference(captured: CapturedPieces) {
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  let wScore = 0; // white gets points for capturing black pieces (captured.b)
  let bScore = 0; // black gets points for capturing white pieces (captured.w)

  captured.b.forEach((piece) => {
    wScore += values[piece as keyof typeof values] || 0;
  });
  captured.w.forEach((piece) => {
    bScore += values[piece as keyof typeof values] || 0;
  });

  return {
    whiteLead: wScore > bScore ? wScore - bScore : 0,
    blackLead: bScore > wScore ? bScore - wScore : 0,
  };
}

// ==========================================
// CLIENT-SIDE LOCAL CHESS BOT
// ==========================================
function evaluateBoard(board: any[][]): number {
  let totalEvaluation = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        let value = 0;
        if (piece.type === 'p') value = 100;
        else if (piece.type === 'n') value = 320;
        else if (piece.type === 'b') value = 330;
        else if (piece.type === 'r') value = 500;
        else if (piece.type === 'q') value = 900;
        else if (piece.type === 'k') value = 20000;
        
        let positionalVal = 0;
        // White evaluates from row 7 to 0, Black evaluates row 0 to 7
        const idx = piece.color === 'w' ? (7 - r) * 8 + c : r * 8 + c;
        if (piece.type === 'p') positionalVal = pawnEval[idx] || 0;
        else if (piece.type === 'n') positionalVal = knightEval[idx] || 0;
        else if (piece.type === 'b') positionalVal = bishopEval[idx] || 0;
        else if (piece.type === 'r') positionalVal = rookEval[idx] || 0;
        else if (piece.type === 'q') positionalVal = queenEval[idx] || 0;
        else if (piece.type === 'k') positionalVal = kingEvalActive[idx] || 0;

        const score = value + positionalVal * 10;
        if (piece.color === 'w') {
          totalEvaluation += score;
        } else {
          totalEvaluation -= score;
        }
      }
    }
  }
  return totalEvaluation;
}

function minimax(
  gameInstance: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): number {
  if (depth === 0 || gameInstance.isGameOver()) {
    return evaluateBoard(gameInstance.board());
  }

  const moves = gameInstance.moves({ verbose: true });
  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      gameInstance.move(move);
      const evalValue = minimax(gameInstance, depth - 1, alpha, beta, false);
      gameInstance.undo();
      maxEval = Math.max(maxEval, evalValue);
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      gameInstance.move(move);
      const evalValue = minimax(gameInstance, depth - 1, alpha, beta, true);
      gameInstance.undo();
      minEval = Math.min(minEval, evalValue);
      beta = Math.min(beta, evalValue);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getLocalBestMove(gameInstance: Chess, difficulty: AIDifficulty): any {
  const moves = gameInstance.moves({ verbose: true });
  if (moves.length === 0) {
    console.warn('No legal moves available; game should be over');
    return null;
  }

  // Beginner mode: 60% random / 40% immediate capture
  if (difficulty === 'Beginner') {
    const captures = moves.filter((m) => m.captured);
    if (captures.length > 0 && Math.random() > 0.6) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Intermediate: minimax search depth 1
  // Advanced: minimax search depth 2
  // Grandmaster: minimax search depth 3
  let depth = 1;
  if (difficulty === 'Advanced') depth = 2;
  else if (difficulty === 'Grandmaster') depth = 3;

  const isMaximizing = gameInstance.turn() === 'w';
  let bestMove = moves[0];
  let bestValue = isMaximizing ? -Infinity : Infinity;

  // Randomize evaluation choices by shuffling options
  const shuffledMoves = [...moves].sort(() => Math.random() - 0.5);

  for (const move of shuffledMoves) {
    gameInstance.move(move);
    const val = minimax(gameInstance, depth, -Infinity, Infinity, !isMaximizing);
    gameInstance.undo();

    if (isMaximizing) {
      if (val > bestValue) {
        bestValue = val;
        bestMove = move;
      }
    } else {
      if (val < bestValue) {
        bestValue = val;
        bestMove = move;
      }
    }
  }

  return bestMove;
}


// ==========================================
// CHESSGAME COMPONENT
// ==========================================
export default function ChessGame() {
  const [game, setGame] = useState(() => new Chess());
  const [gameFen, setGameFen] = useState(game.fen());
  const [mode, setMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('Intermediate');
  const [whiteBotDifficulty, setWhiteBotDifficulty] = useState<AIDifficulty>('Intermediate');
  const [blackBotDifficulty, setBlackBotDifficulty] = useState<AIDifficulty>('Advanced');
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w'); 
  const [boardOrientation, setBoardOrientation] = useState<PlayerColor>('w');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Status message
  const [status, setStatus] = useState<string>('Select game type to start');
  
  // Timer States
  const [timerOption, setTimerOption] = useState<number>(0); 
  const [whiteTime, setWhiteTime] = useState<number>(600); 
  const [blackTime, setBlackTime] = useState<number>(600);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // Interactive square highlighted lists
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [optionSquares, setOptionSquares] = useState<any>({});
  const [lastMoveSquares, setLastMoveSquares] = useState<any>({});

  // Computed captured states
  const capturedPieces = getCapturedPieces(game);
  const pointDiff = getScoreDifference(capturedPieces);
  const historyMoves = game.history();

  // Reference for bot timing
  const nextTurnTimer = useRef<NodeJS.Timeout | null>(null);

  // Active Timer Clock ticking handler
  useEffect(() => {
    let clock: any;
    if (isTimerActive && timerOption > 0 && !game.isGameOver()) {
      clock = setInterval(() => {
        if (game.turn() === 'w') {
          setWhiteTime((prev) => {
            if (prev <= 1) {
              setIsTimerActive(false);
              setStatus('Black wins on time!');
              playChessSound('gameover', isMuted);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime((prev) => {
            if (prev <= 1) {
              setIsTimerActive(false);
              setStatus('White wins on time!');
              playChessSound('gameover', isMuted);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(clock);
  }, [isTimerActive, timerOption, gameFen, isMuted]);

  // Handle computer moves (both PvAI and AIvAI modes)
  useEffect(() => {
    if (game.isGameOver()) return;

    const isPvAIBotTurn = mode === 'PvAI' && game.turn() !== playerColor;
    const isAIvAITurn = mode === 'AIvAI';

    if ((isPvAIBotTurn || isAIvAITurn) && !isAiThinking) {
      setIsAiThinking(true);
      const activeColor = game.turn();
      const activeName = activeColor === 'w' ? 'White Bot' : 'Black Bot';
      
      setStatus(`${activeName} is calculating best move...`);

      nextTurnTimer.current = setTimeout(() => {
        const activeDifficulty = mode === 'AIvAI'
          ? (activeColor === 'w' ? whiteBotDifficulty : blackBotDifficulty)
          : difficulty;

        const move = getLocalBestMove(game, activeDifficulty);
        if (move) {
          executeMove(move);
        } else {
          setStatus('No legal moves available—game should be over.');
        }
        setIsAiThinking(false);
      }, mode === 'AIvAI' ? 750 : Math.max(400, Math.min(1000, 1500 - (difficulty === 'Beginner' ? 800 : 0))));
    }
  }, [gameFen, mode, playerColor, difficulty, whiteBotDifficulty, blackBotDifficulty, isAiThinking]);

  // Highlight check and last moves
  useEffect(() => {
    updateSpecialSquareStyles();
  }, [gameFen, selectedSquare, optionSquares]);

  function updateSpecialSquareStyles() {
    const freshStyles: any = { ...optionSquares };

    // 1. Highlight standard selected square
    if (selectedSquare) {
      freshStyles[selectedSquare] = {
        background: 'rgba(99, 102, 241, 0.25)',
      };
    }

    // 2. Highlight king square if checked
    if (game.inCheck()) {
      const board = game.board();
      const turn = game.turn();
      let kingSquare = '';
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.type === 'k' && piece.color === turn) {
            kingSquare = `${String.fromCharCode(97 + c)}${8 - r}`;
            break;
          }
        }
      }
      if (kingSquare) {
        freshStyles[kingSquare] = {
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.7) 40%, #ef4444 100%)',
          borderRadius: '50%',
        };
      }
    }

    // 3. Highlight last move
    const history = game.history({ verbose: true });
    if (history.length > 0) {
      const last = history[history.length - 1];
      freshStyles[last.from] = {
        ...(freshStyles[last.from] || {}),
        background: 'rgba(234, 179, 8, 0.2)',
      };
      freshStyles[last.to] = {
        ...(freshStyles[last.to] || {}),
        background: 'rgba(234, 179, 8, 0.25)',
      };
    }

    setLastMoveSquares(freshStyles);
  }

  function executeMove(moveObj: any) {
    try {
      const isCapture = game.get(moveObj.to)?.color || moveObj.captured;
      const result = game.move(moveObj);
      
      if (result) {
        setGameFen(game.fen());
        
        // Sound effects
        if (game.isGameOver()) {
          playChessSound('gameover', isMuted);
        } else if (game.inCheck()) {
          playChessSound('check', isMuted);
        } else if (isCapture) {
          playChessSound('capture', isMuted);
        } else {
          playChessSound('move', isMuted);
        }

        // Keep local timer active
        if (timerOption > 0 && !isTimerActive) {
          setIsTimerActive(true);
        }

        // Update turn strings
        if (game.isGameOver()) {
          setIsTimerActive(false);
          if (game.isCheckmate()) {
            const winner = game.turn() === 'w' ? 'Black' : 'White';
            setStatus(`Checkmate! ${winner} wins the matches.`);
          } else if (game.isDraw()) {
            setStatus('Draw by stalemate, agreement, or repeat moves!');
          } else {
            setStatus('Draw game.');
          }
        } else {
          setStatus(game.turn() === 'w' ? "White's turn" : "Black's turn");
        }

        return result;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function getMoveOptions(square: string) {
    const moves = game.moves({
      square: square as any,
      verbose: true
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: any = {};
    moves.forEach((move) => {
      const targetPiece = game.get(move.to as any);
      const isCap = targetPiece && targetPiece.color !== game.get(square as any)?.color;
      newSquares[move.to] = {
        background: isCap
          ? 'radial-gradient(circle, rgba(239, 68, 68, 0.5) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(99, 102, 241, 0.45) 25%, transparent 25%)',
        borderRadius: '50%',
        cursor: 'pointer'
      };
    });
    
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square: string) {
    if (game.isGameOver() || isAiThinking) return;

    // Make move click-to-move trigger
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setOptionSquares({});
        return;
      }

      const moveApplied = executeMove({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });

      if (moveApplied) {
        setSelectedSquare(null);
        setOptionSquares({});
        return;
      }
    }

    // Set selection
    const piece = game.get(square as any);
    if (piece && piece.color === game.turn()) {
      if (mode === 'PvAI' && game.turn() !== playerColor) return;
      
      setSelectedSquare(square);
      getMoveOptions(square);
    } else {
      setSelectedSquare(null);
      setOptionSquares({});
    }
  }

  function onPieceDrop(sourceSquare: string, targetSquare: string) {
    if (game.isGameOver() || isAiThinking) return false;
    if (mode === 'PvAI' && game.turn() !== playerColor) return false;

    const moveApplied = executeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (moveApplied) {
      setSelectedSquare(null);
      setOptionSquares({});
      return true;
    }
    return false;
  }

  function startNewGame(selectedMode: GameMode) {
    if (nextTurnTimer.current) {
      clearTimeout(nextTurnTimer.current);
    }
    const newBoard = new Chess();
    setGame(newBoard);
    setGameFen(newBoard.fen());
    setMode(selectedMode);
    setOptionSquares({});
    setSelectedSquare(null);
    setIsAiThinking(false);

    // Color assignment
    setBoardOrientation(playerColor);

    // Initial timer setup
    if (timerOption > 0) {
      setWhiteTime(timerOption);
      setBlackTime(timerOption);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
    }

    setStatus(newBoard.turn() === 'w' ? "White's turn" : "Black's turn");
    playChessSound('move', isMuted);
  }

  function handleUndo() {
    if (isAiThinking || game.history().length === 0) return;
    
    if (mode === 'PvAI') {
      if (game.history().length >= 2) {
        game.undo();
        game.undo();
      } else {
        game.undo();
      }
    } else {
      game.undo();
    }
    
    setGameFen(game.fen());
    setSelectedSquare(null);
    setOptionSquares({});
    setStatus(game.turn() === 'w' ? "White's turn" : "Black's turn");
    playChessSound('move', isMuted);
  }

  function toggleMute() {
    setIsMuted(!isMuted);
  }

  function flipBoard() {
    setBoardOrientation((prev) => (prev === 'w' ? 'b' : 'w'));
  }

  function resetToMenu() {
    if (nextTurnTimer.current) {
      clearTimeout(nextTurnTimer.current);
    }
    setMode(null);
    setIsTimerActive(false);
    setStatus('Select game type to start');
  }

  // Format seconds to digital minutes:seconds
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const isMyTurn = mode === 'PvP_LOCAL' || (mode === 'PvAI' && game.turn() === playerColor);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 md:p-8 font-sans">
      
      {/* HEADER SECTION */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-6 md:mb-8 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-2.5 rounded-xl">
            <Sword className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white leading-none">Remix Arena</h1>
            <p className="text-xs text-slate-400 mt-0.5">High Performance Engine Board</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Toggle game sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          {mode && (
            <button 
              onClick={resetToMenu}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Menu
            </button>
          )}
        </div>
      </header>

      {/* BODY CONFIGURATOR & PLAYGROUND */}
      <AnimatePresence mode="wait">
        {!mode ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-2xl bg-slate-900/30 border border-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center"
          >
            <div className="mb-6 text-center">
              <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-5 rounded-3xl inline-block mb-3 border border-indigo-500/15">
                <Trophy className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white font-display">Chess Mode Selection</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">Enjoy zero-AI lag, precise moves, and tactical computer bot difficulty levels.</p>
            </div>

            {/* PRE-CONFS */}
            <div className="w-full bg-slate-950/60 rounded-2xl p-4 md:p-5 border border-slate-900 space-y-4 mb-6">
              
              {/* Bot Color and Bot difficulty panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Play Style Color */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">My Play Color (Human vs Bot)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { setPlayerColor('w'); setBoardOrientation('w'); }}
                      className={`text-xs font-semibold py-2 rounded-xl transition-all border cursor-pointer ${
                        playerColor === 'w' 
                          ? 'bg-slate-100 border-white text-slate-950 shadow-md' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      White pieces
                    </button>
                    <button 
                      onClick={() => { setPlayerColor('b'); setBoardOrientation('b'); }}
                      className={`text-xs font-semibold py-2 rounded-xl transition-all border cursor-pointer ${
                        playerColor === 'b' 
                          ? 'bg-slate-900 border-indigo-500 text-white shadow-md' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      Black pieces
                    </button>
                  </div>
                </div>

                {/* 2. Timer Control */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-indigo-400" />
                    Timer Options
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { l: 'Off', v: 0 },
                      { l: '5m', v: 300 },
                      { l: '10m', v: 600 },
                      { l: '30m', v: 1800 }
                    ].map((opt) => (
                      <button 
                        key={opt.v}
                        onClick={() => setTimerOption(opt.v)}
                        className={`text-xs py-2 rounded-lg transition-all border cursor-pointer ${
                          timerOption === opt.v
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* DUAL DIFFICULTY PANELS */}
              <div className="border-t border-slate-950 pt-3.5 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 3. Human vs Bot Difficulty */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-400">Human vs Bot Difficulty</label>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {(['Beginner', 'Intermediate', 'Advanced', 'Grandmaster'] as AIDifficulty[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`text-[10px] py-1.5 rounded-lg border transition-all cursor-pointer ${
                          difficulty === d 
                            ? 'bg-indigo-600 border-indigo-500 text-white font-semibold' 
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Bot vs Bot Setup */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center h-4">
                    <label className="text-xs font-semibold text-slate-400">Bot Matchup Simulator levels</label>
                  </div>
                  
                  <div className="space-y-1">
                    {/* White Bot */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 font-medium font-mono">White Bot</span>
                      <div className="grid grid-cols-4 gap-1 flex-1 max-w-[190px]">
                        {(['Beginner', 'Intermediate', 'Advanced', 'Grandmaster'] as AIDifficulty[]).map((d) => (
                          <button
                            key={d}
                            onClick={() => setWhiteBotDifficulty(d)}
                            className={`text-[9px] py-1 transition-all cursor-pointer rounded border ${
                              whiteBotDifficulty === d
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                                : 'bg-slate-900 border-slate-900 text-slate-500 hover:text-slate-400'
                            }`}
                          >
                            {d[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Black Bot */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 font-medium font-mono">Black Bot</span>
                      <div className="grid grid-cols-4 gap-1 flex-1 max-w-[190px]">
                        {(['Beginner', 'Intermediate', 'Advanced', 'Grandmaster'] as AIDifficulty[]).map((d) => (
                          <button
                            key={d}
                            onClick={() => setBlackBotDifficulty(d)}
                            className={`text-[9px] py-1 transition-all cursor-pointer rounded border ${
                              blackBotDifficulty === d
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                                : 'bg-slate-900 border-slate-900 text-slate-500 hover:text-slate-400'
                            }`}
                          >
                            {d[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Mode selection cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <button
                onClick={() => startNewGame('PvP_LOCAL')}
                className="group bg-slate-900/40 hover:bg-slate-900/90 border border-slate-900 hover:border-indigo-500/40 rounded-2xl p-5 text-left transition-all hover:shadow-xl hover:shadow-indigo-500/5 active:scale-98"
              >
                <div className="bg-indigo-600/10 group-hover:bg-indigo-600 border border-slate-800 group-hover:border-indigo-500 w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 transition-all">
                  <Users className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-0.5">Local Pass & Play</h3>
                <p className="text-xs text-slate-400 leading-normal">Take turns on the same screen. Ideal for physical sparring partner.</p>
              </button>

              <button
                onClick={() => startNewGame('PvAI')}
                className="group bg-slate-900/40 hover:bg-slate-900/90 border border-slate-900 hover:border-indigo-500/40 rounded-2xl p-5 text-left transition-all hover:shadow-xl hover:shadow-indigo-500/5 active:scale-98"
              >
                <div className="bg-indigo-600/10 group-hover:bg-indigo-600 border border-slate-800 group-hover:border-indigo-500 w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 transition-all">
                  <Bot className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-0.5">Human vs Bot</h3>
                <p className="text-xs text-slate-400 leading-normal">Play vs classic offline positional algorithmic micro-bot engine.</p>
              </button>

              <button
                onClick={() => startNewGame('AIvAI')}
                className="group bg-slate-900/40 hover:bg-slate-900/90 border border-slate-900 hover:border-indigo-500/40 rounded-2xl p-5 text-left transition-all hover:shadow-xl hover:shadow-indigo-500/5 active:scale-98"
              >
                <div className="bg-indigo-600/10 group-hover:bg-indigo-600 border border-slate-800 group-hover:border-indigo-500 w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 transition-all">
                  <RefreshCw className="w-5 h-5 text-indigo-400 group-hover:text-white animate-spin-slow" />
                </div>
                <h3 className="text-base font-bold text-white mb-0.5">Bot vs Bot</h3>
                <p className="text-xs text-slate-400 leading-normal">Watch two offline positional engines battle each other in real-time.</p>
              </button>
            </div>

          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-stretch justify-start"
          >
            
            {/* COLUMN 1: INTERACTIVE STATS & CONTROLS */}
            <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0">
              
              {/* CURRENT CONFIG INFO */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-3.5 uppercase tracking-wider">
                  <Sliders className="w-4 h-4" />
                  Match Conf
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">Game Type</span>
                    <span className="text-slate-300 font-medium">{mode === 'PvP_LOCAL' ? 'Pass & Play' : mode === 'AIvAI' ? 'Bot vs Bot Duel' : 'Vs Engine Bot'}</span>
                  </div>
                  
                  {mode === 'PvAI' && (
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">Bot Level</span>
                      <span className="text-slate-300 font-medium flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-yellow-500" />
                        {difficulty}
                      </span>
                    </div>
                  )}

                  {mode === 'AIvAI' && (
                    <>
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-400">White Bot Level</span>
                        <span className="text-indigo-400 font-semibold">{whiteBotDifficulty}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-400">Black Bot Level</span>
                        <span className="text-indigo-400 font-semibold">{blackBotDifficulty}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">Game clock</span>
                    <span className="text-slate-300 font-medium">
                      {timerOption > 0 ? `${timerOption / 60} Min Match` : 'Practice (No Limit)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button 
                    onClick={handleUndo}
                    disabled={isAiThinking || historyMoves.length === 0}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl py-2 transition-all cursor-pointer"
                    title="Undo last move"
                  >
                    <Undo className="w-3.5 h-3.5" />
                    Take Back
                  </button>
                  <button 
                    onClick={flipBoard}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl py-2 transition-all cursor-pointer"
                    title="Flip orientations of the board"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Flip View
                  </button>
                </div>
              </div>

              {/* CAPTURED BANNER & DIFFERENCE */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Captures Differential</span>
                  <span className="text-[10px] font-mono text-slate-500">point value</span>
                </div>

                {/* Captured White pieces (shown for Black) */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-900">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-medium">Captured White</span>
                    <div className="flex flex-wrap gap-0.5 min-h-[1.5rem] items-center">
                      {capturedPieces.w.length > 0 ? (
                        capturedPieces.w.map((p, idx) => (
                          <span key={idx} className="text-indigo-400 text-lg leading-none" title="White piece captured">
                            {PIECE_UNICHAR[p]}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-600 font-mono">—</span>
                      )}
                    </div>
                  </div>
                  {pointDiff.blackLead > 0 && (
                    <span className="text-xs bg-red-600/15 border border-red-500/25 text-red-400 font-mono px-1.5 py-0.5 rounded font-bold">
                      +{pointDiff.blackLead}
                    </span>
                  )}
                </div>

                {/* Captured Black pieces (shown for White) */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-900">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-medium">Captured Black</span>
                    <div className="flex flex-wrap gap-0.5 min-h-[1.5rem] items-center">
                      {capturedPieces.b.length > 0 ? (
                        capturedPieces.b.map((p, idx) => (
                          <span key={idx} className="text-slate-100 text-lg leading-none" title="Black piece captured">
                            {PIECE_UNICHAR[p]}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-600 font-mono">—</span>
                      )}
                    </div>
                  </div>
                  {pointDiff.whiteLead > 0 && (
                    <span className="text-xs bg-green-600/15 border border-green-500/25 text-green-400 font-mono px-1.5 py-0.5 rounded font-bold">
                      +{pointDiff.whiteLead}
                    </span>
                  )}
                </div>
              </div>

              {/* CONTROL TERMINATE RESET */}
              <div className="mt-auto">
                <button 
                  onClick={() => startNewGame(mode!)}
                  className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl py-3 text-xs font-semibold shadow-md active:scale-98 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  Restart Fresh Match
                </button>
              </div>

            </div>

            {/* COLUMN 2: BOARD ZONE */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/10 border border-slate-900 rounded-3xl p-4 md:p-6 shadow-indigo-950/20 shadow-xl">
              
              {/* STATUS BAR ZONE */}
              <div className="w-full max-w-[480px] md:max-w-[560px] flex items-center justify-between mb-4 px-1">
                
                {/* Status state label */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    game.isGameOver() 
                      ? 'bg-rose-500 animate-pulse' 
                      : isAiThinking 
                        ? 'bg-amber-500 animate-spin border-dash border-t-transparent' 
                        : game.turn() === 'w' 
                          ? 'bg-slate-100' 
                          : 'bg-indigo-500'
                  }`} />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block leading-none mb-0.5">Game Phase</span>
                    <span className={`text-xs font-medium ${game.isGameOver() ? 'text-red-400 font-semibold' : 'text-slate-300'}`}>
                      {isAiThinking ? 'Bot is computing moves...' : status}
                    </span>
                  </div>
                </div>

                {/* Checked alerts banner */}
                {game.inCheck() && !game.isGameOver() && (
                  <span className="bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-[10px] px-2 py-0.5 rounded-lg animate-pulse uppercase tracking-wide">
                    ⚠️ King Checked
                  </span>
                )}
              </div>

              {/* BLACK ACTIVE TIMER BAR */}
              <div className="w-full max-w-[480px] md:max-w-[560px] py-2 px-3 border border-slate-900/40 bg-slate-950/30 rounded-t-xl flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <div className="w-4 h-4 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400">B</div>
                  <span className="text-slate-300 font-semibold">
                    {mode === 'PvAI' && playerColor === 'w' ? 'Opponent Engine' : 'Black Player'}
                  </span>
                </div>
                {timerOption > 0 && (
                  <div className={`font-mono text-sm px-2.5 py-0.5 rounded-md ${
                    game.turn() === 'b' && !game.isGameOver() 
                      ? 'bg-indigo-600/30 border border-indigo-500 text-indigo-200 animate-pulse font-semibold' 
                      : 'bg-slate-900 border border-slate-800 text-slate-500'
                  }`}>
                    {formatTime(blackTime)}
                  </div>
                )}
              </div>

              {/* PHYSICAL CHESSBOARD IN CONTAINER */}
              <div className="w-full max-w-[480px] md:max-w-[560px] aspect-square rounded-b-xl overflow-hidden shadow-2xl relative border-x-4 border-b-4 border-slate-900">
                <Chessboard 
                  options={{
                    position: gameFen,
                    onPieceDrop: ({ sourceSquare, targetSquare }) => onPieceDrop(sourceSquare, targetSquare),
                    onSquareClick: ({ square }) => onSquareClick(square),
                    boardOrientation: boardOrientation === 'w' ? 'white' : 'black',
                    darkSquareStyle: { backgroundColor: '#1e293b' },
                    lightSquareStyle: { backgroundColor: '#475569' },
                    squareStyles: lastMoveSquares,
                    allowDragging: isMyTurn && !game.isGameOver(),
                  }}
                />

                {/* AI Loading overlays */}
                {isAiThinking && (
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-2xl">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                      <span className="text-xs font-medium text-slate-300">Bot is calculating...</span>
                    </div>
                  </div>
                )}

                {/* Game over modal triggers overlay */}
                {game.isGameOver() && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-slate-905 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center max-w-sm"
                    >
                      <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                      <h3 className="text-2xl font-bold font-display text-white">Match Concluded</h3>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                        {game.isCheckmate() 
                          ? `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins standard chess protocol.` 
                          : 'Draw game state reached (stalemate / agreement).'}
                      </p>
                      
                      <button 
                        onClick={() => startNewGame(mode!)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-6 rounded-xl mt-5 shadow-lg shadow-indigo-500/10 cursor-pointer"
                      >
                        Play Again
                      </button>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* WHITE ACTIVE TIMER BAR */}
              <div className="w-full max-w-[480px] md:max-w-[560px] py-2 px-3 border border-slate-900/40 bg-slate-950/30 rounded-t-none rounded-b-xl flex justify-between items-center text-xs mt-px">
                <div className="flex items-center gap-1.5 font-medium">
                  <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-900 font-bold">W</div>
                  <span className="text-slate-300 font-semibold">
                    {mode === 'PvAI' && playerColor === 'b' ? 'Opponent Engine' : 'White Player'}
                  </span>
                </div>
                {timerOption > 0 && (
                  <div className={`font-mono text-sm px-2.5 py-0.5 rounded-md ${
                    game.turn() === 'w' && !game.isGameOver() 
                      ? 'bg-indigo-600/30 border border-indigo-500 text-indigo-200 animate-pulse font-semibold' 
                      : 'bg-slate-900 border border-slate-800 text-slate-500'
                  }`}>
                    {formatTime(whiteTime)}
                  </div>
                )}
              </div>

            </div>

            {/* COLUMN 3: HISTORIC SCROLL LIST */}
            <div className="w-full lg:w-64 bg-slate-900/20 border border-slate-900 rounded-3xl p-5 flex flex-col items-stretch shrink-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3.5">Algebraic History</span>
              
              <div className="flex-1 min-h-[160px] lg:min-h-0 overflow-y-auto max-h-[300px] lg:max-h-none pr-1 space-y-1 bg-slate-950/40 rounded-xl p-3 border border-slate-900/60 font-mono text-xs">
                {historyMoves.length === 0 ? (
                  <div className="text-slate-600 italic text-center text-[11px] py-12">No moves logged yet</div>
                ) : (
                  Array.from({ length: Math.ceil(historyMoves.length / 2) }).map((_, i) => (
                    <div key={i} className="flex justify-between py-1 px-1.5 hover:bg-slate-900/40 rounded gap-1 transition-all">
                      <span className="text-slate-500 text-[11px]">{i + 1}.</span>
                      <span className="text-slate-300 font-semibold flex-1 ml-3 text-left">
                        {historyMoves[i * 2]}
                      </span>
                      <span className="text-slate-400 flex-1 text-left">
                        {historyMoves[i * 2 + 1] || ""}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* EXPLANATORY CHEAT-SHEET DESCR */}
              <div className="mt-4 p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wide block mb-1">Interactive Tips</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  - Highlighted circles show legal target options.<br />
                  - Red rings mean valid capture targets.<br />
                  - Yellow highlight traces the last turn move.
                </p>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
