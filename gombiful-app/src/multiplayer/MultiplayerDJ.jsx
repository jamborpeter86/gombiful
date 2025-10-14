import React, { useState, useEffect } from 'react';
import { Music, Users, Play, ArrowLeft, Trophy, Loader, ChevronRight, Volume2, VolumeX, SkipForward } from 'lucide-react';
import useGameSession from '../hooks/useGameSession';
import { validatePlacement, insertSongInTimeline, countAnsweredPlayers, sortPlayersByScore, getPlayerConnectionStatus } from '../utils/gameUtils';
import { GAME_CONFIG } from '../utils/constants';
import soundManager from '../utils/soundEffects';

const MultiplayerDJ = ({ roomCode, playerId, onExit }) => {
  const { gameState, isLoading, revealResults, nextRound, skipSong, endGame } = useGameSession(roomCode, 'dj', playerId);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p className="text-xl">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Játék nem található</h2>
          <button
            onClick={onExit}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Vissza
          </button>
        </div>
      </div>
    );
  }

  // Game ended
  if (gameState.status === 'ended') {
    const sortedPlayers = sortPlayersByScore(gameState.players);
    const winner = sortedPlayers[0];

    // Play win sound on game end
    useEffect(() => {
      soundManager.playWin();
    }, []);

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-2xl w-full animate-scaleUp">
          <div className="text-center mb-8">
            <Trophy className="w-24 h-24 mx-auto text-yellow-500 mb-4 animate-bounce" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2 animate-fadeIn">Játék vége!</h1>
            <h2 className="text-3xl font-bold text-purple-600 mb-2 animate-slideInLeft stagger-1">🏆 {winner?.name}</h2>
            <p className="text-xl text-gray-600 animate-slideInRight stagger-2">Nyert {winner?.score}/10 ponttal!</p>
          </div>

          {/* Leaderboard */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Eredmények</h3>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl flex items-center justify-between animate-slideInLeft ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 animate-glow'
                      : 'bg-gray-50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-400' : 'text-gray-300'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{player.name}</div>
                      <div className="text-sm text-gray-500">
                        🎵 {player.score} kártya • 🪙 {player.tokens} zseton
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {player.score}/10
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onExit}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
          >
            Vissza a főmenübe
          </button>
        </div>
      </div>
    );
  }

  const players = gameState.players || {};
  const playerCount = Object.keys(players).length;
  const answeredCount = countAnsweredPlayers(players);
  const allAnswered = answeredCount === playerCount;
  const currentSong = gameState.currentSong;

  // Handle reveal and next round
  const handleRevealAndNext = async () => {
    if (!allAnswered) {
      if (!confirm(`Még nem mindenki válaszolt (${answeredCount}/${playerCount}). Folytatod?`)) {
        return;
      }
    }

    setIsRevealing(true);

    // Validate all player answers
    const validationResults = {};
    
    Object.entries(players).forEach(([pId, player]) => {
      if (player.placementIndex === -1) {
        // Skipped with token
        validationResults[pId] = { correct: false, skipped: true };
      } else if (player.placementIndex !== null) {
        // Submitted an answer
        const validation = validatePlacement(player.timeline, currentSong, player.placementIndex);
        if (validation.correct) {
          const newTimeline = insertSongInTimeline(player.timeline, currentSong, player.placementIndex);
          validationResults[pId] = { correct: true, newTimeline };
        } else {
          validationResults[pId] = { correct: false };
        }
      } else {
        // Didn't answer
        validationResults[pId] = { correct: false };
      }
    });

    // STEP 1: Show reveal screen to all players
    await revealResults(validationResults);

    // STEP 2: Wait 5 seconds for players to see their results
    setTimeout(async () => {
      // STEP 3: Move to next round
      const result = await nextRound(validationResults);
      
      if (result.gameEnded) {
        // Game ended, winner found
        console.log('Game ended! Winner:', result.winner);
      }
      
      setIsRevealing(false);
    }, 5000); // 5 seconds to see results
  };

  // Handle skip song
  const handleSkipSong = async () => {
    if (confirm('Biztosan átugrasz ezt a dalt? Senki nem fog pontot kapni érte.')) {
      const result = await skipSong();
      if (!result.success) {
        alert('Hiba történt a dal átugrása közben');
      }
    }
  };

  const handleEndGame = async () => {
    if (confirm('Biztosan befejezed a játékot?')) {
      await endGame();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handleEndGame}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Befejezés</span>
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-800">DJ Vezérlőpult</h1>
              <div className="text-sm text-gray-600">
                Szoba: <span className="font-mono font-bold text-purple-600">{gameState.roomCode}</span>
                {' '} • Kör: {gameState.currentRound}
                {' '} • Játékosok: {playerCount}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                allAnswered
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {answeredCount}/{playerCount} válasz
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-4">
        {/* Left Column - Video and Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player */}
          {currentSong && (
            <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg animate-fadeIn">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2 transition-all duration-300">
                  {isRevealing ? (
                    <>
                      <span className="text-purple-600 animate-slideInLeft">{currentSong.title}</span>
                      <span className="text-gray-500 animate-slideInRight"> • {currentSong.artist}</span>
                    </>
                  ) : (
                    '🎵 Jelenlegi dal'
                  )}
                </h2>
                {isRevealing && (
                  <div className="text-3xl font-bold text-pink-600 animate-scaleUp">{currentSong.year}</div>
                )}
              </div>

              {/* YouTube Embed */}
              <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ paddingTop: '56.25%' }}>
                <iframe
                  key={currentSong.id}
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=0&controls=1&modestbranding=1&rel=0${isMuted ? '&mute=1' : ''}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  {isMuted ? 'Némítva' : 'Hang'}
                </button>
              </div>
            </div>
          )}

          {/* Game Controls */}
          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Játék vezérlés</h3>
            
            {isRevealing ? (
              <div className="text-center py-8">
                <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-600" />
                <p className="text-lg font-semibold text-gray-700">Eredmények kiértékelése...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleRevealAndNext}
                  disabled={!currentSong}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <ChevronRight className="w-6 h-6" />
                  Felfedés és következő kör
                </button>

                <button
                  onClick={handleSkipSong}
                  disabled={!currentSong}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <SkipForward className="w-5 h-5" />
                  Dal átugrása (nincs pontszámítás)
                </button>

                {!allAnswered && (
                  <p className="text-sm text-center text-gray-500">
                    💡 Várj, amíg mindenki válaszol, vagy kényszerítsd a folytatást
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Players Dashboard */}
        <div className="lg:col-span-1">
          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Játékosok ({playerCount})
            </h3>

            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {Object.entries(players).map(([pId, player]) => {
                const connectionStatus = getPlayerConnectionStatus(player);
                const isOffline = connectionStatus === 'offline';
                
                return (
                <div
                  key={pId}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isOffline
                      ? 'bg-gray-100 border-gray-300 opacity-60'
                      : player.hasAnswered
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {/* Player Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                          {player?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        {/* Connection status indicator */}
                        <div 
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            connectionStatus === 'online' ? 'bg-green-500' :
                            connectionStatus === 'away' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`}
                          title={
                            connectionStatus === 'online' ? 'Online' :
                            connectionStatus === 'away' ? 'Távol' :
                            'Offline'
                          }
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold ${isOffline ? 'text-gray-500' : 'text-gray-800'}`}>
                            {player?.name || 'Unknown'}
                          </span>
                          {isOffline && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-300">
                              Offline
                            </span>
                          )}
                          {player.joinedLate && !isOffline && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-300">
                              Csatlakozott játék közben
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isOffline ? '🔴 Kapcsolat megszakadt' :
                           player.hasAnswered ? '✓ Válaszolt' : '⏱ Gondolkodik...'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600 transition-all duration-300">
                        {player.score}/{GAME_CONFIG.WINNING_SCORE}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <span>🪙 {player.tokens}</span>
                    <span>🔥 {player.correctStreak}/3</span>
                  </div>

                  {/* Timeline Preview */}
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">Idővonal:</div>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                      {player.timeline?.map((song, idx) => (
                        <div
                          key={idx}
                          className="min-w-[60px] bg-gradient-to-br from-purple-400 to-pink-400 text-white p-2 rounded text-xs text-center"
                          title={`${song.title} (${song.year})`}
                        >
                          <div className="font-bold">{song.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerDJ;
