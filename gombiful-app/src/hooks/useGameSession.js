import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GAME_STATUS, GAME_CONFIG } from '../utils/constants';
import { generatePlayerId, drawRandomSong, shuffleArray } from '../utils/gameUtils';

/**
 * Custom hook for managing multiplayer game session
 * @param {string} roomCode - Room code for the game
 * @param {string} role - 'dj' or 'player'
 * @param {string} playerId - Unique player ID
 * @returns {Object} - Game state and actions
 */
export function useGameSession(roomCode, role, playerId) {
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to real-time game updates
  useEffect(() => {
    if (!roomCode) {
      setIsLoading(false);
      return;
    }

    const gameRef = doc(db, 'games', roomCode);
    
    const unsubscribe = onSnapshot(
      gameRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setGameState({ id: docSnap.id, ...docSnap.data() });
          setError(null);
        } else {
          setGameState(null);
          setError('Game not found');
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Error listening to game:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  // Heartbeat - update lastSeen timestamp every 10 seconds
  useEffect(() => {
    if (!roomCode || !playerId || !gameState) return;

    const updateHeartbeat = async () => {
      try {
        const gameRef = doc(db, 'games', roomCode);
        
        // Only update if player exists in the game
        if (gameState.players?.[playerId]) {
          await updateDoc(gameRef, {
            [`players.${playerId}.lastSeen`]: Date.now()
          });
        }
      } catch (err) {
        console.error('Error updating heartbeat:', err);
      }
    };

    // Update immediately
    updateHeartbeat();

    // Then update every 10 seconds
    const interval = setInterval(updateHeartbeat, 10000);

    return () => clearInterval(interval);
  }, [roomCode, playerId, gameState]);

  // Create new game (DJ only)
  const createGame = useCallback(async (roomCode, djName, songList) => {
    try {
      console.log('[CREATE] Creating game with roomCode:', roomCode);
      const gameRef = doc(db, 'games', roomCode);
      
      // Shuffle songs
      const shuffledSongs = shuffleArray(songList);
      
      // ALL players get the SAME starting song for fairness
      const sharedInitialSong = shuffledSongs[0];
      const availableSongs = shuffledSongs.slice(1);

      const gameData = {
        roomCode,
        status: GAME_STATUS.LOBBY,
        djId: playerId,
        djName: djName || 'DJ',
        currentSongId: null,
        currentSong: null,
        currentRound: 0,
        availableSongs: availableSongs,
        sharedInitialSong: sharedInitialSong, // Same starting song for all players
        createdAt: Date.now(),
        startedAt: null,
        endedAt: null,
        players: {}
      };

      await setDoc(gameRef, gameData);
      console.log('[CREATE] Game created successfully:', roomCode);
      return { success: true, roomCode };
    } catch (err) {
      console.error('[CREATE] Error creating game:', err);
      return { success: false, error: err.message };
    }
  }, [playerId]);

  // Join game (Player only)
  const joinGame = useCallback(async (playerName, targetRoomCode) => {
    const codeToUse = targetRoomCode || roomCode;
    console.log('[JOIN] Attempting to join game:', { targetRoomCode, roomCode, codeToUse, playerId });
    
    if (!codeToUse || !playerId) return { success: false, error: 'Missing room code or player ID' };

    try {
      const gameRef = doc(db, 'games', codeToUse);
      console.log('[JOIN] Fetching game document:', codeToUse);
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) {
        console.log('[JOIN] Game not found:', codeToUse);
        return { success: false, error: 'Game not found' };
      }
      
      console.log('[JOIN] Game found:', gameSnap.data());

      const game = gameSnap.data();

      // Allow joining during lobby or active game (but not ended games)
      if (game.status === GAME_STATUS.ENDED) {
        return { success: false, error: 'Game has ended' };
      }

      // Check if player already exists (reconnecting)
      const existingPlayer = game.players?.[playerId];
      if (existingPlayer) {
        // Player is reconnecting - just refresh their connection
        console.log('Player reconnecting:', playerId);
        return { success: true, reconnected: true };
      }

      const playerCount = Object.keys(game.players || {}).length;
      if (playerCount >= GAME_CONFIG.MAX_PLAYERS) {
        return { success: false, error: 'Game is full' };
      }

      // ALL players get the SAME starting song for fairness
      const initialSong = game.sharedInitialSong;

      // Check if joining mid-game
      const isLateJoin = game.status !== GAME_STATUS.LOBBY;

      const playerData = {
        name: playerName,
        timeline: [initialSong],
        score: 1,
        tokens: GAME_CONFIG.INITIAL_TOKENS,
        correctStreak: 0,
        hasAnswered: false,
        placementIndex: null,
        joinedAt: Date.now(),
        joinedLate: isLateJoin,  // Flag to indicate mid-game join
        lastSeen: Date.now()  // Presence tracking
      };

      await updateDoc(gameRef, {
        [`players.${playerId}`]: playerData
      });

      return { success: true };
    } catch (err) {
      console.error('Error joining game:', err);
      return { success: false, error: err.message };
    }
  }, [roomCode, playerId]);

  // Leave game
  const leaveGame = useCallback(async () => {
    if (!roomCode || !playerId) return;

    try {
      const gameRef = doc(db, 'games', roomCode);
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) return;

      const game = gameSnap.data();

      // If DJ leaves, delete the game
      if (playerId === game.djId) {
        await deleteDoc(gameRef);
        return;
      }

      // If player leaves, remove them
      const updatedPlayers = { ...game.players };
      delete updatedPlayers[playerId];

      await updateDoc(gameRef, {
        players: updatedPlayers
      });
    } catch (err) {
      console.error('Error leaving game:', err);
    }
  }, [roomCode, playerId]);

  // Start game (DJ only)
  const startGame = useCallback(async () => {
    if (!roomCode || role !== 'dj') return { success: false, error: 'Only DJ can start' };

    try {
      const gameRef = doc(db, 'games', roomCode);
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) {
        return { success: false, error: 'Game not found' };
      }

      const game = gameSnap.data();
      const playerCount = Object.keys(game.players || {}).length;

      if (playerCount < GAME_CONFIG.MIN_PLAYERS) {
        return { success: false, error: `Need at least ${GAME_CONFIG.MIN_PLAYERS} players` };
      }

      // Draw first song
      const { song, remainingSongs } = drawRandomSong(game.availableSongs);

      await updateDoc(gameRef, {
        status: GAME_STATUS.PLAYING,
        startedAt: Date.now(),
        currentSong: song,
        currentSongId: song?.id,
        currentRound: 1,
        availableSongs: remainingSongs
      });

      return { success: true };
    } catch (err) {
      console.error('Error starting game:', err);
      return { success: false, error: err.message };
    }
  }, [roomCode, role]);

  // Submit answer (Player only)
  const submitAnswer = useCallback(async (placementIndex) => {
    if (!roomCode || !playerId || role !== 'player') return { success: false };

    try {
      const gameRef = doc(db, 'games', roomCode);

      await updateDoc(gameRef, {
        [`players.${playerId}.hasAnswered`]: true,
        [`players.${playerId}.placementIndex`]: placementIndex
      });

      return { success: true };
    } catch (err) {
      console.error('Error submitting answer:', err);
      return { success: false, error: err.message };
    }
  }, [roomCode, playerId, role]);

  // Use token to skip (Player only)
  const useTokenSkip = useCallback(async () => {
    if (!roomCode || !playerId || role !== 'player') return { success: false };

    try {
      const gameRef = doc(db, 'games', roomCode);
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) return { success: false };

      const game = gameSnap.data();
      const player = game.players[playerId];

      if (player.tokens < GAME_CONFIG.TOKEN_COST_SKIP) {
        return { success: false, error: 'Not enough tokens' };
      }

      await updateDoc(gameRef, {
        [`players.${playerId}.tokens`]: player.tokens - GAME_CONFIG.TOKEN_COST_SKIP,
        [`players.${playerId}.hasAnswered`]: true,
        [`players.${playerId}.placementIndex`]: -1 // -1 means skipped
      });

      return { success: true };
    } catch (err) {
      console.error('Error using token:', err);
      return { success: false, error: err.message };
    }
  }, [roomCode, playerId, role]);

  // Reveal results (DJ only) - Show correct/incorrect feedback before moving to next round
  const revealResults = useCallback(async (validationResults) => {
    if (!roomCode || role !== 'dj') return { success: false };

    try {
      const gameRef = doc(db, 'games', roomCode);
      
      // Store validation results so players can see if they were correct
      await updateDoc(gameRef, {
        status: GAME_STATUS.REVEALING,
        revealData: {
          results: validationResults,
          revealedAt: Date.now()
        }
      });

      return { success: true };
    } catch (err) {
      console.error('Error revealing results:', err);
      return { success: false, error: err.message };
    }
  }, [roomCode, role]);

  // Next round (DJ only)
  const nextRound = useCallback(async (validationResults) => {
    if (!roomCode || role !== 'dj') return { success: false };

    try {
      const gameRef = doc(db, 'games', roomCode);
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) return { success: false };

      const game = gameSnap.data();
      const updatedPlayers = { ...game.players };

      // Update each player based on validation
      Object.entries(validationResults).forEach(([pId, result]) => {
        if (!updatedPlayers[pId]) return;

        updatedPlayers[pId].hasAnswered = false;
        updatedPlayers[pId].placementIndex = null;

        if (result.correct) {
          // Update timeline
          updatedPlayers[pId].timeline = result.newTimeline;
          updatedPlayers[pId].score = result.newTimeline.length;

          // Update streak and tokens
          const newStreak = updatedPlayers[pId].correctStreak + 1;
          if (newStreak >= GAME_CONFIG.STREAK_FOR_TOKEN && updatedPlayers[pId].tokens < GAME_CONFIG.MAX_TOKENS) {
            updatedPlayers[pId].tokens += 1;
            updatedPlayers[pId].correctStreak = 0;
          } else {
            updatedPlayers[pId].correctStreak = newStreak;
          }
        } else {
          // Reset streak on wrong answer
          updatedPlayers[pId].correctStreak = 0;
        }
      });

      // Check for winner
      const winner = Object.entries(updatedPlayers).find(
        ([, player]) => player.score >= GAME_CONFIG.WINNING_SCORE
      );

      if (winner) {
        await updateDoc(gameRef, {
          status: GAME_STATUS.ENDED,
          endedAt: Date.now(),
          winner: { id: winner[0], ...winner[1] },
          players: updatedPlayers
        });
        return { success: true, gameEnded: true, winner: winner[1] };
      }

      // Draw next song
      const { song, remainingSongs } = drawRandomSong(game.availableSongs);

      await updateDoc(gameRef, {
        status: GAME_STATUS.PLAYING,
        currentSong: song,
        currentSongId: song?.id,
        currentRound: game.currentRound + 1,
        availableSongs: remainingSongs,
        players: updatedPlayers,
        revealData: null // Clear reveal data for next round
      });

      return { success: true, gameEnded: false };
    } catch (err) {
      console.error('Error next round:', err);
      return { success: false, error: err.message };
    }
  }, [roomCode, role]);

  // Skip song (DJ only) - Skip current song without scoring
  const skipSong = useCallback(async () => {
    if (!roomCode || role !== 'dj') return { success: false };

    try {
      const gameRef = doc(db, 'games', roomCode);
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) return { success: false };

      const game = gameSnap.data();
      const updatedPlayers = { ...game.players };

      // Reset all players' answers without scoring
      Object.keys(updatedPlayers).forEach((pId) => {
        updatedPlayers[pId].hasAnswered = false;
        updatedPlayers[pId].placementIndex = null;
      });

      // Draw next song
      const { song, remainingSongs } = drawRandomSong(game.availableSongs);

      await updateDoc(gameRef, {
        currentSong: song,
        currentSongId: song?.id,
        currentRound: game.currentRound + 1,
        availableSongs: remainingSongs,
        players: updatedPlayers,
        revealData: null
      });

      return { success: true };
    } catch (err) {
      console.error('Error skipping song:', err);
      return { success: false, error: err.message };
    }
  }, [roomCode, role]);

  // End game (DJ only)
  const endGame = useCallback(async () => {
    if (!roomCode || role !== 'dj') return { success: false };

    try {
      const gameRef = doc(db, 'games', roomCode);
      await updateDoc(gameRef, {
        status: GAME_STATUS.ENDED,
        endedAt: Date.now()
      });
      return { success: true };
    } catch (err) {
      console.error('Error ending game:', err);
      return { success: false, error: err.message };
    }
  }, [roomCode, role]);

  return {
    gameState,
    isLoading,
    error,
    // Actions
    createGame,
    joinGame,
    leaveGame,
    startGame,
    submitAnswer,
    useTokenSkip,
    revealResults,
    nextRound,
    skipSong,
    endGame
  };
}

export default useGameSession;
