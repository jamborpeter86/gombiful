# 🎮 Gombiful Multiplayer - Development Backlog

## 🔴 High Priority - Core Gameplay Issues

### 1. ✅ Same Starting Year for All Players
**Status:** ✅ COMPLETE
**Description:** Currently each player gets a different starting song/year. All players should start with the same year for fairness.
**Implementation:** ✅ Modified game initialization - all players now receive `sharedInitialSong` instead of individual songs.
**Files Changed:**
- `/src/hooks/useGameSession.js` - createGame() and joinGame() functions

### 2. ✅ Show Correct/Incorrect Feedback After Answer
**Status:** ✅ COMPLETE
**Description:** When cards are revealed, players should see visual feedback if they were right or wrong.
**Implementation:** ✅ Added revealing phase with green checkmark (✅) for correct, red X (❌) for incorrect answers.
**Files Changed:**
- `/src/multiplayer/MultiplayerPlayer.jsx` - Added revealing screen UI

### 3. ✅ Display Solution to All Players
**Status:** ✅ COMPLETE
**Description:** After evaluation, show the correct year/position to ALL players, even if they answered incorrectly. Wrong answers won't be added to their timeline, but they should see what the correct answer was.
**Implementation:** ✅ Created reveal phase showing:
- Song title, artist, and year
- Player stats (score, tokens, streak)
- 5-second display before next round
**Files Changed:**
- `/src/hooks/useGameSession.js` - Added `revealResults()` function
- `/src/multiplayer/MultiplayerPlayer.jsx` - Added reveal screen
- `/src/multiplayer/MultiplayerDJ.jsx` - Added reveal flow before nextRound()

---

## 🟡 Medium Priority - UX Improvements

### 4. ✅ Allow Late Joins
**Status:** ✅ COMPLETE
**Description:** Allow players to join after the game has started (noted as acceptable by user).
**Implementation:** ✅ 
- Removed status check - now only prevents joining ended games
- Late joiners receive the same `sharedInitialSong` as original players
- Added `joinedLate: true` flag for mid-game joins
- Visual indicator shows "Csatlakozott játék közben" badge on DJ view
**Files Changed:**
- `/src/hooks/useGameSession.js` - Modified joinGame() to allow PLAYING status
- `/src/multiplayer/MultiplayerDJ.jsx` - Added late join badge display

### 5. ✅ Session Persistence & Reconnection
**Status:** ✅ COMPLETE
**Description:** Allow players to reconnect if they accidentally close/refresh the browser.
**Implementation:** ✅
- Session data saved to localStorage (roomCode, playerId, role, playerName)
- 30-minute session expiration
- Green "Resume Game" banner on lobby screen
- Automatic session cleanup on intentional leave
- Works for both DJ and Player roles
**Files Changed:**
- `/src/multiplayer/MultiplayerLobby.jsx` - Added session persistence logic and resume UI

### 6. Better Mobile Input Experience
**Status:** TESTING
**Description:** Room code and name input had auto-navigation issues (FIXED).
**Implementation:** ✅ Added separate input state and explicit join button trigger.

---

## 🟢 Low Priority - Polish & Enhancement

### 7. ✅ Player Disconnect Handling
**Status:** ✅ COMPLETE
**Description:** Handle players who disconnect mid-game gracefully.
**Implementation:** ✅
- Added heartbeat mechanism - players send "alive" signal every 10 seconds
- `lastSeen` timestamp tracked for each player
- Connection status: online (<15s), away (15-30s), offline (>30s)
- Visual indicators on DJ dashboard:
  - Green dot = online
  - Yellow dot = away
  - Gray dot + "Offline" badge = offline
  - Offline players shown with gray/translucent card
- Utility functions: `isPlayerOnline()`, `getPlayerConnectionStatus()`
**Files Changed:**
- `/src/hooks/useGameSession.js` - Added heartbeat useEffect and lastSeen tracking
- `/src/utils/gameUtils.js` - Added connection status utility functions
- `/src/multiplayer/MultiplayerDJ.jsx` - Added visual connection indicators

### 8. ✅ DJ Can Skip Songs
**Status:** ✅ COMPLETE
**Description:** Allow DJ to skip songs if needed during gameplay.
**Implementation:** ✅
- Added `skipSong()` function in useGameSession hook
- DJ can skip current song without scoring any players
- Orange "Skip" button added to DJ control panel
- Confirmation dialog warns DJ that no points will be awarded
- All player answers are reset and new song is drawn
**Files Changed:**
- `/src/hooks/useGameSession.js` - Added skipSong() function
- `/src/multiplayer/MultiplayerDJ.jsx` - Added Skip button and handler

### 9. Animated Transitions
**Status:** BACKLOG
**Description:** Add smooth animations for card reveals, score updates, etc.

### 10. Sound Effects
**Status:** BACKLOG
**Description:** Add sound feedback for correct/incorrect answers, game events.

### 11. End Game Celebration
**Status:** BACKLOG
**Description:** Better winner announcement and final scores screen.

---

## 🐛 Known Issues

### 🔴 Multiple Players Reconnection Issue
**Status:** OPEN
**Description:** When multiple players disconnect simultaneously (e.g., browser crash, network issue), only one player can see the "Resume Game" banner to reconnect. The localStorage only stores ONE session per browser, so if multiple players use different tabs on the same device, only the last session is saved.
**Impact:** Medium - Affects shared device scenarios or family/friend play sessions
**Potential Solutions:**
- Store multiple sessions in localStorage as an array
- Show a dropdown/list of available sessions to resume
- Use sessionStorage instead of localStorage for per-tab sessions
- Add "Switch Account" feature to choose which player to resume

---

## 🐛 Known Bugs (Resolved)

### ✅ White Screen After Join
**Fixed:** Added null safety checks for player data rendering.

### ✅ Auto-Navigation on Input
**Fixed:** Separated input state from join logic, requiring explicit button click.

### ✅ "Missing room code or player ID" Error
**Fixed:** Pass roomCode directly to joinGame function instead of relying on state timing.

---

## 📋 Testing Notes

### Latest Test Session (2025-10-12)
- ✅ DJ can create room successfully
- ✅ Room code displays properly
- ✅ Player can join with room code
- ✅ Multiple devices can connect (laptop + phone)
- ✅ Network access configured (0.0.0.0)
- ✅ MIN_PLAYERS set to 1 for testing
- 🔄 Testing core gameplay flow...

---

## 🎯 Next Steps

1. **Implement same starting year for all players**
2. **Add correct/incorrect visual feedback**
3. **Show solution to all players after reveal**
4. Test complete round flow
5. Restore MIN_PLAYERS to 2
6. Full multiplayer test with 3+ players

---

*Last Updated: 2025-10-14*
