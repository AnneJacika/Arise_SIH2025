import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Car, Trophy, Zap, Flag, Gauge } from 'lucide-react';

export function MathRacingChampion() {
  // Generate math problem with multiple choice answers
  const generateProblem = useCallback((level) => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    switch(level) {
      case 1: // Easy
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        break;
      case 2: // Medium
        num1 = Math.floor(Math.random() * 25) + 1;
        num2 = Math.floor(Math.random() * 15) + 1;
        break;
      case 3: // Hard
        num1 = Math.floor(Math.random() * 50) + 5;
        num2 = Math.floor(Math.random() * 20) + 5;
        break;
      default:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
    }
    if (operation === '-' && num1 < num2) {
      [num1, num2] = [num2, num1];
    }
    switch(operation) {
      case '+': answer = num1 + num2; break;
      case '-': answer = num1 - num2; break;
      case '*': answer = num1 * num2; break;
      default:  answer = num1 + num2;
    }
    const wrongAnswers = new Set();
    while (wrongAnswers.size < 2) {
      const offset = (Math.floor(Math.random() * 10) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const wrongAnswer = answer + offset;
      if (wrongAnswer !== answer && wrongAnswer > 0) {
        wrongAnswers.add(wrongAnswer);
      }
    }
    const options = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const correctPosition = options.indexOf(answer);
    return { num1, num2, operation, answer, options, correctPosition };
  }, []);

  // Touch/keyboard car movement helpers
  const moveCarLeft = useCallback(() => {
    setCarPosition(prev => {
      if (prev > 0) {
        setCarAnimation('tilt-left');
      }
      return Math.max(0, prev - 1);
    });
  }, []);

  const moveCarRight = useCallback(() => {
    setCarPosition(prev => {
      if (prev < 2) {
        setCarAnimation('tilt-right');
      }
      return Math.min(2, prev + 1);
    });
  }, []);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver'
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestScore, setBestScore] = useState(
    () => parseInt(localStorage.getItem('mathRacingBestScore') || '0', 10)
  );
  const [difficulty, setDifficulty] = useState(1);
  const [particles, setParticles] = useState([]);
  const [carPosition, setCarPosition] = useState(1); // 0=left, 1=center, 2=right
  const [speed, setSpeed] = useState(1);
  const [roadPosition, setRoadPosition] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [carAnimation, setCarAnimation] = useState('');
  
  const gameRef = useRef(null);
  const animationRef = useRef();
  // Handle keyboard input for car movement
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        setCarPosition(prev => Math.max(0, prev - 1));
        setCarAnimation('tilt-left');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        setCarPosition(prev => Math.min(2, prev + 1));
        setCarAnimation('tilt-right');
      }
    };
    
    const handleKeyUp = (e) => {
        if (['ArrowLeft', 'a', 'A', 'ArrowRight', 'd', 'D'].includes(e.key)) {
            setCarAnimation('');
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Game loop for road/obstacle movement
  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = () => {
        setRoadPosition(prev => (prev + speed * 2) % 2000);

        setObstacles(prev => prev.map(obs => ({
          ...obs,
          y: obs.y + speed * 3
        })));

        animationRef.current = requestAnimationFrame(gameLoop);
      };
      
      animationRef.current = requestAnimationFrame(gameLoop);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [gameState, speed]);

  // Spawn new obstacles when problem changes
  useEffect(() => {
    if (gameState === 'playing' && currentProblem) {
      const newObstacles = currentProblem.options.map((option, index) => ({
        id: Date.now() + index,
        x: index,
        y: -150,
        value: option,
        isCorrect: index === currentProblem.correctPosition
      }));
      setObstacles(newObstacles);
    }
  }, [currentProblem, gameState]);

  const handleCollision = useCallback((obstacle) => {
    const isCorrect = obstacle.isCorrect;
    const splashColor = isCorrect ? '#10b981' : '#ef4444';

    createParticles(
      (gameRef.current.offsetWidth / 3) * (obstacle.x + 0.5),
      450,
      splashColor,
      isCorrect
    );
    
    let nextDifficulty = difficulty;
    if (isCorrect) {
      const points = (10 + combo * 2) * difficulty;
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setSpeed(prev => Math.min(4, prev + 0.1));
      
      if (newStreak > 0 && newStreak % 5 === 0 && difficulty < 3) {
        nextDifficulty = difficulty + 1;
        setDifficulty(nextDifficulty);
      }
    } else {
      setCombo(0);
      setStreak(0);
      setSpeed(prev => Math.max(1, prev - 0.3));
    }
    
    setTimeout(() => {
      setCurrentProblem(generateProblem(nextDifficulty));
    }, 400);

    setObstacles([]); // Clear all obstacles
  }, [combo, difficulty, streak, generateProblem]);
  
  const handleMiss = useCallback(() => {
      setCombo(0);
      setStreak(0);
      setSpeed(prev => Math.max(1, prev - 0.1));
      setCurrentProblem(generateProblem(difficulty));
      setObstacles([]); // Clear all obstacles
  }, [difficulty, generateProblem]);

  // Check for collisions and missed obstacles
  useEffect(() => {
    if (gameState !== 'playing') return;

    const carHitboxY = 450;
    
    // Check for collision
    const collidedObstacle = obstacles.find(obs => 
        obs.x === carPosition && obs.y > carHitboxY && obs.y < carHitboxY + 100
    );
    
    if (collidedObstacle) {
      handleCollision(collidedObstacle);
      return;
    }

    // Check if all obstacles were missed
    if (obstacles.length > 0 && obstacles.every(obs => obs.y > window.innerHeight)) {
        handleMiss();
    }
    
    // Cleanup obstacles that are way off-screen
    if (obstacles.some(obs => obs.y > window.innerHeight + 100)) {
        setObstacles(prev => prev.filter(obs => obs.y < window.innerHeight + 100));
    }

  }, [obstacles, carPosition, gameState, handleCollision, handleMiss]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setStreak(0);
    const initialDifficulty = 1;
    setDifficulty(initialDifficulty);
    setSpeed(1);
    setCarPosition(1);
    setObstacles([]);
    setCurrentProblem(generateProblem(initialDifficulty));
  };

  // Game timer
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  // End game
  const endGame = () => {
    setGameState('gameOver');
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('mathRacingBestScore', score.toString());
    }
  };

  // Create particle effect
  const createParticles = (x, y, color, isCorrect) => {
    const particleCount = isCorrect ? 70 : 35;
    const initialVelocity = isCorrect ? 28 : 18;
    
    const correctColors = ['#10b981', '#34d399', '#a7f3d0', '#fde047', '#ffffff'];
    const incorrectColors = ['#ef4444', '#f87171', '#fb923c', '#fde047'];
    const colorSet = isCorrect ? correctColors : incorrectColors;

    const newParticles = Array.from({ length: particleCount }, () => ({
      id: Math.random(),
      x, 
      y,
      vx: (Math.random() - 0.5) * initialVelocity * (Math.random() + 0.7),
      vy: (Math.random() - 0.7) * initialVelocity, // Bias upwards
      color: colorSet[Math.floor(Math.random() * colorSet.length)],
      life: Math.random() * 0.7 + 0.5, // life between 0.5 and 1.2
      decay: Math.random() * 0.015 + 0.02, // decay between 0.02 and 0.035
      size: Math.random() * 10 + 6
    }));
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Update particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.7, // Stronger gravity
          vx: p.vx * 0.97, // A bit more friction
          life: p.life - p.decay, // Use custom decay
          size: p.size * 0.975
        }))
        .filter(p => p.life > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Render menu
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full border border-white/20">
          <div className="text-6xl mb-4">🏎️</div>
          <h1 className="text-4xl font-bold text-white mb-2">Math Racing</h1>
          <h2 className="text-2xl font-bold text-blue-300 mb-2">Champion</h2>
          <p className="text-blue-200 mb-6">Race through math problems at lightning speed!</p>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Best Score</span>
              </div>
              <div className="text-2xl font-bold text-white">{bestScore}</div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 text-sm text-blue-200">
              <p className="mb-2">🎮 <strong>Controls:</strong></p>
              <p>← → Arrow Keys or A/D to steer</p>
              <p>Drive into the correct answers to score!</p>
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Racing! 🚀
          </button>
        </div>
      </div>
    );
  }

  // Render game over screen
  if (gameState === 'gameOver') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full border border-white/20">
          <div className="text-6xl mb-4">🏁</div>
          <h1 className="text-3xl font-bold text-white mb-2">Race Finished!</h1>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-blue-200 mb-1">Final Score</div>
              <div className="text-3xl font-bold text-white">{score}</div>
            </div>
            
            {score > 0 && score === bestScore && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30">
                <div className="text-yellow-400 font-bold animate-pulse">🏆 New Record! 🏆</div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Race Again!
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

  // Render game
  return (
    <div ref={gameRef} className="min-h-screen bg-slate-900 relative overflow-hidden select-none cursor-none">
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x, top: p.y,
            width: p.size, height: p.size,
            backgroundColor: p.color,
            opacity: p.life,
            transform: `translate(-50%, -50%) scale(${p.life})`,
            boxShadow: `0 0 15px ${p.color}`,
          }}
        />
      ))}
      {/* Road Background */}
      <div className="absolute inset-0 perspective-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gray-800 transform-style-3d rotate-x-[60deg] top-[-20%]">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-16 bg-yellow-400/80 left-[33.33%] translate-x-[-50%]"
              style={{ top: `${(i * 150 + roadPosition) % (20 * 150)}px` }}
            />
          ))}
          {[...Array(20)].map((_, i) => (
            <div
              key={i + 20}
              className="absolute w-2 h-16 bg-yellow-400/80 left-[66.67%] translate-x-[-50%]"
              style={{ top: `${(i * 150 + roadPosition) % (20 * 150)}px` }}
            />
          ))}
        </div>
      </div>

      {/* Game UI */}
      <div className="relative z-10 container mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="bg-black/50 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20 w-28 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Flag className="w-5 h-5 text-green-400" />
              <span className="text-white font-bold text-lg">{score}</span>
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-lg rounded-full px-5 py-3 border-2 border-cyan-400/50">
            <div className="text-white font-bold text-2xl">{timeLeft}s</div>
          </div>
          <div className="bg-black/50 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20 w-28 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold text-lg">{combo}x</span>
            </div>
          </div>
        </div>

        {/* Problem Display */}
        <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 mb-4 text-center border border-white/20">
          <div className="text-3xl font-bold text-white tracking-widest mb-2">
            {currentProblem?.num1} {currentProblem?.operation} {currentProblem?.num2} = ?
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Gauge className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-semibold">
              Speed: {speed.toFixed(1)}x | Level {difficulty}
            </span>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 relative">
          {/* Bottom left/right buttons for touch/click controls */}
          {gameState === 'playing' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-8">
              <button
                className="w-20 h-20 rounded-full bg-black/80 border-2 border-white/30 text-white text-4xl shadow-lg active:scale-95 transition-all duration-150"
                aria-label="Move Left"
                onClick={moveCarLeft}
                style={{touchAction:'manipulation'}}
                tabIndex={0}
              >
                &#8592;
              </button>
              <button
                className="w-20 h-20 rounded-full bg-black/80 border-2 border-white/30 text-white text-4xl shadow-lg active:scale-95 transition-all duration-150"
                aria-label="Move Right"
                onClick={moveCarRight}
                style={{touchAction:'manipulation'}}
                tabIndex={0}
              >
                &#8594;
              </button>
            </div>
          )}
            {/* Answer options */}
            {obstacles.map(obstacle => (
              <div
                key={obstacle.id}
                className="absolute w-24 h-14 rounded-xl flex items-center justify-center font-bold text-white border-2 bg-blue-600/80 border-blue-400 shadow-lg backdrop-blur-sm"
                style={{
                  left: `${(100 / 3) * (obstacle.x + 0.5)}%`,
                  top: obstacle.y,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="text-xl font-black">{obstacle.value}</div>
              </div>
            ))}

            {/* Player Car */}
            <div
              className={`absolute w-16 h-24 transition-transform duration-100 ease-in-out`}
              style={{
                left: `${(100 / 3) * (carPosition + 0.5)}%`,
                bottom: '28%', // Move car higher
                transform: `translateX(-50%) ${carAnimation === 'tilt-left' ? 'rotate(-8deg)' : carAnimation === 'tilt-right' ? 'rotate(8deg)' : 'rotate(0deg)'}`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-b from-red-500 to-red-700 rounded-lg border-2 border-red-300 shadow-lg relative">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-14 bg-black/30 rounded-md"></div>
                <div className="absolute bottom-2 left-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-black/50"></div>
                <div className="absolute bottom-2 right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-black/50"></div>
                <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-8 h-8 drop-shadow-lg" />
              </div>
              {speed > 1.5 && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
                  <div className="w-2 h-5 bg-orange-500 rounded opacity-80 animate-pulse"></div>
                  <div className="w-2 h-4 bg-yellow-500 rounded opacity-90 animate-pulse [animation-delay:0.1s]"></div>
                </div>
              )}
            </div>

          {/* Combo indicator */}
          {combo > 2 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-5xl font-black text-yellow-400 animate-pulse drop-shadow-lg" style={{WebkitTextStroke: '2px black'}}>
                {combo}x COMBO!
              </div>
              <div className="text-xl text-white font-bold drop-shadow-md">Awesome!</div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile left/right controls for touch devices - always visible above game UI */}
      {gameState === 'playing' && (
        <>
          <button
            className="fixed bottom-6 left-4 z-[100] flex items-center justify-center w-16 h-16 rounded-full bg-black/70 border-2 border-white/30 text-white text-3xl shadow-lg active:scale-95 transition-all duration-150 sm:hidden"
            aria-label="Move Left"
            onClick={moveCarLeft}
            style={{touchAction:'manipulation'}}
            tabIndex={0}
          >
            &#8592;
          </button>
          <button
            className="fixed bottom-6 right-4 z-[100] flex items-center justify-center w-16 h-16 rounded-full bg-black/70 border-2 border-white/30 text-white text-3xl shadow-lg active:scale-95 transition-all duration-150 sm:hidden"
            aria-label="Move Right"
            onClick={moveCarRight}
            style={{touchAction:'manipulation'}}
            tabIndex={0}
          >
            &#8594;
          </button>
        </>
      )}
    </div>
  );
}

// Export metadata for Playground listing
export const metadata = {
  name: "Math Racing Champion",
  gradeLevel: "3-8",
  category: "Math",
  icon: "🏎️"
};


