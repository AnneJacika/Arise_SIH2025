import React, { useState, useEffect, useRef } from 'react';
import { Brain, Eye, Zap, Trophy, Target, Play } from 'lucide-react';

export function MemoryMatrix() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'showing', 'input', 'gameOver'
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [showingIndex, setShowingIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [difficulty, setDifficulty] = useState('classic');
  const [gridSize, setGridSize] = useState(3);
  const [showTime, setShowTime] = useState(800);
  const [activeCell, setActiveCell] = useState(null);
  const [lives, setLives] = useState(3);
  const [perfectStreak, setPerfectStreak] = useState(0);

  // Grid configurations for different difficulties
  const difficultySettings = {
    classic: { size: 3, showTime: 800, lives: 3 },
    challenge: { size: 4, showTime: 600, lives: 2 },
    master: { size: 5, showTime: 400, lives: 1 }
  };

  // Generate random cell index
  const getRandomCell = () => {
    return Math.floor(Math.random() * (gridSize * gridSize));
  };

  // Start new game
  const startGame = (selectedDifficulty) => {
    const settings = difficultySettings[selectedDifficulty];
    setDifficulty(selectedDifficulty);
    setGridSize(settings.size);
    setShowTime(settings.showTime);
    setLives(settings.lives);
    
    setCurrentLevel(1);
    setScore(0);
    setSequence([]);
    setPlayerSequence([]);
    setFeedback('');
    setPerfectStreak(0);
    setGameState('showing');
    
    // Start with first sequence
    setTimeout(() => {
      nextLevel();
    }, 1000);
  };

  // Generate next level sequence
  const nextLevel = () => {
    const newSequence = [...sequence];
    newSequence.push(getRandomCell());
    setSequence(newSequence);
    setPlayerSequence([]);
    setShowingIndex(0);
    setGameState('showing');
    showSequence(newSequence);
  };

  // Show sequence to player
  const showSequence = (seq) => {
    let index = 0;
    
    const showNext = () => {
      if (index < seq.length) {
        setActiveCell(seq[index]);
        
        setTimeout(() => {
          setActiveCell(null);
          index++;
          
          setTimeout(() => {
            if (index < seq.length) {
              showNext();
            } else {
              // Sequence shown, now player's turn
              setTimeout(() => {
                setGameState('input');
                setFeedback('Your turn! Click the sequence.');
              }, 500);
            }
          }, 200);
        }, showTime);
      }
    };
    
    showNext();
  };

  // Handle cell click
  const handleCellClick = (cellIndex) => {
    if (gameState !== 'input') return;
    
    const newPlayerSequence = [...playerSequence, cellIndex];
    setPlayerSequence(newPlayerSequence);
    
    // Check if current input is correct
    const currentIndex = newPlayerSequence.length - 1;
    if (sequence[currentIndex] !== cellIndex) {
      // Wrong input
      setLives(prev => prev - 1);
      setPerfectStreak(0);
      setFeedback('❌ Wrong! Try to remember the sequence.');
      
      if (lives <= 1) {
        endGame();
      } else {
        setTimeout(() => {
          setFeedback(`${lives - 1} lives remaining. Watch carefully!`);
          showSequence(sequence);
        }, 1500);
      }
      return;
    }
    
    // Check if sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      // Level completed!
      const points = currentLevel * 10 + (perfectStreak * 5);
      setScore(prev => prev + points);
      setPerfectStreak(prev => prev + 1);
      setCurrentLevel(prev => prev + 1);
      setFeedback(`✅ Perfect! +${points} points`);
      
      setTimeout(() => {
        if (currentLevel < 20) {
          setFeedback('Next level!');
          setTimeout(nextLevel, 1000);
        } else {
          // Game completed
          setFeedback('🎉 Amazing! You completed all levels!');
          setTimeout(endGame, 2000);
        }
      }, 1000);
    }
  };

  // End game
  const endGame = () => {
    setGameState('gameOver');
    if (score > bestScore) {
      setBestScore(score);
    }
  };

  // Generate grid cells
  const generateGrid = () => {
    const cells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const isActive = activeCell === i;
      const isInPlayerSequence = playerSequence.includes(i);
      
      cells.push(
        <button
          key={i}
          onClick={() => handleCellClick(i)}
          disabled={gameState !== 'input'}
          className={`
            aspect-square rounded-xl border-2 transition-all duration-200 transform
            ${isActive 
              ? 'bg-blue-500 border-blue-400 scale-95 shadow-lg shadow-blue-500/50' 
              : gameState === 'input' && isInPlayerSequence
                ? 'bg-green-500/50 border-green-400'
                : 'bg-white/10 border-white/30 hover:bg-white/20 hover:scale-105'
            }
            ${gameState === 'input' ? 'cursor-pointer' : 'cursor-not-allowed'}
            disabled:transform-none
          `}
        >
          {gameState === 'input' && isInPlayerSequence && (
            <span className="text-white font-bold text-lg">
              {playerSequence.indexOf(i) + 1}
            </span>
          )}
        </button>
      );
    }
    return cells;
  };

  // Menu screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border border-white/20">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🧠</div>
            <h1 className="text-4xl font-bold text-white mb-2">Memory Matrix</h1>
            <p className="text-blue-200">Test your memory with increasingly complex patterns!</p>
          </div>
          
          {/* Best score */}
          {bestScore > 0 && (
            <div className="text-center mb-6">
              <div className="bg-white/10 rounded-xl p-4 inline-block">
                <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-2">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">Best Score</span>
                </div>
                <div className="text-2xl font-bold text-white">{bestScore}</div>
              </div>
            </div>
          )}
          
          {/* Difficulty selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-4">Choose Difficulty</h2>
            
            <button
              onClick={() => startGame('classic')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Brain className="w-6 h-6" />
                <span className="text-xl">Classic</span>
              </div>
              <div className="text-sm opacity-80">3×3 grid • 3 lives • 800ms display</div>
            </button>
            
            <button
              onClick={() => startGame('challenge')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-6 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Zap className="w-6 h-6" />
                <span className="text-xl">Challenge</span>
              </div>
              <div className="text-sm opacity-80">4×4 grid • 2 lives • 600ms display</div>
            </button>
            
            <button
              onClick={() => startGame('master')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-6 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Target className="w-6 h-6" />
                <span className="text-xl">Master</span>
              </div>
              <div className="text-sm opacity-80">5×5 grid • 1 life • 400ms display</div>
            </button>
          </div>
          
          {/* How to play */}
          <div className="mt-8 bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Watch the sequence of highlighted cells</li>
              <li>• Click the cells in the same order</li>
              <li>• Each level adds one more cell to remember</li>
              <li>• Perfect streaks give bonus points!</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameState === 'gameOver') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full border border-white/20">
          <div className="text-6xl mb-4">
            {currentLevel >= 20 ? '🏆' : currentLevel >= 15 ? '🥈' : currentLevel >= 10 ? '🥉' : '🧠'}
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            {currentLevel >= 20 ? 'Perfect Memory!' : 'Game Over'}
          </h1>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-blue-200 mb-1">Final Score</div>
              <div className="text-3xl font-bold text-white">{score}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs text-blue-200 mb-1">Level Reached</div>
                <div className="text-2xl font-bold text-white">{currentLevel}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs text-blue-200 mb-1">Perfect Streak</div>
                <div className="text-2xl font-bold text-white">{perfectStreak}</div>
              </div>
            </div>
            
            {score === bestScore && score > 0 && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30">
                <div className="text-yellow-400 font-bold">🎉 New Best Score! 🎉</div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => startGame(difficulty)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Play Again
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-bold">{score}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-white font-bold">Level {currentLevel}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
            <span className="text-white font-bold capitalize">{difficulty}</span>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
            <div className="flex items-center space-x-1">
              {Array.from({ length: difficultySettings[difficulty].lives }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < lives ? 'bg-red-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Game status */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 inline-block border border-white/20 min-w-[300px]">
            <div className="text-white text-lg font-semibold">
              {gameState === 'showing' && (
                <div className="flex items-center justify-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <span>Watch the sequence...</span>
                </div>
              )}
              {gameState === 'input' && (
                <div className="flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5 text-green-400" />
                  <span>Your turn!</span>
                </div>
              )}
            </div>
            {feedback && (
              <div className="text-gray-200 text-sm mt-2">{feedback}</div>
            )}
          </div>
        </div>

        {/* Game grid */}
        <div className="flex justify-center mb-8">
          <div 
            className="grid gap-3 p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              width: 'fit-content'
            }}
          >
            {generateGrid()}
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Sequence Progress</span>
              <span>{playerSequence.length}/{sequence.length}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: sequence.length > 0 ? `${(playerSequence.length / sequence.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-white">{sequence.length}</div>
            <div className="text-sm text-gray-300">Sequence Length</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-white">{perfectStreak}</div>
            <div className="text-sm text-gray-300">Perfect Streak</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-white">{bestScore}</div>
            <div className="text-sm text-gray-300">Best Score</div>
          </div>
        </div>

        {/* Back to menu */}
        <div className="text-center">
          <button
            onClick={() => setGameState('menu')}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all duration-200"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

// Export metadata for Playground listing
export const metadata = {
  name: "Memory Matrix",
  gradeLevel: "6-12",
  category: "Memory",
  icon: "🧠"
};