// Game utility functions for multiplayer mode

/**
 * Generate a unique 8-character room code
 * Format: XXXX-XXXX (e.g., "ABCD-1234")
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, I, 1)
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'; // Add dash in middle
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Validate room code format
 * @param {string} code - Room code to validate
 * @returns {boolean} - True if valid format
 */
export function validateRoomCodeFormat(code) {
  if (!code || typeof code !== 'string') return false;
  
  // Remove any spaces and convert to uppercase
  const cleanCode = code.trim().toUpperCase();
  
  // Check format: XXXX-XXXX or XXXXXXXX (8 chars)
  const regex = /^[A-Z0-9]{4}-?[A-Z0-9]{4}$/;
  return regex.test(cleanCode);
}

/**
 * Normalize room code (remove spaces, add dash, uppercase)
 * @param {string} code - Room code to normalize
 * @returns {string} - Normalized code
 */
export function normalizeRoomCode(code) {
  if (!code) return '';
  
  const clean = code.replace(/[\s-]/g, '').toUpperCase();
  if (clean.length === 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return clean;
}

/**
 * Validate if a song placement is correct on the timeline
 * @param {Array} timeline - Player's current timeline
 * @param {Object} newSong - Song to place
 * @param {number} placementIndex - Index where player wants to place the song
 * @returns {Object} - { correct: boolean, message: string }
 */
export function validatePlacement(timeline, newSong, placementIndex) {
  if (!timeline || !newSong || placementIndex === null) {
    return { correct: false, message: 'Invalid placement data' };
  }

  // Check if placement is in valid range
  if (placementIndex < 0 || placementIndex > timeline.length) {
    return { correct: false, message: 'Invalid placement position' };
  }

  // Check previous song (if exists)
  if (placementIndex > 0) {
    const prevSong = timeline[placementIndex - 1];
    if (newSong.year < prevSong.year) {
      return {
        correct: false,
        message: `Song is from ${newSong.year}, but previous card is ${prevSong.year}`
      };
    }
  }

  // Check next song (if exists)
  if (placementIndex < timeline.length) {
    const nextSong = timeline[placementIndex];
    if (newSong.year > nextSong.year) {
      return {
        correct: false,
        message: `Song is from ${newSong.year}, but next card is ${nextSong.year}`
      };
    }
  }

  return { correct: true, message: 'Correct placement!' };
}

/**
 * Insert song into timeline at correct position
 * @param {Array} timeline - Current timeline
 * @param {Object} song - Song to insert
 * @param {number} index - Index to insert at
 * @returns {Array} - New timeline with song inserted
 */
export function insertSongInTimeline(timeline, song, index) {
  const newTimeline = [...timeline];
  newTimeline.splice(index, 0, song);
  return newTimeline;
}

/**
 * Calculate tokens earned from correct streak
 * @param {number} correctStreak - Current correct streak
 * @param {number} currentTokens - Current token count
 * @returns {Object} - { newStreak, newTokens, earnedToken }
 */
export function calculateTokens(correctStreak, currentTokens) {
  const newStreak = correctStreak + 1;
  let earnedToken = false;
  let newTokens = currentTokens;

  // Every 3 correct answers = +1 token (max 4 tokens)
  if (newStreak >= 3 && currentTokens < 4) {
    newTokens += 1;
    earnedToken = true;
    return { newStreak: 0, newTokens, earnedToken }; // Reset streak
  }

  return { newStreak, newTokens, earnedToken };
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled copy of array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random song from available songs
 * @param {Array} availableSongs - Array of available songs
 * @returns {Object} - { song, remainingSongs }
 */
export function drawRandomSong(availableSongs) {
  if (!availableSongs || availableSongs.length === 0) {
    return { song: null, remainingSongs: [] };
  }

  const randomIndex = Math.floor(Math.random() * availableSongs.length);
  const song = availableSongs[randomIndex];
  const remainingSongs = availableSongs.filter((_, i) => i !== randomIndex);

  return { song, remainingSongs };
}

/**
 * Sort players by score (for leaderboard)
 * @param {Object} players - Players object from Firebase
 * @returns {Array} - Sorted array of players
 */
export function sortPlayersByScore(players) {
  if (!players) return [];

  return Object.entries(players)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => {
      // Sort by score (descending)
      if (b.score !== a.score) return b.score - a.score;
      // If tied, sort by who reached it first (joinedAt)
      return a.joinedAt - b.joinedAt;
    });
}

/**
 * Check if game should end (someone reached winning score)
 * @param {Object} players - Players object
 * @param {number} winningScore - Score needed to win (default 10)
 * @returns {Object|null} - Winner player or null
 */
export function checkForWinner(players, winningScore = 10) {
  if (!players) return null;

  const sortedPlayers = sortPlayersByScore(players);
  const topPlayer = sortedPlayers[0];

  if (topPlayer && topPlayer.score >= winningScore) {
    return topPlayer;
  }

  return null;
}

/**
 * Format timestamp to readable time
 * @param {number} timestamp - Firebase timestamp
 * @returns {string} - Formatted time
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('hu-HU', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calculate game statistics for a player
 * @param {Object} player - Player object
 * @returns {Object} - Statistics
 */
export function calculatePlayerStats(player) {
  if (!player || !player.timeline) {
    return { accuracy: 0, totalAttempts: 0, correctAnswers: 0 };
  }

  const correctAnswers = player.score || 0;
  // Estimate total attempts (this is simplified - you might want to track this separately)
  const totalAttempts = correctAnswers + (player.tokensUsed || 0);
  const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

  return {
    accuracy: Math.round(accuracy),
    totalAttempts,
    correctAnswers
  };
}

/**
 * Generate unique player ID
 * @returns {string} - Unique player ID
 */
export function generatePlayerId() {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if all players have answered current round
 * @param {Object} players - Players object
 * @returns {boolean} - True if all answered
 */
export function allPlayersAnswered(players) {
  if (!players || Object.keys(players).length === 0) return false;
  
  return Object.values(players).every(player => player.hasAnswered === true);
}

/**
 * Count how many players have answered
 * @param {Object} players - Players object
 * @returns {number} - Count of players who answered
 */
export function countAnsweredPlayers(players) {
  if (!players) return 0;
  return Object.values(players).filter(p => p.hasAnswered === true).length;
}

/**
 * Reset players' answer status for next round
 * @param {Object} players - Players object
 * @returns {Object} - Updated players object
 */
export function resetPlayersAnswerStatus(players) {
  const updated = { ...players };
  Object.keys(updated).forEach(playerId => {
    updated[playerId] = {
      ...updated[playerId],
      hasAnswered: false,
      placementIndex: null
    };
  });
  return updated;
}

/**
 * Check if a player is online based on lastSeen timestamp
 * @param {Object} player - Player object
 * @param {number} timeoutMs - Milliseconds before considered offline (default: 30000)
 * @returns {boolean} - True if online
 */
export function isPlayerOnline(player, timeoutMs = 30000) {
  if (!player || !player.lastSeen) return false;
  const now = Date.now();
  return (now - player.lastSeen) < timeoutMs;
}

/**
 * Get player connection status
 * @param {Object} player - Player object
 * @returns {string} - 'online', 'offline', or 'away'
 */
export function getPlayerConnectionStatus(player) {
  if (!player || !player.lastSeen) return 'offline';
  
  const now = Date.now();
  const elapsed = now - player.lastSeen;
  
  if (elapsed < 15000) return 'online';      // Less than 15 seconds
  if (elapsed < 30000) return 'away';        // 15-30 seconds
  return 'offline';                           // More than 30 seconds
}
