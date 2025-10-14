import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Trophy, Shuffle, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

// Zenék YouTube-ról (valódi dalok, évszámokkal)
const DEMO_SONGS = [
  // 1950s
  { id: 1, title: "Rock Around the Clock", artist: "Bill Haley & His Comets", year: 1954, youtubeId: "ZgdufzXvjqw" },
  { id: 2, title: "Johnny B. Goode", artist: "Chuck Berry", year: 1958, youtubeId: "ZFo8-JqzSCM" },
  { id: 3, title: "Jailhouse Rock", artist: "Elvis Presley", year: 1957, youtubeId: "gj0Rz-uP4Mk" },
  
  // 1960s
  { id: 4, title: "I Want to Hold Your Hand", artist: "The Beatles", year: 1963, youtubeId: "jenWdylTtzs" },
  { id: 5, title: "Like a Rolling Stone", artist: "Bob Dylan", year: 1965, youtubeId: "IwOfCgkyEj0" },
  { id: 6, title: "Hey Jude", artist: "The Beatles", year: 1968, youtubeId: "A_MjCqQoLLA" },
  { id: 7, title: "Respect", artist: "Aretha Franklin", year: 1967, youtubeId: "6FOUqQt3Kg0" },
  { id: 8, title: "I Got You (I Feel Good)", artist: "James Brown", year: 1965, youtubeId: "U5TqIdff_DQ" },
  
  // 1970s
  { id: 9, title: "Stairway to Heaven", artist: "Led Zeppelin", year: 1971, youtubeId: "QkF3oxziUI4" },
  { id: 10, title: "Imagine", artist: "John Lennon", year: 1971, youtubeId: "YkgkThdzX-8" },
  { id: 11, title: "Bohemian Rhapsody", artist: "Queen", year: 1975, youtubeId: "fJ9rUzIMcZQ" },
  { id: 12, title: "Hotel California", artist: "Eagles", year: 1977, youtubeId: "09839DpTctU" },
  { id: 13, title: "Dancing Queen", artist: "ABBA", year: 1976, youtubeId: "xFrGuyw1V8s" },
  { id: 14, title: "Stayin' Alive", artist: "Bee Gees", year: 1977, youtubeId: "fNFzfwLM72c" },
  
  // 1980s
  { id: 15, title: "Billie Jean", artist: "Michael Jackson", year: 1983, youtubeId: "Zi_XLOBDo_Y" },
  { id: 16, title: "Thriller", artist: "Michael Jackson", year: 1982, youtubeId: "sOnqjkJTMaA" },
  { id: 17, title: "Sweet Child O' Mine", artist: "Guns N' Roses", year: 1987, youtubeId: "1w7OgIMMRc4" },
  { id: 18, title: "Like a Prayer", artist: "Madonna", year: 1989, youtubeId: "79fzeNUqQbQ" },
  { id: 19, title: "Purple Rain", artist: "Prince", year: 1984, youtubeId: "TvnYmWpD_T8" },
  { id: 20, title: "Every Breath You Take", artist: "The Police", year: 1983, youtubeId: "OMOGaugKpzs" },
  { id: 21, title: "With or Without You", artist: "U2", year: 1987, youtubeId: "XmSdTa9kaiQ" },
  
  // 1990s
  { id: 22, title: "Smells Like Teen Spirit", artist: "Nirvana", year: 1991, youtubeId: "hTWKbfoikeg" },
  { id: 23, title: "Wonderwall", artist: "Oasis", year: 1995, youtubeId: "bx1Bh8ZvH84" },
  { id: 24, title: "Losing My Religion", artist: "R.E.M.", year: 1991, youtubeId: "xwtdhWltSIg" },
  { id: 25, title: "No Scrubs", artist: "TLC", year: 1999, youtubeId: "FrLequ6dUdM" },
  { id: 26, title: "Wannabe", artist: "Spice Girls", year: 1996, youtubeId: "gJLIiF15wjQ" },
  { id: 27, title: "...Baby One More Time", artist: "Britney Spears", year: 1998, youtubeId: "C-u5WLJ9Yk4" },
  { id: 28, title: "One", artist: "U2", year: 1991, youtubeId: "ftjEcrrf7r0" },
  
  // 2000s
  { id: 29, title: "Crazy in Love", artist: "Beyoncé ft. Jay-Z", year: 2003, youtubeId: "ViwtNLUqkMY" },
  { id: 30, title: "Hey Ya!", artist: "OutKast", year: 2003, youtubeId: "PWgvGjAhvIw" },
  { id: 31, title: "Umbrella", artist: "Rihanna ft. Jay-Z", year: 2007, youtubeId: "CvBfHwUxHIk" },
  { id: 32, title: "Single Ladies", artist: "Beyoncé", year: 2008, youtubeId: "4m1EFMoRFvY" },
  { id: 33, title: "Rehab", artist: "Amy Winehouse", year: 2006, youtubeId: "KUmZp8pR1uc" },
  { id: 34, title: "Hips Don't Lie", artist: "Shakira ft. Wyclef Jean", year: 2006, youtubeId: "DUT5rEU6pqM" },
  
  // 2010s
  { id: 35, title: "Rolling in the Deep", artist: "Adele", year: 2010, youtubeId: "rYEDA3JcQqw" },
  { id: 36, title: "Someone Like You", artist: "Adele", year: 2011, youtubeId: "hLQl3WQQoQ0" },
  { id: 37, title: "Get Lucky", artist: "Daft Punk ft. Pharrell Williams", year: 2013, youtubeId: "5NV6Rdv1a3I" },
  { id: 38, title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", year: 2014, youtubeId: "OPf0YbXqDm0" },
  { id: 39, title: "Shape of You", artist: "Ed Sheeran", year: 2017, youtubeId: "JGwWNGJdvx8" },
  { id: 40, title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", year: 2017, youtubeId: "kJQP7kiw5Fk" },
  { id: 41, title: "Old Town Road", artist: "Lil Nas X ft. Billy Ray Cyrus", year: 2019, youtubeId: "r7qovpFAGrQ" },
  { id: 42, title: "Blinding Lights", artist: "The Weeknd", year: 2019, youtubeId: "4NRXx6U8ABQ" },
  { id: 43, title: "Bad Guy", artist: "Billie Eilish", year: 2019, youtubeId: "DyDfgMOUjCI" },
  { id: 44, title: "Shallow", artist: "Lady Gaga & Bradley Cooper", year: 2018, youtubeId: "bo_efYhYU2A" },
  
  // 2020s
  { id: 45, title: "Levitating", artist: "Dua Lipa", year: 2020, youtubeId: "TUVcZfQe-Kw" },
  { id: 46, title: "drivers license", artist: "Olivia Rodrigo", year: 2021, youtubeId: "ZmDBbnmKpqQ" },
  { id: 47, title: "As It Was", artist: "Harry Styles", year: 2022, youtubeId: "H5v3kku4y6Q" },
  { id: 48, title: "Anti-Hero", artist: "Taylor Swift", year: 2022, youtubeId: "b1kbLwvqugk" },
  { id: 49, title: "Flowers", artist: "Miley Cyrus", year: 2023, youtubeId: "G7KNmW9a75Y" },
  { id: 50, title: "Espresso", artist: "Sabrina Carpenter", year: 2024, youtubeId: "eVli-tstM5E" }
];

const GombifulGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('setup'); // setup, playing, won
  const [numPlayers, setNumPlayers] = useState(1);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableSongs, setAvailableSongs] = useState([...DEMO_SONGS]);
  const [placementIndex, setPlacementIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [winner, setWinner] = useState(null);


  // Játék inicializálása
  const startGame = () => {
    const newPlayers = Array(numPlayers).fill(null).map((_, i) => ({
      id: i,
      name: `Játékos ${i + 1}`,
      timeline: [availableSongs[i]],
      tokens: 2,
      score: 1,
      correctStreak: 0
    }));
    
    const usedSongs = availableSongs.slice(0, numPlayers);
    const remaining = availableSongs.slice(numPlayers);
    
    setPlayers(newPlayers);
    setAvailableSongs(remaining);
    setGameState('playing');
    
    // Első dal húzása a maradék dalokból
    if (remaining.length > 0) {
      const randomIndex = Math.floor(Math.random() * remaining.length);
      const song = remaining[randomIndex];
      setCurrentSong(song);
      setAvailableSongs(remaining.filter((_, i) => i !== randomIndex));
    }
    
    setPlacementIndex(null);
    setShowResult(false);
    setIsPlaying(false);
  };

  // Új dal húzása
  const drawNewSong = () => {
    setIsPlaying(false);

    if (availableSongs.length === 0) {
      setAvailableSongs([...DEMO_SONGS]);
    }
    
    const shuffled = [...availableSongs];
    const randomIndex = Math.floor(Math.random() * shuffled.length);
    const song = shuffled[randomIndex];
    
    setCurrentSong(song);
    setAvailableSongs(shuffled.filter((_, i) => i !== randomIndex));
    setPlacementIndex(null);
    setShowResult(false);
  };

  // Zene lejátszása (a gomb csak vizuális visszajelzést ad, az iframe automatikusan újratöltődik)
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Kártya elhelyezése az idővonalon
  const placeCard = (index) => {
    setPlacementIndex(index);
  };

  // Elhelyezés megerősítése
  const confirmPlacement = () => {
    if (placementIndex === null) return;

    const currentPlayer = players[currentPlayerIndex];
    const timeline = currentPlayer.timeline;
    
    // Ellenőrzés: jó helyre került-e
    let correct = true;
    
    if (placementIndex > 0) {
      const prevYear = timeline[placementIndex - 1].year;
      if (currentSong.year < prevYear) correct = false;
    }
    
    if (placementIndex < timeline.length) {
      const nextYear = timeline[placementIndex].year;
      if (currentSong.year > nextYear) correct = false;
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const newTimeline = [
        ...timeline.slice(0, placementIndex),
        currentSong,
        ...timeline.slice(placementIndex)
      ];
      
      // Sorozat bónusz: minden 3. helyes válasz után +1 zseton (max 4)
      const newStreak = currentPlayer.correctStreak + 1;
      let newTokens = currentPlayer.tokens;
      
      if (newStreak === 3 && newTokens < 4) {
        newTokens += 1;
      }
      
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex] = {
        ...currentPlayer,
        timeline: newTimeline,
        score: newTimeline.length,
        correctStreak: newStreak === 3 ? 0 : newStreak,
        tokens: newTokens
      };
      
      setPlayers(updatedPlayers);

      // Győzelem ellenőrzése
      if (newTimeline.length >= 10) {
        setWinner(currentPlayer);
        setGameState('won');
        return;
      }
    } else {
      // Rossz válasz esetén nullázni a sorozatot
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex] = {
        ...currentPlayer,
        correctStreak: 0
      };
      setPlayers(updatedPlayers);
    }

    // Következő játékos
    setTimeout(() => {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % numPlayers);
      drawNewSong();
    }, 2000);
  };

  // Zseton használata - dal kihagyása
  const useTokenToSkip = () => {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.tokens > 0) {
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex] = {
        ...currentPlayer,
        tokens: currentPlayer.tokens - 1
      };
      setPlayers(updatedPlayers);
      drawNewSong();
    }
  };

  // Zseton használata - 3 zsetonért automatikus kártya
  const useTokensForAutoCard = () => {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.tokens >= 3 && availableSongs.length > 0) {
      const song = availableSongs[0];
      const newTimeline = [...currentPlayer.timeline, song];
      newTimeline.sort((a, b) => a.year - b.year);
      
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex] = {
        ...currentPlayer,
        timeline: newTimeline,
        tokens: currentPlayer.tokens - 3,
        score: newTimeline.length
      };
      
      setPlayers(updatedPlayers);
      setAvailableSongs(availableSongs.slice(1));
      
      if (newTimeline.length >= 10) {
        setWinner(currentPlayer);
        setGameState('won');
        return;
      }
      
      setCurrentPlayerIndex((currentPlayerIndex + 1) % numPlayers);
      drawNewSong();
    }
  };

  // Setup képernyő
  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 text-white flex items-center gap-2 hover:text-pink-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Vissza
            </button>
          )}
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <Music className="w-20 h-20 mx-auto text-pink-600 mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Gombifül</h1>
              <p className="text-gray-600">Találd ki, mikor adták ki a zenéket!</p>
            </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Játékosok száma
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setNumPlayers(num)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      numPlayers === num
                        ? 'bg-pink-600 text-white shadow-lg scale-105'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Játék indítása
            </button>
          </div>

          <div className="mt-8 p-4 bg-pink-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-2">Játékszabályok:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Hallgasd meg a számot</li>
              <li>• Helyezd el időrendben az idővonaladon</li>
              <li>• 10 helyes kártya = győzelem!</li>
              <li>• 🔥 Minden 3. helyes tipp után +1 zseton (max 4)</li>
              <li>• 🪙 Használj zsetonokat: Kihagyás (1) vagy Auto kártya (3)</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-pink-200">
              <p className="text-xs text-gray-500">
                🎵 Zenék: YouTube (50+ dal 1954-2024)
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Győzelem képernyő
  if (gameState === 'won' && winner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <Trophy className="w-32 h-32 mx-auto text-yellow-500 mb-6 animate-bounce" />
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Gombifül!</h1>
          <h2 className="text-3xl font-bold text-pink-600 mb-4">{winner.name}</h2>
          <p className="text-xl text-gray-600 mb-8">
            Megnyerte a játékot {winner.score} kártyával!
          </p>
          
          <button
            onClick={() => {
              setGameState('setup');
              setPlayers([]);
              setCurrentPlayerIndex(0);
              setWinner(null);
              setAvailableSongs([...DEMO_SONGS]);
            }}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Új játék
          </button>
        </div>
      </div>
    );
  }

  // Játék képernyő
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 p-4">
      {/* Fejléc */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gombifül</h1>
              <p className="text-sm text-gray-600">Kör: {currentPlayer.name}</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  className={`px-4 py-2 rounded-xl ${
                    idx === currentPlayerIndex
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <div className="font-semibold text-sm">{player.name}</div>
                  <div className="text-xs">
                    🎵 {player.score}/10 | 🪙 {player.tokens} | 🔥 {player.correctStreak}/3
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zenekártya és vezérlés */}
      {currentSong && !showResult && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Hallgasd meg a számot!</h2>
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-6 mb-4">
                <Music className="w-16 h-16 mx-auto text-pink-600 mb-2" />
                <p className="text-gray-600 text-sm mb-4">A cím és előadó csak fordítás után látható</p>
                
                {/* YouTube Player - Simple Embed */}
                {isPlaying && currentSong && (
                  <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      key={currentSong.id}
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${currentSong.youtubeId}?controls=1&modestbranding=1&rel=0`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                
                {!isPlaying && (
                  <div 
                    onClick={togglePlay}
                    className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-8 text-center text-white cursor-pointer hover:scale-105 transition-all hover:shadow-xl"
                  >
                    <Play className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-semibold">Nyomd meg a Lejátszás gombot!</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={togglePlay}
                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Play className="w-6 h-6" />
                {isPlaying ? 'Zene újraindítása' : 'Lejátszás'}
              </button>
            </div>

            {/* Gombifül zsetonok használata */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <button
                onClick={useTokenToSkip}
                disabled={currentPlayer.tokens < 1}
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  currentPlayer.tokens >= 1
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                🪙 Kihagyás (1 zseton)
              </button>
              
              <button
                onClick={useTokensForAutoCard}
                disabled={currentPlayer.tokens < 3}
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  currentPlayer.tokens >= 3
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                🪙 Auto kártya (3 zseton)
              </button>
            </div>

            {/* Idővonalon való elhelyezés */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                Hová helyezed a kártyát az idővonalon?
              </h3>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-4">
                {/* Első pozíció */}
                <button
                  onClick={() => placeCard(0)}
                  className={`min-w-[80px] h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                    placementIndex === 0
                      ? 'bg-pink-200 border-pink-600 scale-110'
                      : 'bg-pink-50 border-pink-300 hover:bg-pink-100'
                  }`}
                >
                  <div className="text-center">
                    <ChevronLeft className="w-6 h-6 mx-auto text-pink-600" />
                    <div className="text-xs font-semibold text-gray-700">Ide?</div>
                  </div>
                </button>

                {/* Meglévő kártyák */}
                {currentPlayer.timeline.map((song, idx) => (
                  <React.Fragment key={song.id}>
                    <div className="min-w-[120px] bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 rounded-xl shadow-lg">
                      <div className="text-xs font-bold mb-1">{song.year}</div>
                      <div className="text-xs font-semibold truncate">{song.title}</div>
                      <div className="text-xs opacity-80 truncate">{song.artist}</div>
                    </div>
                    
                    <button
                      onClick={() => placeCard(idx + 1)}
                      className={`min-w-[80px] h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                        placementIndex === idx + 1
                          ? 'bg-pink-200 border-pink-600 scale-110'
                          : 'bg-pink-50 border-pink-300 hover:bg-pink-100'
                      }`}
                    >
                      <div className="text-center">
                        <ChevronRight className="w-6 h-6 mx-auto text-pink-600" />
                        <div className="text-xs font-semibold text-gray-700">Ide?</div>
                      </div>
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {placementIndex !== null && (
              <button
                onClick={confirmPlacement}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Kártya fordítása és ellenőrzés
              </button>
            )}
          </div>
        </div>
      )}

      {/* Eredmény megjelenítése */}
      {showResult && currentSong && (
        <div className="max-w-6xl mx-auto">
          <div className={`backdrop-blur rounded-2xl p-8 shadow-2xl text-center ${
            isCorrect ? 'bg-green-500/95' : 'bg-red-500/95'
          }`}>
            <h2 className={`text-4xl font-bold mb-4 ${
              isCorrect ? 'text-white' : 'text-white'
            }`}>
              {isCorrect ? '✓ Helyes!' : '✗ Hibás!'}
            </h2>
            
            <div className="bg-white/90 rounded-xl p-6 max-w-md mx-auto">
              <div className="text-2xl font-bold text-gray-800 mb-2">{currentSong.title}</div>
              <div className="text-xl text-gray-600 mb-2">{currentSong.artist}</div>
              <div className="text-3xl font-bold text-pink-600">{currentSong.year}</div>
            </div>

            {isCorrect ? (
              <div className="text-white text-lg mt-4">
                <p>🎉 Megtarthatod a kártyát! ({currentPlayer.score}/10)</p>
                {currentPlayer.correctStreak === 0 && currentPlayer.tokens <= 4 ? (
                  <p className="text-yellow-300 font-bold mt-2">✨ 3 helyes sorozat! +1 zseton! 🪙</p>
                ) : (
                  <p className="text-yellow-200 mt-2">🔥 Sorozat: {currentPlayer.correctStreak}/3</p>
                )}
              </div>
            ) : (
              <p className="text-white text-lg mt-4">
                A kártya visszakerül a dobozba. Próbáld újra!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Összes játékos idővonala - mobile scrollozható */}
      <div className="max-w-6xl mx-auto mt-6">
        <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Összes játékos idővonala</h3>
          
          <div className="space-y-4">
            {players.map((player, idx) => (
              <div key={player.id} className={`p-3 rounded-xl ${
                idx === currentPlayerIndex ? 'bg-pink-100' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">{player.name}</span>
                  <span className="text-sm text-gray-600">🎵 {player.score}/10 | 🪙 {player.tokens} | 🔥 {player.correctStreak}/3</span>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {player.timeline.map((song) => (
                    <div
                      key={song.id}
                      className="min-w-[100px] bg-gradient-to-br from-purple-400 to-pink-400 text-white p-2 rounded-lg shadow text-xs"
                    >
                      <div className="font-bold">{song.year}</div>
                      <div className="truncate font-semibold">{song.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GombifulGame;
