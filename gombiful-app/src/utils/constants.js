// Game constants and configuration

// Songs database - YouTube music from 1950s to 2020s
export const DEMO_SONGS = [
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

// Game configuration
export const GAME_CONFIG = {
  WINNING_SCORE: 10,                  // Cards needed to win
  INITIAL_TOKENS: 2,                  // Starting tokens per player
  MAX_TOKENS: 4,                      // Maximum tokens a player can have
  STREAK_FOR_TOKEN: 3,                // Correct answers needed for bonus token
  TOKEN_COST_SKIP: 1,                 // Cost to skip a song
  TOKEN_COST_AUTO: 3,                 // Cost for auto-placement card
  MIN_PLAYERS: 1,                     // Minimum players to start (TEMPORARILY SET TO 1 FOR TESTING)
  MAX_PLAYERS: 8,                     // Maximum players per game
  ROOM_CODE_LENGTH: 8,                // Length of room code (with dash: XXXX-XXXX)
  GAME_TIMEOUT_MINUTES: 30,           // Auto-cleanup inactive games
  ANSWER_TIME_LIMIT: null,            // Optional time limit per round (null = unlimited)
};

// Game states
export const GAME_STATUS = {
  LOBBY: 'lobby',                     // Waiting for players
  PLAYING: 'playing',                 // Game in progress
  REVEALING: 'revealing',             // Showing results of round
  ENDED: 'ended'                      // Game finished
};

// Player roles
export const PLAYER_ROLES = {
  DJ: 'dj',                           // Game host/admin
  PLAYER: 'player'                    // Regular player
};

// Round states (for players)
export const ROUND_STATUS = {
  LISTENING: 'listening',             // DJ playing song
  ANSWERING: 'answering',             // Players can submit answers
  WAITING: 'waiting',                 // Waiting for other players
  REVEALING: 'revealing'              // Showing results
};
