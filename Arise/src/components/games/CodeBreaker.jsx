import React, { useState, useEffect } from 'react';
import { Lock, Key, Target, Trophy, Eye, Brain } from 'lucide-react';

export function CodeBreaker() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'won', 'lost'
  const [secretCode, setSecretCode] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [guessHistory, setGuessHistory] = useState([]);
  const [attemptsLeft, setAttemptsLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [difficulty, setDifficulty] = useState('beginner');
  const [gamesWon, setGamesWon] = useState(0);
  const [totalGames, setTotalGames] = useState(0);

  // Game configurations
  const difficultySettings = {
    beginner: { 
      codeLength: 4, 
      colors: ['🔴', '🟡', '🔵', '🟢', '🟣', '🟠'],
      maxAttempts: 12,
      duplicatesAllowed: false
    },
    intermediate: { 
      codeLength: 4, 
      colors: ['🔴', '🟡', '🔵', '🟢', '🟣', '🟠', '🟤', '⚪'],
      maxAttempts: 10,
      duplicatesAllowed: true
    },
    expert: { 
      codeLength: 5, 
      colors: ['🔴', '🟡', '🔵', '🟢', '🟣', '🟠', '🟤', '⚪'],
      maxAttempts: 8,
      duplicatesAllowed: true
    }
  };

  // Generate secret code
  const generateSecretCode = (settings) => {
    const code = [];
    const availableColors = [...settings.colors];
    
    for (let i = 0; i < settings.codeLength; i++) {
      if (settings.duplicatesAllowed) {
        const randomColor = settings.colors[Math.floor(Math.random() * settings.colors.length)];
        code.push(randomColor);
      } else {
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        code.push(availableColors[randomIndex]);
        availableColors.splice(randomIndex, 1);
      }
    }
    
    return code;
  };

  // Start new game
  const startGame = (selectedDifficulty) => {
    const settings = difficultySettings[selectedDifficulty];
    const newSecretCode = generateSecretCode(settings);
    
    setDifficulty(selectedDifficulty);
    setSecretCode(newSecretCode);
    setCurrentGuess(Array(settings.codeLength).fill(''));
    setGuessHistory([]);
    setAttemptsLeft(settings.maxAttempts);
    setGameState('playing');
    setScore(0);
  };

  // Add color to current guess
  const addColorToGuess = (color) => {
    const settings = difficultySettings[difficulty];
    const emptyIndex = currentGuess.findIndex(slot => slot === '');
    
    if (emptyIndex !== -1) {
      const newGuess = [...currentGuess];
      newGuess[emptyIndex] = color;
      setCurrentGuess(newGuess);
    }
  };

  // Remove last color from guess
  const removeLastColor = () => {
    const newGuess = [...currentGuess];
    for (let i = newGuess.length - 1; i >= 0; i--) {
      if (newGuess[i] !== '') {
        newGuess[i] = '';
        break;
      }
    }
    setCurrentGuess(newGuess);
  };

  // Clear current guess
  const clearGuess = () => {
    const settings = difficultySettings[difficulty];
    setCurrentGuess(Array(settings.codeLength).fill(''));
  };

  // Check guess and provide feedback
  const checkGuess = () => {
    if (currentGuess.includes('')) return; // Incomplete guess
    
    let exactMatches = 0; // Right color, right position
    let colorMatches = 0; // Right color, wrong position
    
    const secretCopy = [...secretCode];
    const guessCopy = [...currentGuess];
    
    // First pass: find exact matches
    for (let i = 0; i < secretCode.length; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        exactMatches++;
        secretCopy[i] = null;
        guessCopy[i] = null;
      }
    }
    
    // Second pass: find color matches
    for (let i = 0; i < guessCopy.length; i++) {
      if (guessCopy[i] !== null) {
        const matchIndex = secretCopy.findIndex(color => color === guessCopy[i]);
        if (matchIndex !== -1) {
          colorMatches++;
          secretCopy[matchIndex] = null;
        }
      }
    }
    
    const feedback = { exactMatches, colorMatches };
    const newHistory = [...guessHistory, { guess: [...currentGuess], feedback }];
    
    setGuessHistory(newHistory);
    
    // Calculate score for this guess
    const guessScore = exactMatches * 10 + colorMatches * 5;
    setScore(prev => prev + guessScore);
    
    // Check win condition
    if (exactMatches === secretCode.length) {
      // Won!
      const bonusPoints = attemptsLeft * 20; // Bonus for remaining attempts
      const finalScore = score + guessScore + bonusPoints;
      setScore(finalScore);
      setGamesWon(prev => prev + 1);
      setTotalGames(prev => prev + 1);
      
      if (finalScore > bestScore) {
        setBestScore(finalScore);
      }
      
      setGameState('won');
      return;
    }
    
    // Check lose condition
    if (attemptsLeft <= 1) {
      setTotalGames(prev => prev + 1);
      setGameState('lost');
      return;
    }
    
    // Continue game
    setAttemptsLeft(prev => prev - 1);
    clearGuess();
  };

  // Render feedback pegs
  const renderFeedback = (feedback) => {
    const pegs = [];
    
    // Add black pegs for exact matches
    for (let i = 0; i < feedback.exactMatches; i++) {
      pegs.push(<div key={`exact-${i}`} className="w-3 h-3 bg-black rounded-full" />);
    }
    
    // Add white pegs for color matches
    for (let i = 0; i < feedback.colorMatches; i++) {
      pegs.push(<div key={`color-${i}`} className="w-3 h-3 bg-white rounded-full border border-gray-400" />);
    }
    
    // Fill remaining slots with empty pegs
    while (pegs.length < 4) {
      pegs.push(<div key={`empty-${pegs.length}`} className="w-3 h-3 bg-gray-600 rounded-full opacity-30" />);
    }
    
    return pegs;
  };

  // Menu screen
  if (gameState === 'menu') {
    const winRate = totalGames > 0 ? Math.round((gamesWon / totalGames) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border border-white/20">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-4xl font-bold text-white mb-2">Code Breaker</h1>
            <p className="text-blue-200">Crack the secret code using logic and deduction!</p>
          </div>
          
          {/* Stats */}
          {totalGames > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{bestScore}</div>
                <div className="text-sm text-gray-300">Best Score</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{gamesWon}</div>
                <div className="text-sm text-gray-300">Games Won</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{winRate}%</div>
                <div className="text-sm text-gray-300">Win Rate</div>
              </div>
            </div>
          )}
          
          {/* Difficulty selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-4">Choose Difficulty</h2>
            
            <button
              onClick={() => startGame('beginner')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Key className="w-6 h-6" />
                <span className="text-xl">Beginner</span>
              </div>
              <div className="text-sm opacity-80">4 colors • 6 options • 12 attempts • No duplicates</div>
            </button>
            
            <button
              onClick={() => startGame('intermediate')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-6 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Lock className="w-6 h-6" />
                <span className="text-xl">Intermediate</span>
              </div>
              <div className="text-sm opacity-80">4 colors • 8 options • 10 attempts • Duplicates allowed</div>
            </button>
            
            <button
              onClick={() => startGame('expert')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-6 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Brain className="w-6 h-6" />
                <span className="text-xl">Expert</span>
              </div>
              <div className="text-sm opacity-80">5 colors • 8 options • 8 attempts • Duplicates allowed</div>
            </button>
          </div>
          
          {/* How to play */}
          <div className="mt-8 bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-3">How to Play:</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <div>• Try to guess the secret color code</div>
              <div>• After each guess, you get feedback pegs:</div>
              <div className="ml-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-black rounded-full"></div>
                <span>= Right color, right position</span>
              </div>
              <div className="ml-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full border border-gray-400"></div>
                <span>= Right color, wrong position</span>
              </div>
              <div>• Use logic to deduce the secret code!</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Win screen
  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full border border-white/20">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-white mb-4">Code Cracked!</h1>
          
          {/* Secret code reveal */}
          <div className="mb-6">
            <div className="text-lg text-white mb-2">The secret code was:</div>
            <div className="flex justify-center space-x-2 mb-4">
              {secretCode.map((color, index) => (
                <div key={index} className="text-4xl">
                  {color}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-blue-200 mb-1">Final Score</div>
              <div className="text-3xl font-bold text-white">{score}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs text-blue-200 mb-1">Attempts Used</div>
                <div className="text-2xl font-bold text-white">{difficultySettings[difficulty].maxAttempts - attemptsLeft}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs text-blue-200 mb-1">Difficulty</div>
                <div className="text-lg font-bold text-white capitalize">{difficulty}</div>
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

  // Lose screen
  if (gameState === 'lost') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full border border-white/20">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-white mb-4">Code Unbroken!</h1>
          
          {/* Secret code reveal */}
          <div className="mb-6">
            <div className="text-lg text-white mb-2">The secret code was:</div>
            <div className="flex justify-center space-x-2 mb-4">
              {secretCode.map((color, index) => (
                <div key={index} className="text-4xl">
                  {color}
                </div>
              ))}
            </div>
            <div className="text-gray-300 text-sm">Better luck next time!</div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-blue-200 mb-1">Score</div>
              <div className="text-3xl font-bold text-white">{score}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs text-blue-200 mb-1">Attempts Used</div>
                <div className="text-2xl font-bold text-white">{difficultySettings[difficulty].maxAttempts}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs text-blue-200 mb-1">Difficulty</div>
                <div className="text-lg font-bold text-white capitalize">{difficulty}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => startGame(difficulty)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Try Again
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
  const settings = difficultySettings[difficulty];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
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
                <span className="text-white font-bold">{attemptsLeft} left</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
            <span className="text-white font-bold capitalize">{difficulty}</span>
          </div>
        </div>

        {/* Game board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            {/* Secret code (hidden) */}
            <div className="mb-6">
              <div className="text-white text-sm mb-2 text-center">Secret Code</div>
              <div className="flex justify-center space-x-2">
                {secretCode.map((_, index) => (
                  <div key={index} className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-600">
                    <Eye className="w-5 h-5 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Guess history */}
            <div className="space-y-2 mb-6">
              {guessHistory.map((entry, index) => (
                <div key={index} className="flex items-center space-x-4 p-2 bg-white/5 rounded-lg">
                  <div className="flex space-x-2">
                    {entry.guess.map((color, colorIndex) => (
                      <div key={colorIndex} className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-2xl">
                        {color}
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-1">
                    {renderFeedback(entry.feedback)}
                  </div>
                </div>
              ))}
            </div>

            {/* Current guess */}
            <div className="mb-6">
              <div className="text-white text-sm mb-2 text-center">Current Guess</div>
              <div className="flex justify-center space-x-2">
                {currentGuess.map((color, index) => (
                  <div key={index} className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl border-2 border-white/30">
                    {color || '?'}
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={checkGuess}
                disabled={currentGuess.includes('')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-all duration-200"
              >
                Check Code
              </button>
              
              <button
                onClick={removeLastColor}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              >
                ⌫
              </button>
              
              <button
                onClick={clearGuess}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Color palette */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white text-sm mb-4 text-center">Available Colors</div>
            <div className="flex flex-wrap justify-center gap-3">
              {settings.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => addColorToGuess(color)}
                  className="w-12 h-12 text-3xl rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-110"
                  disabled={currentGuess.every(slot => slot !== '')}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-4 border border-white/20 inline-block">
            <div className="text-white text-sm">
              <div className="mb-2">🎯 Click colors to build your guess, then check!</div>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                  <span>Right position</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full border border-gray-400"></div>
                  <span>Wrong position</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setGameState('menu')}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-all duration-200"
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
  name: "Code Breaker",
  gradeLevel: "8-12",
  category: "Logic",
  icon: "🔐"
};