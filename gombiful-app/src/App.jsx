import { useState } from 'react';
import GombifulGame from './gombiful-game.jsx';
import GameModeSelector from './GameModeSelector.jsx';
import MultiplayerLobby from './multiplayer/MultiplayerLobby.jsx';
import MultiplayerDJ from './multiplayer/MultiplayerDJ.jsx';
import MultiplayerPlayer from './multiplayer/MultiplayerPlayer.jsx';
import './index.css';

function App() {
  const [screen, setScreen] = useState('mode-select'); // 'mode-select', 'single', 'multi-lobby', 'multi-game'
  const [multiplayerData, setMultiplayerData] = useState(null);

  const handleModeSelect = (mode) => {
    if (mode === 'single') {
      setScreen('single');
    } else if (mode === 'multi') {
      setScreen('multi-lobby');
    }
  };

  const handleBackToModeSelect = () => {
    setScreen('mode-select');
    setMultiplayerData(null);
  };

  const handleMultiplayerGameStart = (role, roomCode, playerId) => {
    setMultiplayerData({ role, roomCode, playerId });
    setScreen('multi-game');
  };

  // Render based on current screen
  if (screen === 'mode-select') {
    return <GameModeSelector onSelectMode={handleModeSelect} />;
  }

  if (screen === 'single') {
    return <GombifulGame onBack={handleBackToModeSelect} />;
  }

  if (screen === 'multi-lobby') {
    return (
      <MultiplayerLobby
        onBack={handleBackToModeSelect}
        onGameStart={handleMultiplayerGameStart}
      />
    );
  }

  if (screen === 'multi-game') {
    if (multiplayerData?.role === 'dj') {
      return (
        <MultiplayerDJ
          roomCode={multiplayerData.roomCode}
          playerId={multiplayerData.playerId}
          onExit={handleBackToModeSelect}
        />
      );
    } else if (multiplayerData?.role === 'player') {
      return (
        <MultiplayerPlayer
          roomCode={multiplayerData.roomCode}
          playerId={multiplayerData.playerId}
          onExit={handleBackToModeSelect}
        />
      );
    }
  }

  return null;
}

export default App;
