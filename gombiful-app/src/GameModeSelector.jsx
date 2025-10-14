import React from 'react';
import { Music, Users, User } from 'lucide-react';

const GameModeSelector = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <Music className="w-24 h-24 mx-auto text-white mb-6 animate-pulse" />
          <h1 className="text-6xl font-bold text-white mb-4">Gombifül</h1>
          <p className="text-xl text-pink-200">Találd ki, mikor adták ki a zenéket!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Single Player Mode */}
          <button
            onClick={() => onSelectMode('single')}
            className="group relative bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform">
                <User className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Egyéni Játék</h2>
              
              <p className="text-gray-600 mb-6">
                Játssz egyedül vagy barátaiddal felváltva ugyanazon az eszközön.
              </p>
              
              <div className="space-y-2 text-sm text-gray-500 text-left">
                <div className="flex items-center">
                  <span className="text-pink-500 mr-2">✓</span>
                  <span>1-4 játékos felváltva</span>
                </div>
                <div className="flex items-center">
                  <span className="text-pink-500 mr-2">✓</span>
                  <span>Azonnal elindítható</span>
                </div>
                <div className="flex items-center">
                  <span className="text-pink-500 mr-2">✓</span>
                  <span>Nincs szükség internetre</span>
                </div>
              </div>

              <div className="mt-6 text-pink-600 font-semibold group-hover:text-pink-700">
                Játék indítása →
              </div>
            </div>
          </button>

          {/* Multiplayer Mode */}
          <button
            onClick={() => onSelectMode('multi')}
            className="group relative bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Többjátékos</h2>
              
              <p className="text-gray-600 mb-6">
                Játssz barátaiddal egyidejűleg! DJ irányítja a zenét, mindenki a saját telefonján válaszol.
              </p>
              
              <div className="space-y-2 text-sm text-gray-500 text-left">
                <div className="flex items-center">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>2-8 játékos egyidejűleg</span>
                </div>
                <div className="flex items-center">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>Valós idejű verseny</span>
                </div>
                <div className="flex items-center">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>DJ üzemmód számítógépre</span>
                </div>
              </div>

              <div className="mt-6">
                <span className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-xs font-semibold mb-2">
                  ✨ ÚJ
                </span>
                <div className="text-purple-600 font-semibold group-hover:text-purple-700">
                  Lobby indítása →
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white/10 backdrop-blur rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-3">📖 Játékszabályok</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-pink-300">1. Hallgasd meg</span>
              <p className="text-pink-100 opacity-80">a zenét a YouTube-ról</p>
            </div>
            <div>
              <span className="font-semibold text-purple-300">2. Helyezd el</span>
              <p className="text-purple-100 opacity-80">időrendben az idővonaladon</p>
            </div>
            <div>
              <span className="font-semibold text-blue-300">3. Nyerj!</span>
              <p className="text-blue-100 opacity-80">Első vagy 10 helyes kártya</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelector;
