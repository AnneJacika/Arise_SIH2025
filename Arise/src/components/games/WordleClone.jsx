import React, { useState, useEffect } from 'react';

const WORD_LIST = [
  'ABOUT', 'ABOVE', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN', 'AGENT', 'AGREE',
  'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE', 'ALLOW', 'ALONE',
  'ALONG', 'ALTER', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE', 'APPLY', 'ARENA', 'ARGUE',
  'ARISE', 'ARRAY', 'ARROW', 'ASIDE', 'ASSET', 'AVOID', 'AWAKE', 'AWARE', 'BADLY', 'BASIC',
  'BEACH', 'BEGIN', 'BEING', 'BELOW', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLANK',
  'BLIND', 'BLOCK', 'BLOOD', 'BOARD', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BRAVE',
  'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BUILT',
  'BUYER', 'CABLE', 'CARRY', 'CARVE', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM',
  'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHOSE', 'CIVIL',
  'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLIMB', 'CLOCK', 'CLOSE', 'CLOUD', 'COACH'
];

export function WordleClone() {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState(Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [letterStates, setLetterStates] = useState({}); // Track keyboard colors

  useEffect(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(randomWord);
  }, []);

  const resetGame = () => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(randomWord);
    setGuesses(Array(6).fill(''));
    setCurrentGuess(0);
    setCurrentInput('');
    setGameStatus('playing');
    setLetterStates({});
  };

  const getLetterState = (letter, position, word) => {
    if (targetWord[position] === letter) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  const updateLetterStates = (word) => {
    const newStates = { ...letterStates };
    
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const state = getLetterState(letter, i, word);
      
      // Only update if we don't have a better state already
      if (!newStates[letter] || 
          (newStates[letter] === 'absent' && state !== 'absent') ||
          (newStates[letter] === 'present' && state === 'correct')) {
        newStates[letter] = state;
      }
    }
    
    setLetterStates(newStates);
  };

  const submitGuess = () => {
    if (currentInput.length !== 5 || gameStatus !== 'playing') return;

    const newGuesses = [...guesses];
    newGuesses[currentGuess] = currentInput.toUpperCase();
    setGuesses(newGuesses);
    
    updateLetterStates(currentInput.toUpperCase());

    if (currentInput.toUpperCase() === targetWord) {
      setGameStatus('won');
    } else if (currentGuess === 5) {
      setGameStatus('lost');
    } else {
      setCurrentGuess(currentGuess + 1);
    }

    setCurrentInput('');
  };

  const handleKeyPress = (key) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === '⌫') {
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (key.length === 1 && key.match(/[A-Z]/i) && currentInput.length < 5) {
      setCurrentInput(prev => prev + key.toUpperCase());
    }
  };

  const renderGuessRow = (guess, rowIndex) => {
    const isCurrentRow = rowIndex === currentGuess && gameStatus === 'playing';
    const displayWord = isCurrentRow ? currentInput.padEnd(5, ' ') : guess.padEnd(5, ' ');

    return (
      <div key={rowIndex} className="flex gap-1 mb-1">
        {Array.from(displayWord).map((letter, colIndex) => {
          let bgColor = 'bg-gray-200 border-gray-300';
          let textColor = 'text-gray-800';

          if (guess && guess[colIndex]) {
            const state = getLetterState(guess[colIndex], colIndex, guess);
            if (state === 'correct') {
              bgColor = 'bg-green-500 border-green-600';
              textColor = 'text-white';
            } else if (state === 'present') {
              bgColor = 'bg-yellow-500 border-yellow-600';
              textColor = 'text-white';
            } else {
              bgColor = 'bg-gray-500 border-gray-600';
              textColor = 'text-white';
            }
          } else if (isCurrentRow && letter !== ' ') {
            bgColor = 'bg-blue-100 border-blue-300';
            textColor = 'text-blue-800';
          }

          return (
            <div
              key={colIndex}
              className={`w-12 h-12 border-2 flex items-center justify-center font-bold text-lg transition-all duration-300 ${bgColor} ${textColor}`}
            >
              {letter !== ' ' ? letter : ''}
            </div>
          );
        })}
      </div>
    );
  };

  const renderKeyboard = () => {
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
    ];

    return (
      <div className="mt-8">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 mb-2">
            {row.map((key) => {
              let bgColor = 'bg-gray-300 hover:bg-gray-400';
              let textColor = 'text-gray-800';

              if (letterStates[key]) {
                if (letterStates[key] === 'correct') {
                  bgColor = 'bg-green-500 hover:bg-green-600';
                  textColor = 'text-white';
                } else if (letterStates[key] === 'present') {
                  bgColor = 'bg-yellow-500 hover:bg-yellow-600';
                  textColor = 'text-white';
                } else {
                  bgColor = 'bg-gray-500 hover:bg-gray-600';
                  textColor = 'text-white';
                }
              }

              const isSpecial = key === 'ENTER' || key === '⌫';

              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`${isSpecial ? 'px-4' : 'px-3'} py-3 rounded font-semibold transition-all duration-200 ${bgColor} ${textColor} active:scale-95`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Listen for keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('⌫');
      } else if (e.key.match(/[a-zA-Z]/)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInput, gameStatus, currentGuess]);

  return (
    <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Wordle Clone</h1>
        <p className="text-gray-600">Guess the 5-letter word in 6 tries!</p>
      </div>

      {gameStatus !== 'playing' && (
        <div className="text-center mb-6 p-4 rounded-lg bg-white shadow-md">
          {gameStatus === 'won' && (
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 Congratulations!</h2>
              <p className="text-gray-600">You guessed "{targetWord}" in {currentGuess} tries!</p>
            </div>
          )}
          {gameStatus === 'lost' && (
            <div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">😔 Game Over</h2>
              <p className="text-gray-600">The word was "{targetWord}"</p>
            </div>
          )}
          <button
            onClick={resetGame}
            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="flex flex-col items-center mb-4">
        {guesses.map((guess, index) => renderGuessRow(guess, index))}
      </div>

      {renderKeyboard()}

      <div className="mt-8 text-center text-sm text-gray-600 space-y-1">
        <p><span className="inline-block w-4 h-4 bg-green-500 rounded mr-2"></span>Correct letter, correct position</p>
        <p><span className="inline-block w-4 h-4 bg-yellow-500 rounded mr-2"></span>Correct letter, wrong position</p>
        <p><span className="inline-block w-4 h-4 bg-gray-500 rounded mr-2"></span>Letter not in word</p>
      </div>
    </div>
  );
}

export const metadata = {
  name: "Wordle Clone",
  gradeLevel: "6-12",
  category: "Word Game",
  icon: "🔤"
};