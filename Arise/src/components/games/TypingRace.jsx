import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Trophy, Zap, Target, Clock, TrendingUp } from 'lucide-react';

export function TypingRace() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'finished'
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [bestWpm, setBestWpm] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const inputRef = useRef(null);

  // Text samples for different difficulties
  const textSamples = {
    easy: [
      "The quick brown fox jumps over the lazy dog near the old oak tree.",
      "She sells sea shells by the sea shore on a sunny summer day.",
      "A journey of a thousand miles begins with a single step forward.",
      "The early bird catches the worm but the second mouse gets the cheese.",
      "Life is what happens to you while you are busy making other plans."
    ],
    medium: [
      "Technology has revolutionized the way we communicate, work, and live our daily lives in countless ways.",
      "Scientists have discovered that regular exercise not only improves physical health but also enhances mental well-being.",
      "The ancient pyramids of Egypt continue to mystify archaeologists and historians with their incredible precision and scale.",
      "Climate change represents one of the most significant challenges facing humanity in the twenty-first century.",
      "Artificial intelligence and machine learning are transforming industries from healthcare to transportation worldwide."
    ],
    hard: [
      "Quantum mechanics, with its counterintuitive principles of superposition and entanglement, challenges our fundamental understanding of reality itself.",
      "The philosopher's contemplation of existential questions regarding consciousness, free will, and the meaning of existence has persisted throughout history.",
      "Cryptocurrency and blockchain technologies are revolutionizing financial systems by providing decentralized, transparent, and secure transaction methods.",
      "Neuroscientists are beginning to unravel the complex mechanisms underlying memory formation, consciousness, and the intricate workings of the human brain.",
      "The intersection of biotechnology and ethics raises profound questions about genetic engineering, human enhancement, and the future of our species."
    ]
  };

  // Start typing test
  const startTest = (selectedDifficulty) => {
    const samples = textSamples[selectedDifficulty];
    const randomText = samples[Math.floor(Math.random() * samples.length)];
    
    setDifficulty(selectedDifficulty);
    setCurrentText(randomText);
    setUserInput('');
    setCurrentIndex(0);
    setErrors(0);
    setTotalChars(0);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
    setGameState('playing');
    setStartTime(Date.now());
    setEndTime(null);
    
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (!startTime) {
      setStartTime(Date.now());
    }
    
    setUserInput(value);
    setTotalChars(value.length);
    
    // Count errors
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== currentText[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);
    
    // Update current index for highlighting
    setCurrentIndex(value.length);
    
    // Calculate accuracy
    const accuracyPercent = value.length > 0 ? Math.max(0, ((value.length - errorCount) / value.length) * 100) : 100;
    setAccuracy(Math.round(accuracyPercent));
    
    // Check if completed
    if (value === currentText) {
      finishTest();
    }
  };

  // Finish test
  const finishTest = () => {
    const endTime = Date.now();
    setEndTime(endTime);
    
    const timeInMinutes = (endTime - startTime) / 60000;
    const wordsTyped = currentText.split(' ').length;
    const calculatedWpm = Math.round(wordsTyped / timeInMinutes);
    
    setWpm(calculatedWpm);
    setGameState('finished');
    
    // Update best scores
    if (calculatedWpm > bestWpm) {
      setBestWpm(calculatedWpm);
    }
    if (accuracy > bestAccuracy) {
      setBestAccuracy(accuracy);
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && startTime) {
      timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setTimeElapsed(elapsed);
        
        // Calculate real-time WPM
        if (elapsed > 0) {
          const wordsTyped = userInput.split(' ').filter(word => word.length > 0).length;
          const minutes = elapsed / 60;
          const currentWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
          setWpm(currentWpm);
        }
      }, 100);
    }
    
    return () => clearInterval(timer);
  }, [gameState, startTime, userInput]);

  // Render character with styling
  const renderChar = (char, index) => {
    let className = 'text-lg ';
    
    if (index < userInput.length) {
      // Already typed
      if (userInput[index] === char) {
        className += 'text-green-400 bg-green-400/20';
      } else {
        className += 'text-red-400 bg-red-400/20';
      }
    } else if (index === userInput.length) {
      // Current character
  className += 'text-blue-900 bg-blue-200 animate-pulse';
    } else {
      // Not yet typed
      className += 'text-gray-400';
    }
    
    return (
      <span key={index} className={className}>
        {char === ' ' ? '·' : char}
      </span>
    );
  };

  // Menu screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border border-white/20">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⌨️</div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Typing Race</h1>
            <p className="text-blue-200">Test your typing speed and accuracy!</p>
          </div>
          
          {/* Best scores */}
          {(bestWpm > 0 || bestAccuracy > 0) && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-2">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-semibold">Best WPM</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{bestWpm}</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-semibold">Best Accuracy</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{bestAccuracy}%</div>
              </div>
            </div>
          )}
          
          {/* Difficulty selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-blue-900 text-center mb-4">Choose Difficulty</h2>
            
            <button
              onClick={() => startTest('easy')}
              className="w-full bg-gradient-to-r from-green-200 to-emerald-200 hover:from-green-300 hover:to-emerald-300 text-green-900 font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="text-xl mb-1">🐌 Easy</div>
              <div className="text-sm opacity-80">Simple words and phrases</div>
            </button>
            
            <button
              onClick={() => startTest('medium')}
              className="w-full bg-gradient-to-r from-blue-200 to-indigo-200 hover:from-blue-300 hover:to-indigo-300 text-blue-900 font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="text-xl mb-1">🚀 Medium</div>
              <div className="text-sm opacity-80">Longer sentences with variety</div>
            </button>
            
            <button
              onClick={() => startTest('hard')}
              className="w-full bg-gradient-to-r from-red-200 to-pink-200 hover:from-red-300 hover:to-pink-300 text-red-900 font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <div className="text-xl mb-1">🔥 Hard</div>
              <div className="text-sm opacity-80">Complex vocabulary and concepts</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Finished screen
  if (gameState === 'finished') {
    const timeInMinutes = (endTime - startTime) / 60000;
    const wordsPerMinute = wpm;
    const charactersPerMinute = Math.round(totalChars / timeInMinutes);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-2xl w-full border border-white/20">
          <div className="text-6xl mb-4">
            {wpm >= 60 ? '🏆' : wpm >= 40 ? '🥈' : wpm >= 25 ? '🥉' : '⌨️'}
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-6">Race Complete!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-2 text-blue-400 mb-3">
                <Zap className="w-6 h-6" />
                <span className="text-lg font-semibold">Speed</span>
              </div>
              <div className="text-4xl font-bold text-blue-900 mb-2">{wordsPerMinute}</div>
              <div className="text-sm text-gray-300">Words per minute</div>
              <div className="text-xs text-gray-400 mt-1">{charactersPerMinute} CPM</div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-2 text-green-400 mb-3">
                <Target className="w-6 h-6" />
                <span className="text-lg font-semibold">Accuracy</span>
              </div>
              <div className="text-4xl font-bold text-blue-900 mb-2">{accuracy}%</div>
              <div className="text-sm text-gray-300">{errors} errors</div>
              <div className="text-xs text-gray-400 mt-1">out of {totalChars} characters</div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-2 text-orange-400 mb-3">
                <Clock className="w-6 h-6" />
                <span className="text-lg font-semibold">Time</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">{Math.round(timeElapsed)}s</div>
              <div className="text-sm text-gray-300">Total time</div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-2 text-purple-400 mb-3">
                <TrendingUp className="w-6 h-6" />
                <span className="text-lg font-semibold">Level</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-2 capitalize">{difficulty}</div>
              <div className="text-sm text-gray-300">
                {difficulty === 'easy' && 'Great start!'}
                {difficulty === 'medium' && 'Well done!'}
                {difficulty === 'hard' && 'Impressive!'}
              </div>
            </div>
          </div>
          
          {/* Performance feedback */}
          <div className="bg-white/10 rounded-xl p-4 mb-6">
            <div className="text-blue-900 font-semibold mb-2">Performance Rating</div>
            <div className="text-2xl">
              {wpm >= 80 && accuracy >= 95 ? '🌟 Lightning Fast!' :
               wpm >= 60 && accuracy >= 90 ? '⚡ Excellent!' :
               wpm >= 40 && accuracy >= 85 ? '🚀 Good Job!' :
               wpm >= 25 && accuracy >= 75 ? '👍 Keep Practicing!' :
               '💪 Room for Improvement!'}
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => startTest(difficulty)}
              className="w-full bg-gradient-to-r from-green-200 to-emerald-200 hover:from-green-300 hover:to-emerald-300 text-green-900 font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Race Again
            </button>
            
            <button
              onClick={() => setGameState('menu')}
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold py-3 px-6 rounded-xl transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-blue-900 font-bold">{wpm} WPM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-blue-900 font-bold">{accuracy}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-blue-900 font-bold">{Math.round(timeElapsed)}s</span>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
            <span className="text-blue-900 font-bold capitalize">{difficulty}</span>
          </div>
        </div>

        {/* Text display */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <div className="font-mono text-lg leading-relaxed mb-6 p-4 bg-black/20 rounded-xl min-h-[120px]">
            {currentText.split('').map((char, index) => renderChar(char, index))}
          </div>
          
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Progress</span>
              <span>{userInput.length}/{currentText.length} characters</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(userInput.length / currentText.length) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Input */}
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            className="w-full h-32 bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 font-mono text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Start typing here..."
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-white">{errors}</div>
            <div className="text-sm text-gray-300">Errors</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-white">{Math.round((userInput.length / timeElapsed) * 60) || 0}</div>
            <div className="text-sm text-gray-300">CPM</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-white">{userInput.split(' ').filter(w => w.length > 0).length}</div>
            <div className="text-sm text-gray-300">Words</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-white">{Math.round(((userInput.length - errors) / userInput.length) * 100) || 100}</div>
            <div className="text-sm text-gray-300">Precision</div>
          </div>
        </div>

        {/* Controls */}
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
  name: "Typing Race",
  gradeLevel: "6-12",
  category: "Skills",
  icon: "⌨️"
};