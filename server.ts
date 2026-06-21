/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = process.cwd();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function getGeminiMove(history: string, difficulty: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  if (!history || typeof history !== 'string') {
    throw new Error('Invalid game history provided');
  }
  
  const model = ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `You are a chess engine playing at a ${difficulty} difficulty level.
The current game history in PGN or SAN is: ${history}.
Please suggest the next move for the current player in SAN (Standard Algebraic Notation), e.g., "e4", "Nf3", "O-O".
Only return the move itself as a single string, nothing else. No explanation.`,
  });

  const response = await model;
  return response.text.trim();
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
    },
  });

  app.use(express.json());

  // API for AI moves
  app.post('/api/ai/move', async (req, res) => {
    try {
      const { history, difficulty } = req.body;
      const move = await getGeminiMove(history, difficulty);
      res.json({ move });
    } catch (error: any) {
      console.error('Gemini error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Socket.io for Multiplayer
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    let currentRoom: string | null = null;

    socket.on('join-room', (roomId: string) => {
      if (!roomId || typeof roomId !== 'string') {
        socket.emit('error', 'Invalid room ID');
        return;
      }
      socket.join(roomId);
      currentRoom = roomId;
      console.log(`User ${socket.id} joined room ${roomId}`);
      
      const clients = io.sockets.adapter.rooms.get(roomId);
      const numClients = clients ? clients.size : 0;
      
      // Notify the player which color they are (first to join is white, second is black)
      socket.emit('player-assignment', numClients === 1 ? 'w' : 'b');
      
      if (numClients === 2) {
        io.to(roomId).emit('game-ready');
      }
    });

    socket.on('move', (data: any) => {
      const { roomId, move } = data;
      if (!roomId || typeof roomId !== 'string' || !move) {
        console.warn('Invalid move data received');
        return;
      }
      socket.to(roomId).emit('move', move);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (currentRoom) {
        socket.leaveAll();
      }
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
