import React, { useState, useEffect } from 'react';
import { RotateCcw, FileText, Heart, Star, HelpCircle, Eye, X } from 'lucide-react';

export function WordSamurai() {
  const [gameState, setGameState] = useState('instructions'); // 'instructions', 'playing', 'gameOver', 'win'
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [keyboardColors, setKeyboardColors] = useState({});
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [consecutiveFirstTries, setConsecutiveFirstTries] = useState(0);
  const [clues, setClues] = useState(0);
  const [usedClues, setUsedClues] = useState(new Set());
  const [showClueModal, setShowClueModal] = useState(false);
  const [eliminatedLetters, setEliminatedLetters] = useState(new Set());
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [animationCoins, setAnimationCoins] = useState(0);
  const [backgroundTheme, setBackgroundTheme] = useState('bg-gradient-to-br from-blue-50 to-indigo-100'); // Default theme
  const [showLivesModal, setShowLivesModal] = useState(false); // State for lives modal
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    totalGuesses: 0,
    totalWordsAttempted: 0,
    longestStreak: 0,
    totalCoins: 0
  });

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const MAX_TRIALS = 3;

  // Hardcoded words for the game with sentence case definitions
  const hardcodedWords = [
    { word: 'council', definition: 'A group of people who meet regularly to make decisions' },
    { word: 'minister', definition: 'A government official who heads a department' },
    { word: 'policy', definition: 'A course of action adopted by a government or organization' },
    { word: 'cabinet', definition: 'The committee of senior government ministers' },
    { word: 'election', definition: 'The process of choosing someone by voting' },
    { word: 'democracy', definition: 'A system where people choose their government by voting' },
    { word: 'justice', definition: 'Fair treatment in accordance with the law' },
    { word: 'freedom', definition: 'The power to act, speak, or think freely' },
    { word: 'power', definition: 'The ability to influence or control others' },
    { word: 'rights', definition: 'Moral or legal entitlements' },
    { word: 'unity', definition: 'The state of being united or joined as a whole' },
    { word: 'reform', definition: 'Improvement by alteration or correction' },
    { word: 'nation', definition: 'A large group of people united by common descent' },
    { word: 'citizen', definition: 'A legally recognized member of a state' },
    { word: 'system', definition: 'A set of connected things forming a complex whole' }
  ];

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('wordSamuraiStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    setWords(hardcodedWords);
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('wordSamuraiStats', JSON.stringify(stats));
  }, [stats]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (gameState !== 'playing' || isCorrect !== null) return;

      const key = event.key.toUpperCase();
      
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        handleLetterClick(key);
      } else if (key === 'BACKSPACE') {
        handleBackspace();
      } else if (key === 'ENTER') {
        handleSubmitGuess();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, isCorrect, currentGuess, currentWordIndex]);

  const resetWordState = () => {
    setCurrentWordIndex(0);
    setHearts(3);
    setScore(0);
    setCoins(0);
    setConsecutiveFirstTries(0);
    setClues(0);
    setUsedClues(new Set());
    setCurrentGuess('');
    setGuesses([]);
    setCurrentTrial(0);
    setKeyboardColors({});
    setIsCorrect(null);
    setEliminatedLetters(new Set());
    setBackgroundTheme('bg-gradient-to-br from-blue-50 to-indigo-100'); // Reset to default theme
    setShowLivesModal(false);
  };

  const startGame = () => {
    setGameState('playing');
    resetWordState();
  };

  const triggerCoinAnimation = (coinsEarned) => {
    setAnimationCoins(coinsEarned);
    setShowCoinAnimation(true);
    setTimeout(() => setShowCoinAnimation(false), 2000);
  };

  const getLetterColor = (letter, position, targetWord, guess) => {
    const targetLetter = targetWord[position];
    
    if (letter === targetLetter) {
      return 'correct'; // Green
    } else if (targetWord.includes(letter)) {
      return 'present'; // Yellow
    } else {
      return 'absent'; // Gray
    }
  };

  const updateKeyboardColors = (guess, targetWord) => {
    const newColors = { ...keyboardColors };
    
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i].toUpperCase();
      const color = getLetterColor(guess[i], i, targetWord, guess);
      
      // Only update if it's a better color (correct > present > absent)
      if (!newColors[letter] || 
          (color === 'correct') || 
          (color === 'present' && newColors[letter] === 'absent')) {
        newColors[letter] = color;
      }
    }
    
    setKeyboardColors(newColors);
  };

  const handleLetterClick = (letter) => {
    if (isCorrect !== null) return; // Don't allow input during feedback
    
    const currentWord = words[currentWordIndex];
    if (currentGuess.length < currentWord.word.length) {
      setCurrentGuess(currentGuess + letter.toLowerCase());
    }
  };

  const handleBackspace = () => {
    if (isCorrect !== null) return; // Don't allow input during feedback
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const useClue = () => {
    if (clues === 0) return;

    const currentWord = words[currentWordIndex];
    const wordId = `${currentWordIndex}-${currentWord.word}`;
    
    if (usedClues.has(wordId)) {
      // Second clue - reveal answer
      setCurrentGuess(currentWord.word);
      setUsedClues(prev => new Set([...prev, `${wordId}-revealed`]));
    } else {
      // First clue - eliminate wrong letters
      const correctLetters = new Set(currentWord.word.split(''));
      const lettersToEliminate = ALPHABET.filter(letter => 
        !correctLetters.has(letter.toLowerCase()) && 
        !eliminatedLetters.has(letter)
      ).slice(0, 8); // Eliminate 8 wrong letters
      
      setEliminatedLetters(prev => new Set([...prev, ...lettersToEliminate]));
      setUsedClues(prev => new Set([...prev, wordId]));
    }
    
    setClues(clues - 1);
    setShowClueModal(false);
  };

  const handleSubmitGuess = () => {
    const currentWord = words[currentWordIndex];
    
    if (currentGuess.length !== currentWord.word.length) {
      alert(`Please enter a ${currentWord.word.length}-letter word`);
      return;
    }
    
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    
    updateKeyboardColors(currentGuess, currentWord.word);
    
    const isGuessCorrect = currentGuess === currentWord.word;
    setIsCorrect(isGuessCorrect);
    
    // Update stats: increment total guesses and words attempted
    setStats(prev => ({
      ...prev,
      totalGuesses: prev.totalGuesses + 1,
      totalWordsAttempted: prev.totalWordsAttempted + 1
    }));
    
    // Set background theme based on guess result
    setBackgroundTheme(isGuessCorrect ? 'bg-gradient-to-br from-green-50 to-green-200' : 
                      currentTrial + 1 >= MAX_TRIALS ? 'bg-gradient-to-br from-red-50 to-red-200' : 
                      'bg-gradient-to-br from-blue-50 to-indigo-100');
    
    setTimeout(() => {
      if (isGuessCorrect) {
        setScore(score + 1);
        
        // Award coins based on trial number
        let coinsEarned = 0;
        if (currentTrial === 0) {
          coinsEarned = 10; // First try
          const newConsecutive = consecutiveFirstTries + 1;
          setConsecutiveFirstTries(newConsecutive);
          
          // Update longest streak
          setStats(prev => ({
            ...prev,
            longestStreak: Math.max(prev.longestStreak, newConsecutive)
          }));
          
          // Award clues for 3 consecutive first tries
          if (newConsecutive === 3) {
            setClues(clues + 3);
            setConsecutiveFirstTries(0);
          }
        } else if (currentTrial === 1) {
          coinsEarned = 5; // Second try
          setConsecutiveFirstTries(0);
        } else {
          coinsEarned = 2; // Third try
          setConsecutiveFirstTries(0);
        }
        
        setCoins(coins + coinsEarned);
        setStats(prev => ({
          ...prev,
          totalCoins: prev.totalCoins + coinsEarned
        }));
        triggerCoinAnimation(coinsEarned);
        
        // Move to next word
        if (currentWordIndex + 1 >= words.length) {
          setGameState('win');
          setBackgroundTheme('bg-gradient-to-br from-green-50 to-green-100');
          setStats(prev => ({
            ...prev,
            gamesPlayed: prev.gamesPlayed + 1,
            gamesWon: prev.gamesWon + 1
          }));
        } else {
          setCurrentWordIndex(currentWordIndex + 1);
          setCurrentGuess('');
          setGuesses([]);
          setCurrentTrial(0);
          setIsCorrect(null);
          setEliminatedLetters(new Set()); // Reset eliminated letters for new word
          setKeyboardColors(prev => {
            const newColors = { ...prev };
            Object.keys(newColors).forEach(letter => {
              if (newColors[letter] === 'correct') {
                delete newColors[letter];
              }
            });
            return newColors;
          });
          setBackgroundTheme('bg-gradient-to-br from-blue-50 to-indigo-100'); // Reset to default theme
        }
      } else {
        const newTrial = currentTrial + 1;
        setCurrentTrial(newTrial);
        setConsecutiveFirstTries(0); // Reset consecutive counter on wrong guess
        
        if (newTrial >= MAX_TRIALS) {
          // Used all trials for this word
          const newHearts = hearts - 1;
          setHearts(newHearts);
          
          // Show lives modal when all attempts are used and answer is incorrect
          setShowLivesModal(true);
          setTimeout(() => setShowLivesModal(false), 2000); // Auto-dismiss after 2 seconds
          
          if (newHearts === 0) {
            setGameState('gameOver');
            setBackgroundTheme('bg-gradient-to-br from-red-50 to-red-100');
            setStats(prev => ({
              ...prev,
              gamesPlayed: prev.gamesPlayed + 1
            }));
          } else {
            // Move to next word
            if (currentWordIndex + 1 >= words.length) {
              setGameState('win');
              setBackgroundTheme('bg-gradient-to-br from-green-50 to-green-100');
              setStats(prev => ({
                ...prev,
                gamesPlayed: prev.gamesPlayed + 1,
                gamesWon: prev.gamesWon + 1
              }));
            } else {
              setCurrentWordIndex(currentWordIndex + 1);
              setCurrentGuess('');
              setGuesses([]);
              setCurrentTrial(0);
              setIsCorrect(null);
              setEliminatedLetters(new Set()); // Reset eliminated letters for new word
              setKeyboardColors(prev => {
                const newColors = { ...prev };
                Object.keys(newColors).forEach(letter => {
                  if (newColors[letter] === 'correct') {
                    delete newColors[letter];
                  }
                });
                return newColors;
              });
              setBackgroundTheme('bg-gradient-to-br from-blue-50 to-indigo-100'); // Reset to default theme
            }
          }
        } else {
          setCurrentGuess('');
          setIsCorrect(null);
          // Only change to red if out of trials, otherwise keep default
          setBackgroundTheme('bg-gradient-to-br from-blue-50 to-indigo-100');
        }
      }
    }, 2000);
  };

  const resetGame = () => {
    setGameState('instructions');
    resetWordState();
  };

  const renderHearts = () => {
    return Array.from({ length: 3 }, (_, i) => (
      <Heart
        key={i}
        className={`w-6 h-6 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
      />
    ));
  };

  const renderGuessGrid = () => {
    const currentWord = words[currentWordIndex];
    const wordLength = currentWord.word.length;
    const totalRows = MAX_TRIALS;
    
    return (
      <div className="mb-6">
        {Array.from({ length: totalRows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-2 mb-2">
            {Array.from({ length: wordLength }, (_, colIndex) => {
              let letter = '';
              let colorClass = 'bg-gray-100 border-gray-300';
              
              if (rowIndex < guesses.length) {
                // Completed guess
                letter = guesses[rowIndex][colIndex] || '';
                const color = getLetterColor(letter, colIndex, currentWord.word, guesses[rowIndex]);
                colorClass = color === 'correct' ? 'bg-green-500 text-white border-green-500' :
                           color === 'present' ? 'bg-yellow-500 text-white border-yellow-500' :
                           'bg-gray-500 text-white border-gray-500';
              } else if (rowIndex === currentTrial) {
                // Current guess being typed
                letter = currentGuess[colIndex] || '';
                colorClass = letter ? 'bg-blue-100 border-blue-400' : 'bg-gray-100 border-gray-300';
              }
              
              return (
                <div
                  key={colIndex}
                  className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-bold uppercase ${colorClass}`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderKeyboard = () => {
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    return (
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-1">
            {row.map((letter) => {
              const color = keyboardColors[letter];
              const isEliminated = eliminatedLetters.has(letter);
              let colorClass = 'bg-gray-200 hover:bg-gray-300 text-gray-800';
              
              if (isEliminated) {
                colorClass = 'bg-red-200 text-red-800 line-through';
              } else if (color === 'correct') {
                colorClass = 'bg-green-500 text-white';
              } else if (color === 'present') {
                colorClass = 'bg-yellow-500 text-white';
              } else if (color === 'absent') {
                colorClass = 'bg-gray-500 text-white';
              }
              
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  disabled={isCorrect !== null || isEliminated}
                  className={`w-10 h-12 rounded font-semibold text-sm transition-colors ${colorClass} disabled:opacity-70`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
        
        {/* Action buttons */}
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={handleBackspace}
            disabled={isCorrect !== null}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-semibold disabled:opacity-70"
          >
            ⌫ Delete
          </button>
          <button
            onClick={handleSubmitGuess}
            disabled={!currentGuess || currentGuess.length !== words[currentWordIndex].word.length || isCorrect !== null}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold disabled:opacity-70 disabled:bg-gray-400"
          >
            Submit
          </button>
          <button
            onClick={() => setShowClueModal(true)}
            disabled={clues === 0 || isCorrect !== null}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-semibold disabled:opacity-70 disabled:bg-gray-400 flex items-center space-x-1"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Clue ({clues})</span>
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-600 mt-2">
          Press keys on your keyboard to type • Enter to submit • Backspace to delete
        </div>
      </div>
    );
  };

  if (gameState === 'instructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 transition-colors duration-500">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
          <div className="mb-6">
            <FileText className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Word Samurai ⚔️</h1>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Game Rules</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded flex-shrink-0"></div>
                <span><strong>Green:</strong> Letter is correct and in the right position</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-yellow-500 rounded flex-shrink-0"></div>
                <span><strong>Yellow:</strong> Letter is in the word but wrong position</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-500 rounded flex-shrink-0"></div>
                <span><strong>Gray:</strong> Letter is not in the word</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-300">
              <h3 className="font-semibold text-gray-700 mb-2">Rewards & Clues:</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>🪙 <strong>10 coins</strong> for first attempt, 5 for second, 2 for third</li>
                <li>🔥 <strong>3 clues</strong> for 3 consecutive first-attempt wins</li>
                <li>💡 <strong>First clue:</strong> Eliminates wrong letters from keyboard</li>
                <li>👁️ <strong>Second clue:</strong> Reveals the answer (same word)</li>
                <li>❤️ <strong>3 hearts total</strong> - lose one for each failed word</li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full bg-indigo-600 text-white py-4 px-8 rounded-lg text-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Start Playing! 🎮
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const currentWord = words[currentWordIndex];
    const wordId = `${currentWordIndex}-${currentWord.word}`;
    const hasUsedClue = usedClues.has(wordId);
    const hasRevealedAnswer = usedClues.has(`${wordId}-revealed`);
    
    return (
      <div className={`min-h-screen ${backgroundTheme} p-4 transition-colors duration-500`}>
        {/* Coin Animation */}
        {showCoinAnimation && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="animate-bounce text-6xl font-bold text-yellow-500">
              +{animationCoins} 🪙
            </div>
          </div>
        )}

        {/* Clue Modal */}
        {showClueModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Use Clue</h3>
                <button onClick={() => setShowClueModal(false)}>
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              {hasUsedClue ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    This will reveal the complete answer for this word.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={useClue}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      Reveal Answer
                    </button>
                    <button
                      onClick={() => setShowClueModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    This will eliminate wrong letters from the keyboard to help you guess the word.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={useClue}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                    >
                      <HelpCircle className="w-4 h-4 inline mr-1" />
                      Use Clue
                    </button>
                    <button
                      onClick={() => setShowClueModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lives Modal */}
        {showLivesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-red-600">Incorrect Guess!</h3>
                <button onClick={() => setShowLivesModal(false)}>
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                You have {hearts} {hearts === 1 ? 'life' : 'lives'} left until you lose the war!
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowLivesModal(false)}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Word Samurai ⚔️</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-700 font-semibold">{coins}</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700 font-semibold">{clues}</span>
                </div>
                <div className="flex space-x-1">
                  {renderHearts()}
                </div>
                <div className="text-sm text-gray-600">
                  Trial: {currentTrial + 1}/{MAX_TRIALS}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Word: {currentWordIndex + 1} / {words.length} | Score: {score}
            </p>
            
            {consecutiveFirstTries > 0 && (
              <div className="mt-2 text-sm text-orange-600 font-semibold">
                🔥 Streak: {consecutiveFirstTries}/3 first-attempt wins (earn 3 clues at 3!)
              </div>
            )}
          </div>

          {/* Definition Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Definition:</h2>
            <p className="text-xl text-indigo-700 font-medium leading-relaxed">
              {currentWord.definition}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              ({currentWord.word.length} letters)
            </p>
          </div>

          {/* Game Grid */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            {renderGuessGrid()}
            
            {isCorrect === true && (
              <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg font-semibold mb-4">
                🎉 Correct! The word was "{currentWord.word.toUpperCase()}"
                {currentTrial === 0 && <div className="text-sm mt-1">+10 coins for first attempt! 🪙</div>}
                {currentTrial === 1 && <div className="text-sm mt-1">+5 coins for second attempt! 🪙</div>}
                {currentTrial === 2 && <div className="text-sm mt-1">+2 coins for third attempt! 🪙</div>}
              </div>
            )}

            {isCorrect === false && currentTrial >= MAX_TRIALS && (
              <div className="text-center p-4 bg-red-100 text-red-800 rounded-lg font-semibold mb-4">
                💔 Out of attempts! The word was "{currentWord.word.toUpperCase()}"
              </div>
            )}
          </div>

          {/* Keyboard */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {renderKeyboard()}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetGame}
            className="mt-6 mx-auto flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Over</span>
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    const winRate = stats.gamesPlayed > 0 ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1) : 0;
    const avgGuesses = stats.totalWordsAttempted > 0 ? (stats.totalGuesses / stats.totalWordsAttempted).toFixed(1) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4 transition-colors duration-500">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">💀</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">Game Over!</h2>
          <p className="text-gray-600 mb-2">You ran out of hearts!</p>
          <p className="text-lg text-gray-800 mb-2">Final Score: {score} / {words.length}</p>
          <p className="text-lg text-yellow-600 mb-6">Coins Earned: {coins} 🪙</p>
          
          {/* Statistics Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Your Statistics</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Games Played:</span>
                <span className="font-semibold">{stats.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span>Win Rate:</span>
                <span className="font-semibold">{winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Average Guesses per Word:</span>
                <span className="font-semibold">{avgGuesses}</span>
              </div>
              <div className="flex justify-between">
                <span>Longest First-Attempt Streak:</span>
                <span className="font-semibold">{stats.longestStreak}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Coins Earned:</span>
                <span className="font-semibold">{stats.totalCoins} 🪙</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={resetGame}
            className="bg-red-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'win') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4 transition-colors duration-500">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">Victory!</h2>
          <p className="text-gray-600 mb-2">Congratulations, Word Samurai!</p>
          <p className="text-lg text-gray-800 mb-2">Perfect Score: {score} / {words.length}</p>
          <p className="text-lg text-yellow-600 mb-6">Total Coins: {coins} 🪙</p>
          <button
            onClick={resetGame}
            className="bg-green-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }
}

// Export metadata for Playground listing
export const metadata = {
  name: "Word Samurai",
  gradeLevel: "6-12",
  category: "Language",
  icon: "⚔️"
};