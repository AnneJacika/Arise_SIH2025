import React, { useState, useEffect } from 'react';

const ROOMS = [
  {
    id: 1,
    name: "Chemistry Lab",
    description: "You wake up in a mysterious chemistry lab. The door is locked with a digital keypad.",
    image: "🧪",
    riddle: {
      question: "What is the chemical symbol for water?",
      options: ["H2O", "CO2", "NaCl", "O2"],
      correct: 0,
      hint: "It's made of 2 hydrogen atoms and 1 oxygen atom!"
    }
  },
  {
    id: 2,
    name: "Physics Laboratory", 
    description: "You've entered a physics lab filled with experimental equipment. A laser barrier blocks your path.",
    image: "⚡",
    riddle: {
      question: "What travels faster than anything else in the universe?",
      options: ["Sound", "Light", "Lightning", "Radio waves"],
      correct: 1,
      hint: "Einstein proved nothing can travel faster than this!"
    }
  },
  {
    id: 3,
    name: "Biology Station",
    description: "A biology lab with specimens everywhere. The exit requires a DNA sequence code.",
    image: "🧬",
    riddle: {
      question: "What are the four bases in DNA?",
      options: ["A, T, G, C", "A, U, G, C", "H, O, N, C", "Fe, Cu, Zn, Mg"],
      correct: 0,
      hint: "Think: Adenine, Thymine, Guanine, Cytosine!"
    }
  },
  {
    id: 4,
    name: "Earth Science Center",
    description: "You're in a geology lab with rock samples. A seismic lock needs the right answer.",
    image: "🌍",
    riddle: {
      question: "What layer of Earth is liquid?",
      options: ["Crust", "Mantle", "Outer Core", "Inner Core"],
      correct: 2,
      hint: "It's made mostly of liquid iron and nickel!"
    }
  },
  {
    id: 5,
    name: "Astronomy Observatory",
    description: "The final room - a space observation deck. Solve this to unlock the main exit!",
    image: "🌟",
    riddle: {
      question: "What is the closest star to Earth?",
      options: ["Alpha Centauri", "Sirius", "The Sun", "Polaris"],
      correct: 2,
      hint: "You see it every day when the weather is clear!"
    }
  }
];

const INVENTORY_ITEMS = [
  { id: 'key', name: 'Lab Key', icon: '🔑', description: 'Opens locked cabinets' },
  { id: 'magnifier', name: 'Magnifying Glass', icon: '🔍', description: 'Reveals hidden clues' },
  { id: 'formula', name: 'Formula Sheet', icon: '📋', description: 'Contains useful equations' },
  { id: 'flashlight', name: 'UV Flashlight', icon: '🔦', description: 'Shows invisible ink' }
];

export function ScienceLabEscape() {
  const [currentRoom, setCurrentRoom] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);
  const [score, setScore] = useState(1000);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (gameStatus === 'playing') {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStatus]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addToInventory = () => {
    const availableItems = INVENTORY_ITEMS.filter(item => 
      !inventory.some(invItem => invItem.id === item.id)
    );
    if (availableItems.length > 0) {
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      setInventory(prev => [...prev, randomItem]);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const room = ROOMS[currentRoom];
    const isCorrect = selectedAnswer === room.riddle.correct;
    
    setAttempts(prev => prev + 1);

    if (isCorrect) {
      // Add points for correct answer
      const timeBonus = Math.max(50, 200 - timeSpent);
      const attemptBonus = attempts === 0 ? 100 : attempts === 1 ? 50 : 0;
      setScore(prev => prev + timeBonus + attemptBonus);
      
      // Add item to inventory
      addToInventory();
      
      setTimeout(() => {
        if (currentRoom === ROOMS.length - 1) {
          setGameStatus('won');
        } else {
          setCurrentRoom(prev => prev + 1);
          setSelectedAnswer(null);
          setShowHint(false);
          setAttempts(0);
        }
      }, 1500);
    } else {
      // Deduct points for wrong answer
      setScore(prev => Math.max(0, prev - 50));
      setTimeout(() => {
        setSelectedAnswer(null);
      }, 2000);
    }
  };

  const useHint = () => {
    if (!showHint) {
      setShowHint(true);
      setScore(prev => Math.max(0, prev - 25));
    }
  };

  const resetGame = () => {
    setCurrentRoom(0);
    setGameStatus('playing');
    setSelectedAnswer(null);
    setShowHint(false);
    setAttempts(0);
    setInventory([]);
    setScore(1000);
    setTimeSpent(0);
  };

  const room = ROOMS[currentRoom];
  const isAnswerCorrect = selectedAnswer === room?.riddle.correct;
  const isAnswerWrong = selectedAnswer !== null && selectedAnswer !== room?.riddle.correct;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 min-h-screen text-white">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2">🔬 Science Lab Escape</h1>
        <p className="text-blue-200">Solve science riddles to escape each room!</p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-between items-center mb-6 bg-black/30 p-4 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-blue-300">Room:</span> {currentRoom + 1}/{ROOMS.length}
          </div>
          <div className="text-sm">
            <span className="text-green-300">Score:</span> {score}
          </div>
          <div className="text-sm">
            <span className="text-yellow-300">Time:</span> {formatTime(timeSpent)}
          </div>
        </div>
        <button
          onClick={() => setShowInventory(!showInventory)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors relative"
        >
          🎒 Inventory {inventory.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">{inventory.length}</span>}
        </button>
      </div>

      {/* Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowInventory(false)}>
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Inventory</h3>
            {inventory.length === 0 ? (
              <p className="text-gray-400">Your inventory is empty. Solve puzzles to collect items!</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {inventory.map(item => (
                  <div key={item.id} className="bg-gray-700 p-3 rounded-lg text-center">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowInventory(false)}
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {gameStatus === 'won' ? (
        /* Victory Screen */
        <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 p-8 rounded-lg shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">🎉 Escape Successful!</h2>
          <div className="text-xl mb-4">You've escaped the Science Lab!</div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-black/30 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{score}</div>
              <div className="text-sm">Final Score</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{formatTime(timeSpent)}</div>
              <div className="text-sm">Time Taken</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{inventory.length}</div>
              <div className="text-sm">Items Found</div>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            Play Again
          </button>
        </div>
      ) : (
        /* Game Room */
        <div className="bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl">
          {/* Room Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
            <div className="text-6xl mb-2">{room.image}</div>
            <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
            <p className="text-blue-100">{room.description}</p>
          </div>

          {/* Riddle Section */}
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-yellow-300">
                🧩 Solve this riddle to proceed:
              </h3>
              <p className="text-lg mb-4 bg-gray-800/50 p-4 rounded-lg">
                {room.riddle.question}
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {room.riddle.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null && (isAnswerCorrect || isAnswerWrong)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 text-left font-semibold ${
                    selectedAnswer === index
                      ? isAnswerCorrect
                        ? 'bg-green-600 border-green-400 text-white'
                        : isAnswerWrong
                        ? 'bg-red-600 border-red-400 text-white'
                        : 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-gray-700 border-gray-500 hover:bg-gray-600 hover:border-gray-400'
                  } ${selectedAnswer !== null && (isAnswerCorrect || isAnswerWrong) ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3 text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </div>
                </button>
              ))}
            </div>

            {/* Hint Section */}
            {showHint && (
              <div className="mb-6 p-4 bg-yellow-600/20 border border-yellow-600/50 rounded-lg">
                <p className="text-yellow-300">
                  <strong>💡 Hint:</strong> {room.riddle.hint}
                </p>
              </div>
            )}

            {/* Feedback Messages */}
            {selectedAnswer !== null && isAnswerCorrect && (
              <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-center">
                <p className="text-green-300 font-semibold">
                  ✅ Correct! Moving to the next room...
                </p>
              </div>
            )}

            {selectedAnswer !== null && isAnswerWrong && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-center">
                <p className="text-red-300 font-semibold">
                  ❌ Incorrect! Try again.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={useHint}
                disabled={showHint}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  showHint
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                💡 Hint (-25 points)
              </button>
              
              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedAnswer === null
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
            style={{ width: `${((currentRoom + (gameStatus === 'won' ? 1 : 0)) / ROOMS.length) * 100}%` }}
          />
        </div>
        <p className="text-center text-sm text-gray-400 mt-2">
          Progress: {currentRoom + (gameStatus === 'won' ? 1 : 0)}/{ROOMS.length} rooms
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  name: "Science Lab Escape",
  gradeLevel: "5-12",
  category: "Science",
  icon: "🔬"
};