import React, { useState, useEffect } from 'react';
import { Music, Users, Copy, Check, ArrowLeft, Play, Loader } from 'lucide-react';
import { generateRoomCode, normalizeRoomCode, validateRoomCodeFormat, generatePlayerId } from '../utils/gameUtils';
import { GAME_CONFIG, DEMO_SONGS } from '../utils/constants';
import useGameSession from '../hooks/useGameSession';

const STORAGE_KEY = 'gombiful_session';

const MultiplayerLobby = ({ onBack, onGameStart }) => {
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [roomCode, setRoomCode] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState(''); // Separate input state
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(() => {
    // Check if there's a saved session with playerId
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (Date.now() - session.timestamp < 30 * 60 * 1000) {
          return session.playerId;
        }
      } catch (e) {
        // Ignore
      }
    }
    return generatePlayerId();
  });
  const [role, setRole] = useState(null); // 'dj' or 'player'
  const [copied, setCopied] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [savedSession, setSavedSession] = useState(null);

  const {
    gameState,
    isLoading,
    error,
    createGame,
    joinGame,
    leaveGame,
    startGame
  } = useGameSession(roomCode, role, playerId);

  // Load saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const session = JSON.parse(saved);
        // Check if session is not too old (30 minutes)
        if (Date.now() - session.timestamp < 30 * 60 * 1000) {
          setSavedSession(session);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save session to localStorage
  const saveSession = (role, roomCode, playerId, playerName) => {
    const session = {
      role,
      roomCode,
      playerId,
      playerName,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  };

  // Clear session
  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedSession(null);
  };

  // Handle create game
  const handleCreateGame = async () => {
    const newRoomCode = generateRoomCode();
    const djName = playerName || 'DJ';
    
    setRoomCode(newRoomCode);
    setRole('dj');
    
    const result = await createGame(newRoomCode, djName, DEMO_SONGS);
    
    if (!result.success) {
      alert('Hiba a játék létrehozásakor: ' + result.error);
      setRoomCode('');
      setRole(null);
    } else {
      // Save session for reconnection
      saveSession('dj', newRoomCode, playerId, djName);
    }
  };

  // Handle join game
  const handleJoinGame = async () => {
    setJoinError('');
    setIsJoining(true);
    
    if (!playerName.trim()) {
      setJoinError('Add meg a neved!');
      setIsJoining(false);
      return;
    }

    const normalized = normalizeRoomCode(roomCodeInput);
    
    if (!validateRoomCodeFormat(normalized)) {
      setJoinError('Helytelen szobakód formátum!');
      setIsJoining(false);
      return;
    }

    // Call joinGame with the normalized room code directly
    const result = await joinGame(playerName.trim(), normalized);
    
    if (!result.success) {
      setJoinError(result.error || 'Nem sikerült csatlakozni');
      setIsJoining(false);
    } else {
      // Set roomCode and role after successful join
      setRoomCode(normalized);
      setRole('player');
      setIsJoining(false);
      // Save session for reconnection
      saveSession('player', normalized, playerId, playerName.trim());
    }
  };

  // Handle start game
  const handleStartGame = async () => {
    const result = await startGame();
    if (result.success) {
      onGameStart(role, roomCode, playerId);
    } else {
      alert('Hiba a játék indításakor: ' + result.error);
    }
  };

  // Handle leave/back
  const handleBack = async () => {
    if (roomCode && role) {
      await leaveGame();
      clearSession();
    }
    onBack();
  };

  // Resume saved session
  const handleResumeSession = () => {
    if (savedSession) {
      setPlayerId(savedSession.playerId);
      setRoomCode(savedSession.roomCode);
      setRole(savedSession.role);
      setPlayerName(savedSession.playerName);
      setMode(savedSession.role === 'dj' ? 'create' : 'join');
    }
  };

  // Dismiss saved session
  const handleDismissSession = () => {
    clearSession();
  };

  // Copy room code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-start when game status changes (for players)
  useEffect(() => {
    if (gameState?.status === 'playing' && role === 'player') {
      onGameStart(role, roomCode, playerId);
    }
  }, [gameState?.status, role, roomCode, playerId, onGameStart]);

  // Clear saved session if game is not found
  useEffect(() => {
    if (error && error.includes('not found') && savedSession) {
      console.log('Game no longer exists, clearing saved session');
      clearSession();
    }
  }, [error, savedSession]);

  // Mode selection screen
  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <button
            onClick={handleBack}
            className="mb-6 text-white flex items-center gap-2 hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Vissza
          </button>

          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <Music className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Többjátékos Mód</h1>
              <p className="text-gray-600">Hogyan szeretnél játszani?</p>
            </div>

            {/* Resume Session Prompt */}
            {savedSession && !error && (
              <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg mb-1">🎮 Folytatható játék</div>
                    <div className="text-sm text-green-100">
                      {savedSession.role === 'dj' ? '🎧 DJ' : '🎵 Játékos'} · {savedSession.playerName} · Szoba: {savedSession.roomCode}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResumeSession}
                      className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                    >
                      Folytatás
                    </button>
                    <button
                      onClick={handleDismissSession}
                      className="bg-green-600/50 text-white px-3 py-2 rounded-lg hover:bg-green-600/70 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error message for failed reconnection */}
            {error && roomCode && (
              <div className="mb-6 bg-red-500 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg mb-1">❌ A játék nem található</div>
                    <div className="text-sm text-red-100">
                      A mentett játék már nem elérhető (véget ért vagy törölték).
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      clearSession();
                      setRoomCode('');
                      setRole(null);
                    }}
                    className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                  >
                    Rendben
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {/* Create Game - DJ */}
              <button
                onClick={() => setMode('create')}
                className="group relative bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-2xl hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-4 rounded-xl">
                    <Music className="w-8 h-8" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold mb-1">Játék létrehozása (DJ)</h3>
                    <p className="text-pink-100 text-sm">
                      Új szoba létrehozása és a játék irányítása
                    </p>
                  </div>
                  <div className="text-3xl">→</div>
                </div>
              </button>

              {/* Join Game - Player */}
              <button
                onClick={() => setMode('join')}
                className="group relative bg-gradient-to-br from-blue-500 to-purple-500 text-white p-6 rounded-2xl hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-4 rounded-xl">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold mb-1">Csatlakozás (Játékos)</h3>
                    <p className="text-blue-100 text-sm">
                      Belépés meglévő szobába szobakóddal
                    </p>
                  </div>
                  <div className="text-3xl">→</div>
                </div>
              </button>
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-xl text-sm text-gray-600">
              <strong className="text-purple-700">💡 Tipp:</strong> A DJ a számítógépén irányítja a játékot és lejátssza a zenéket. 
              A játékosok a telefonjukon válaszolnak.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create Game - DJ Setup
  if (mode === 'create' && !roomCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setMode(null)}
            className="mb-6 text-white flex items-center gap-2 hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Vissza
          </button>

          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">DJ Beállítások</h2>
              <p className="text-gray-600">Add meg a DJ nevedet (opcionális)</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DJ Név
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="DJ (alapértelmezett)"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                  maxLength={20}
                />
              </div>

              <button
                onClick={handleCreateGame}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Szoba létrehozása
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Join Game - Player Setup
  if (mode === 'join' && !roomCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setMode(null)}
            className="mb-6 text-white flex items-center gap-2 hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Vissza
          </button>

          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Csatlakozás</h2>
              <p className="text-gray-600">Add meg a szobakódot és nevedet</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Szobakód
                </label>
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-center text-2xl font-mono tracking-wider"
                  maxLength={9}
                  disabled={isJoining}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Neved
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Add meg a neved"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                  maxLength={20}
                  disabled={isJoining}
                />
              </div>

              {joinError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {joinError}
                </div>
              )}

              <button
                onClick={handleJoinGame}
                disabled={!roomCodeInput || !playerName.trim() || isJoining}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Csatlakozás...
                  </>
                ) : (
                  'Csatlakozás'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p className="text-xl">Betöltés...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Hiba történt</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Vissza a főmenübe
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DJ Lobby
  if (role === 'dj' && gameState) {
    const playerCount = Object.keys(gameState.players || {}).length;
    const canStart = playerCount >= GAME_CONFIG.MIN_PLAYERS;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <button
            onClick={handleBack}
            className="mb-6 text-white flex items-center gap-2 hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Szoba bezárása
          </button>

          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
            {/* Room Code Display */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Szobakód</h2>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 mb-4">
                <div className="text-white text-5xl font-bold font-mono tracking-wider mb-2">
                  {gameState.roomCode}
                </div>
                <button
                  onClick={copyRoomCode}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 mx-auto"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Másolva!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Kód másolása
                    </>
                  )}
                </button>
              </div>
              <p className="text-gray-600">A játékosok ezzel a kóddal csatlakozhatnak</p>
            </div>

            {/* Players List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Játékosok ({playerCount}/{GAME_CONFIG.MAX_PLAYERS})
              </h3>
              
              {playerCount === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Várakozás játékosokra...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(gameState.players || {}).map(([id, player]) => (
                    <div
                      key={id}
                      className="bg-purple-50 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                          {player?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{player?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">
                            Készen áll • {player?.timeline?.length || 0} kezdő kártya
                          </div>
                        </div>
                      </div>
                      <div className="text-green-500">✓</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Game Button */}
            <div className="space-y-3">
              {!canStart && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm text-center">
                  Minimum {GAME_CONFIG.MIN_PLAYERS} játékos szükséges az indításhoz
                </div>
              )}
              
              <button
                onClick={handleStartGame}
                disabled={!canStart}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <Play className="w-6 h-6" />
                Játék indítása
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Player Lobby (waiting for DJ to start)
  if (role === 'player' && gameState) {
    const playerCount = Object.keys(gameState.players || {}).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={handleBack}
            className="mb-6 text-white flex items-center gap-2 hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kilépés
          </button>

          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Várakozás...</h2>
              <p className="text-gray-600">A DJ hamarosan elindítja a játékot</p>
            </div>

            <div className="mb-6 text-center">
              <div className="text-sm text-gray-500 mb-2">Szobakód</div>
              <div className="text-3xl font-bold font-mono text-purple-600 tracking-wider">
                {gameState.roomCode}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Te vagy:</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                    {gameState.players?.[playerId]?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="font-semibold text-gray-800">
                    {gameState.players?.[playerId]?.name || 'Loading...'}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  Többi játékos ({playerCount - 1})
                </div>
                <div className="space-y-2">
                  {Object.entries(gameState.players || {})
                    .filter(([id]) => id !== playerId)
                    .map(([id, player]) => (
                      <div
                        key={id}
                        className="bg-gray-50 rounded-lg p-3 flex items-center gap-2"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {player?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="text-sm text-gray-700">{player?.name || 'Unknown'}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <Loader className="w-5 h-5 mx-auto mb-2 animate-spin" />
              Várakozás a DJ-re...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MultiplayerLobby;
