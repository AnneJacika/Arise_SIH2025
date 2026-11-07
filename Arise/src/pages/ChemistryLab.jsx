import React from 'react';
import ChemistryGames from '../components/games/chemistry';

export default function ChemistryLab() {
  return (
    <div className="min-h-screen bg-green-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-green-800">Chemistry Lab</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {ChemistryGames.map(game => (
          <div key={game.id} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-4xl mb-2">{game.metadata.icon || '⚗️'}</div>
            <div className="font-bold text-lg mb-1">{game.metadata.name || game.id}</div>
            <div className="text-sm text-gray-500 mb-2">{game.metadata.gradeLevel || 'N/A'}</div>
            {/* Add Play logic/modal as in Playground if needed */}
          </div>
        ))}
      </div>
    </div>
  );
}
