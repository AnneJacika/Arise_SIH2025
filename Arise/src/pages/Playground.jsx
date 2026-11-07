import React, { useState } from 'react';
import games from '../components/games';



// Dynamically collect categories from games metadata
const categories = [
    "All",
    ...Array.from(new Set(games.flatMap(g => g.metadata.category ? [g.metadata.category] : [])))
];

// GameCard uses metadata and Play button logic
const GameCard = ({ game, onPlay }) => (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-5 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300 group">
        <div className="text-orange-500 mb-3 group-hover:animate-bounce">{game.metadata.icon || <span role="img" aria-label="game">🎮</span>}</div>
        <h3 className="font-bold text-slate-800 text-lg mb-1">{game.metadata.name || game.id}</h3>
        <p className="text-sm text-slate-500 mb-4">Grade: {game.metadata.gradeLevel || 'N/A'}</p>
        <button
            className="w-full mt-auto bg-orange-500 text-white font-bold py-2 px-4 rounded-xl shadow-md hover:bg-orange-600 transition-colors duration-300"
            onClick={() => onPlay(game)}
        >
            Play
        </button>
    </div>
);


export default function Playground() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedGame, setSelectedGame] = useState(null);

    const filteredGames = games.filter(
        g => activeCategory === "All" || g.metadata.category === activeCategory
    );

    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-0 z-0 opacity-50">
                <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200/50 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-200/50 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 mb-3">
                        Welcome to the <span className="text-orange-500">Learning Playground</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                        Discover fun, interactive games designed for students of Odisha. All games are available offline.
                    </p>
                </header>

                {/* Category Filters */}
                <div className="flex justify-center flex-wrap gap-3 mb-10">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 shadow-sm ${
                                activeCategory === category
                                    ? 'bg-orange-500 text-white shadow-lg'
                                    : 'bg-white/80 text-slate-700 hover:bg-white'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredGames.length === 0 ? (
                        <div className="col-span-full text-center text-slate-400 text-lg py-12">No games found. Add .jsx files to <code>src/components/games/</code>!</div>
                    ) : (
                        filteredGames.map(game => (
                            <GameCard key={game.id} game={game} onPlay={setSelectedGame} />
                        ))
                    )}
                </div>

                {/* Modal for selected game */}
                        {selectedGame && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
                                    <button
                                        className="absolute top-6 right-8 text-white hover:text-orange-400 text-4xl font-bold z-50 bg-black/30 rounded-full px-3 py-1"
                                        onClick={() => setSelectedGame(null)}
                                        aria-label="Close"
                                        style={{ backdropFilter: 'blur(2px)' }}
                                    >
                                        ×
                                    </button>
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-none sm:rounded-2xl shadow-2xl p-0 sm:p-6 overflow-auto">
                                        <div className="mb-2 text-5xl pt-8">{selectedGame.metadata.icon || '🎮'}</div>
                                        <h2 className="text-2xl font-bold mb-2 text-slate-800">{selectedGame.metadata.name || selectedGame.id}</h2>
                                        <p className="text-slate-500 mb-4">Grade: {selectedGame.metadata.gradeLevel || 'N/A'}</p>
                                        <div className="flex-1 w-full h-full flex items-center justify-center">
                                            <selectedGame.Component />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
            </main>
        </div>
    );
}
