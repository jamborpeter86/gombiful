import React, { useState, useEffect } from 'react';
import { Music, ChevronLeft, ChevronRight, Coins, Trophy, Loader } from 'lucide-react';
import useGameSession from '../hooks/useGameSession';
import { GAME_CONFIG } from '../utils/constants';
import { sortPlayersByScore } from '../utils/gameUtils';
import soundManager from '../utils/soundEffects';

const MultiplayerPlayer = ({ roomCode, playerId, onExit }) => {
  const { gameState, isLoading, submitAnswer, useTokenSkip } = useGameSession(roomCode, 'player', playerId);
  const [placementIndex, setPlacementIndex] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
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
    const myPlayer = gameState.players[playerId];
    const myRank = sortedPlayers.findIndex(p => p.id === playerId) + 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">
              {myRank === 1 ? '🏆' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎵'}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Játék vége!</h1>
            <div className="text-xl text-gray-600 mb-2">
              {myRank === 1 ? 'Gratulálunk! Nyertél! 🎉' : `${myRank}. helyezett lettél`}
            </div>
            <div className="text-lg font-semibold text-purple-600">
              {myPlayer?.score}/{GAME_CONFIG.WINNING_SCORE} pont
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Eredmények:</h3>
            <div className="space-y-2">
              {sortedPlayers.slice(0, 5).map((player, index) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    player.id === playerId
                      ? 'bg-purple-100 border-2 border-purple-400'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-500">#{index + 1}</span>
                    <span className="font-semibold text-gray-800">{player.name}</span>
                  </div>
                  <span className="font-bold text-purple-600">{player.score}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onExit}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold"
          >
            Vissza a főmenübe
          </button>
        </div>
      </div>
    );
  }

  const myPlayer = gameState.players?.[playerId];
  const currentSong = gameState.currentSong;
  const hasAnswered = myPlayer?.hasAnswered || false;

  // REVEALING SCREEN - Show if player was correct/incorrect
  if (gameState.status === 'revealing' && gameState.revealData) {
    const myResult = gameState.revealData.results?.[playerId];
    const wasCorrect = myResult?.correct || false;
    const correctSong = currentSong;

    // Play sound effect on reveal
    useEffect(() => {
      if (wasCorrect) {
        soundManager.playCorrect();
      } else {
        soundManager.playWrong();
      }
    }, []); // Run once when revealing

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-scaleUp">
          {/* Result Icon */}
          <div className={`text-8xl mb-6 ${wasCorrect ? 'animate-bounce' : 'animate-shake'}`}>
            {wasCorrect ? '✅' : '❌'}
          </div>

          {/* Feedback Message */}
          <h2 className={`text-3xl font-bold mb-4 ${wasCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {wasCorrect ? 'Helyes!' : 'Hibás válasz'}
          </h2>

          {/* Show the correct answer */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
            <div className="text-sm text-gray-600 mb-2">A helyes válasz:</div>
            <div className="text-2xl font-bold text-purple-900 mb-2">{correctSong?.title}</div>
            <div className="text-lg text-purple-700 mb-1">{correctSong?.artist}</div>
            <div className="text-3xl font-bold text-pink-600">{correctSong?.year}</div>
          </div>

          {/* Player stats update */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{myPlayer.score}</div>
                <div className="text-xs text-gray-500">Pontok</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{myPlayer.tokens}</div>
                <div className="text-xs text-gray-500">Zsetonok</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{myPlayer.correctStreak}</div>
                <div className="text-xs text-gray-500">Sorozat</div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-gray-600 text-sm">
            <Loader className="w-5 h-5 mx-auto mb-2 animate-spin" />
            Várakozás a következő körre...
          </div>
        </div>
      </div>
    );
  }

  if (!myPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nem található a játékos</h2>
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

  const handlePlaceCard = (index) => {
    soundManager.playClick();
    setPlacementIndex(index);
    setShowConfirmation(true);
  };

  const handleConfirmPlacement = async () => {
    if (placementIndex === null) return;
    
    soundManager.playCardPlace();
    
    await submitAnswer(placementIndex);
    setShowConfirmation(false);
    setPlacementIndex(null);
  };

  const handleSkip = async () => {
    if (myPlayer.tokens < GAME_CONFIG.TOKEN_COST_SKIP) return;
    
    if (confirm('Biztosan kihagyod ezt a dalt? (1 zseton)')) {
      await useTokenSkip();
    }
  };

  const handleCancelPlacement = () => {
    setPlacementIndex(null);
    setShowConfirmation(false);
  };

  // Other players for leaderboard
  const otherPlayers = Object.entries(gameState.players || {})
    .filter(([id]) => id !== playerId)
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900">
      {/* Compact Header */}
      <div className="bg-white/95 backdrop-blur shadow-lg p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center flex-1">
            <div className="text-xs text-gray-500">Kör {gameState.currentRound}</div>
            <div className="font-mono text-xs text-purple-600">{gameState.roomCode}</div>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-gray-800">
              {myPlayer.score}/{GAME_CONFIG.WINNING_SCORE}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center gap-4 mt-2 text-sm">
          <span className="text-gray-600">🪙 {myPlayer.tokens}</span>
          <span className="text-gray-600">🔥 {myPlayer.correctStreak}/3</span>
          <span className="text-gray-600">👥 {Object.keys(gameState.players || {}).length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        {/* Listening State */}
        {!currentSong && (
          <div className="bg-white/95 backdrop-blur rounded-2xl p-8 text-center shadow-lg">
            <Music className="w-16 h-16 mx-auto text-purple-600 mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Várakozás...</h2>
            <p className="text-gray-600">A DJ hamarosan elindítja a következő dalt</p>
          </div>
        )}

        {/* Has Answered - Waiting */}
        {currentSong && hasAnswered && (
          <div className="bg-white/95 backdrop-blur rounded-2xl p-8 text-center shadow-lg mb-4">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Válaszoltál!</h2>
            <p className="text-gray-600">Várakozás a többi játékosra...</p>
            <div className="mt-4">
              <Loader className="w-8 h-8 mx-auto text-purple-600 animate-spin" />
            </div>
          </div>
        )}

        {/* Answering State */}
        {currentSong && !hasAnswered && !showConfirmation && (
          <div className="space-y-4">
            {/* Instruction */}
            <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-4">
                <Music className="w-12 h-12 mx-auto text-purple-600 mb-2" />
                <h2 className="text-xl font-bold text-gray-800 mb-1">Hallgasd a dalt!</h2>
                <p className="text-sm text-gray-600">A DJ lejátssza a zenét. Helyezd el az idővonaladon!</p>
              </div>

              {/* Token Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleSkip}
                  disabled={myPlayer.tokens < GAME_CONFIG.TOKEN_COST_SKIP}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold ${
                    myPlayer.tokens >= GAME_CONFIG.TOKEN_COST_SKIP
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  🪙 Kihagyás (1)
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">A te idővonalad:</h3>
              
              <div className="space-y-2">
                {/* First position */}
                <button
                  onClick={() => handlePlaceCard(0)}
                  className="w-full border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 rounded-xl p-3 transition-all"
                >
                  <div className="flex items-center justify-center gap-2 text-purple-600 font-semibold">
                    <ChevronLeft className="w-5 h-5" />
                    <span>Legrégebbi helyre</span>
                  </div>
                </button>

                {/* Existing cards with slots between */}
                {myPlayer.timeline?.map((song, idx) => (
                  <React.Fragment key={song.id}>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-md animate-fadeIn hover:scale-105 transition-transform duration-200">
                      <div className="text-2xl font-bold mb-1">{song.year}</div>
                      <div className="text-sm opacity-90">{song.title}</div>
                      <div className="text-sm opacity-75">{song.artist}</div>
                    </div>
                    
                    {/* Slot after this card */}
                    <button
                      onClick={() => handlePlaceCard(idx + 1)}
                    >
                      <div className="flex items-center justify-center gap-2 text-purple-600 font-semibold">
                        <ChevronRight className="w-5 h-5" />
                        <span>Ide helyezem</span>
                      </div>
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmation && placementIndex !== null && (
          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Megerősítés</h2>
            
            <div className="mb-4">
              <p className="text-center text-gray-600 mb-2">A kártyát ide helyezed:</p>
              <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-3 text-center">
                <div className="text-lg font-semibold text-purple-700">
                  {placementIndex === 0 ? 'Legrégebbi pozíció' : 
                   placementIndex === myPlayer.timeline?.length ? 'Legújabb pozíció' :
                   `${myPlayer.timeline[placementIndex - 1]?.year} után`}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelPlacement}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300"
              >
                Mégse
              </button>
              <button
                onClick={handleConfirmPlacement}
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg"
              >
                Biztos vagyok!
              </button>
            </div>
          </div>
        )}

        {/* Other Players - Compact Leaderboard */}
        {otherPlayers.length > 0 && (
          <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Többi játékos:</h3>
            <div className="space-y-2">
              {otherPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {player?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{player?.name || 'Unknown'}</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{player.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerPlayer;
