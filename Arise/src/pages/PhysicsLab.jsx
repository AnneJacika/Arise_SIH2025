import React, { useState } from 'react';
import PhysicsGames from '../components/games/physics';

export default function PhysicsLab() {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Physics Lab</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {PhysicsGames.map(game => (
          <div key={game.id} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-4xl mb-2">{game.metadata.icon || '🧲'}</div>
            <div className="font-bold text-lg mb-1">{game.metadata.name || game.id}</div>
            <div className="text-sm text-gray-500 mb-2">{game.metadata.gradeLevel || 'N/A'}</div>
            <button
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700"
              onClick={() => setSelectedGame(game)}
            >
              Play
            </button>
          </div>
        ))}
      </div>

      {/* Modal for selected game */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
            <button
              className="absolute top-6 right-8 text-white hover:text-blue-400 text-4xl font-bold z-50 bg-black/30 rounded-full px-3 py-1"
              onClick={() => setSelectedGame(null)}
              aria-label="Close"
              style={{ backdropFilter: 'blur(2px)' }}
            >
              ×
            </button>
            <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-none sm:rounded-2xl shadow-2xl p-0 sm:p-6 overflow-auto">
              <div className="mb-2 text-5xl pt-8">{selectedGame.metadata.icon || '🧲'}</div>
              <h2 className="text-2xl font-bold mb-2 text-blue-800">{selectedGame.metadata.name || selectedGame.id}</h2>
              <p className="text-blue-500 mb-4">Grade: {selectedGame.metadata.gradeLevel || 'N/A'}</p>
              <selectedGame.Component />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
