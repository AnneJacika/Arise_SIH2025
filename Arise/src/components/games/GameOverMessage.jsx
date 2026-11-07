import React from "react";

export default function GameOverMessage({ onPlayAgain }) {
  return (
    <div className="text-center mt-8 p-8 bg-gradient-to-r from-purple-100 to-violet-200 
                    rounded-3xl shadow-xl animate-fade-in">
      <h2 className="text-purple-800 font-bold text-2xl mb-6">
        🎉 Congratulations! You matched all items! 🎉
      </h2>
      <button
        onClick={onPlayAgain}
        className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-md
                   transition-all duration-300 transform
                   hover:bg-purple-700 hover:scale-105 active:scale-95"
      >
        🔄 Play Again
      </button>
    </div>
  );
}
