import React, { useState, useEffect } from 'react';

const WORD_LISTS = {
  beginner: [
    { word: 'cat', definition: 'A small furry pet that meows', difficulty: 1 },
    { word: 'dog', definition: 'A loyal pet that barks', difficulty: 1 },
    { word: 'sun', definition: 'The bright star in our sky', difficulty: 1 },
    { word: 'tree', definition: 'A tall plant with leaves and branches', difficulty: 1 },
    { word: 'book', definition: 'Something you read with pages', difficulty: 1 },
    { word: 'house', definition: 'A place where people live', difficulty: 2 },
    { word: 'water', definition: 'A clear liquid we drink', difficulty: 2 },
    { word: 'happy', definition: 'Feeling joyful or glad', difficulty: 2 },
    { word: 'friend', definition: 'Someone you like to spend time with', difficulty: 2 },
    { word: 'school', definition: 'A place where children learn', difficulty: 2 }
  ],
  intermediate: [
    { word: 'beautiful', definition: 'Very pretty or attractive', difficulty: 3 },
    { word: 'elephant', definition: 'A large gray animal with a trunk', difficulty: 3 },
    { word: 'birthday', definition: 'The day you were born each year', difficulty: 3 },
    { word: 'butterfly', definition: 'A colorful insect with wings', difficulty: 3 },
    { word: 'important', definition: 'Something that matters a lot', difficulty: 3 },
    { word: 'adventure', definition: 'An exciting journey or experience', difficulty: 4 },
    { word: 'sandwich', definition: 'Food between two pieces of bread', difficulty: 3 },
    { word: 'dinosaur', definition: 'A large extinct reptile', difficulty: 4 },
    { word: 'chocolate', definition: 'A sweet brown candy or drink', difficulty: 4 },
    { word: 'computer', definition: 'A machine for working and playing games', difficulty: 4 }
  ],
  advanced: [
    { word: 'mysterious', definition: 'Hard to understand or explain', difficulty: 5 },
    { word: 'extraordinary', definition: 'Very unusual or remarkable', difficulty: 6 },
    { word: 'independence', definition: 'Freedom from control by others', difficulty: 5 },
    { word: 'magnificent', definition: 'Extremely beautiful or impressive', difficulty: 5 },
    { word: 'responsibility', definition: 'A duty or task you must do', difficulty: 6 },
    { word: 'encyclopedia', definition: 'A book with information on many topics', difficulty: 6 },
    { word: 'refrigerator', definition: 'An appliance that keeps food cold', difficulty: 5 },
    { word: 'photograph', definition: 'A picture taken with a camera', difficulty: 5 },
    { word: 'opportunity', definition: 'A chance to do something good', difficulty: 6 },
    { word: 'accomplishment', definition: 'Something successfully completed', difficulty: 6 }
  ]
};

const ENCOURAGING_MESSAGES = [
  "Great job! 🌟", "Excellent spelling! 📚", "You're doing amazing! 🎉", 
  "Keep it up! 💪", "Fantastic work! ✨", "You're a spelling star! ⭐"
];

const HINTS = {
  phonetic: "Break it into sounds",
  definition: "Think about the meaning",
  length: "Count the letters",
  similar: "Think of similar words"
};

export function SpellingBee() {
  const [difficulty, setDifficulty] = useState('beginner');
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [gameStatus, setGameStatus] = useState('ready'); // 'ready', 'playing', 'finished'
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wordsAttempted, setWordsAttempted] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(null);
  const [usedWords, setUsedWords] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
      setAudioSupported(false);
    }
  }, []);

  const speakWord = (word, slow = false) => {
    if (!audioSupported || !word) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = slow ? 0.6 : 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a clear voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
    ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const getRandomWord = () => {
    const availableWords = WORD_LISTS[difficulty].filter(
      wordObj => !usedWords.includes(wordObj.word)
    );
    
    if (availableWords.length === 0) {
      // Reset if all words used
      setUsedWords([]);
      return WORD_LISTS[difficulty][Math.floor(Math.random() * WORD_LISTS[difficulty].length)];
    }
    
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  };

  const startNewWord = () => {
    const wordObj = getRandomWord();
    setCurrentWord(wordObj);
    setUserInput('');
    setFeedback('');
    setShowHint(null);
    setUsedWords(prev => [...prev, wordObj.word]);
    
    // Automatically speak the word after a short delay
    setTimeout(() => {
      speakWord(wordObj.word);
    }, 500);
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setWordsAttempted(0);
    setUsedWords([]);
    setMistakes([]);
    setGameStatus('playing');
    startNewWord();
  };

  const checkSpelling = () => {
    if (!userInput.trim() || !currentWord) return;
    
    const userAnswer = userInput.trim().toLowerCase();
    const correctWord = currentWord.word.toLowerCase();
    const isCorrect = userAnswer === correctWord;
    
    setWordsAttempted(prev => prev + 1);
    
    if (isCorrect) {
      const points = currentWord.difficulty * 10 + (streak >= 3 ? 20 : 0);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      
      const message = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
      setFeedback(`${message} +${points} points`);
      
      setTimeout(() => {
        if (wordsAttempted + 1 >= 10) {
          setGameStatus('finished');
        } else {
          startNewWord();
        }
      }, 2000);
    } else {
      setStreak(0);
      setMistakes(prev => [...prev, { word: currentWord.word, userAnswer }]);
      setFeedback(`Not quite right. The correct spelling is: ${currentWord.word}`);
      
      // Speak the correct word
      setTimeout(() => {
        speakWord(currentWord.word, true);
      }, 1000);
      
      setTimeout(() => {
        if (wordsAttempted + 1 >= 10) {
          setGameStatus('finished');
        } else {
          startNewWord();
        }
      }, 3500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && gameStatus === 'playing' && currentWord) {
      checkSpelling();
    }
  };

  const showRandomHint = () => {
    const hintTypes = Object.keys(HINTS);
    const randomHint = hintTypes[Math.floor(Math.random() * hintTypes.length)];
    
    let hintContent = HINTS[randomHint];
    
    switch (randomHint) {
      case 'length':
        hintContent = `This word has ${currentWord.word.length} letters`;
        break;
      case 'definition':
        hintContent = currentWord.definition;
        break;
      case 'phonetic':
        hintContent = "Listen carefully to each sound";
        break;
      case 'similar':
        const firstLetter = currentWord.word[0].toUpperCase();
        hintContent = `This word starts with the letter "${firstLetter}"`;
        break;
    }
    
    setShowHint(hintContent);
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'beginner': return 'bg-green-500 hover:bg-green-600';
      case 'intermediate': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'advanced': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-yellow-50 to-orange-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">🐝 Spelling Bee</h1>
        <p className="text-gray-600 text-lg">Listen carefully and spell the words correctly!</p>
        {!audioSupported && (
          <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
            Audio not supported in your browser. Words will be displayed for reading.
          </div>
        )}
      </div>

      {gameStatus === 'ready' && (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-6">Choose Your Difficulty Level</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Object.keys(WORD_LISTS).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`p-6 rounded-lg border-3 transition-all transform hover:scale-105 ${
                  difficulty === level
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                }`}
              >
                <div className="text-3xl mb-2">
                  {level === 'beginner' ? '🌱' : level === 'intermediate' ? '🌳' : '🏆'}
                </div>
                <div className="font-bold text-lg capitalize mb-2">{level}</div>
                <div className="text-sm text-gray-600">
                  {level === 'beginner' && 'Simple 3-6 letter words'}
                  {level === 'intermediate' && 'Medium 7-9 letter words'}
                  {level === 'advanced' && 'Challenging 10+ letter words'}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            className={`px-8 py-4 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105 shadow-lg ${getDifficultyColor(difficulty)}`}
          >
            Start Spelling Challenge!
          </button>
        </div>
      )}

      {gameStatus === 'playing' && currentWord && (
        <div>
          {/* Game Stats */}
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{streak}</div>
                <div className="text-sm text-gray-600">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{wordsAttempted + 1}/10</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${getDifficultyColor(difficulty)}`}>
              {difficulty.toUpperCase()}
            </div>
          </div>

          {/* Main Game Area */}
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                Word #{wordsAttempted + 1}
              </h3>
              
              {!audioSupported && (
                <div className="text-4xl font-bold text-blue-600 mb-4 p-4 bg-blue-50 rounded-lg">
                  {currentWord.word.toUpperCase()}
                </div>
              )}

              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => speakWord(currentWord.word)}
                  disabled={!audioSupported}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  🔊 {audioSupported ? 'Play Word' : 'Audio Unavailable'}
                </button>
                <button
                  onClick={() => speakWord(currentWord.word, true)}
                  disabled={!audioSupported}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  🐌 {audioSupported ? 'Play Slowly' : 'Audio Unavailable'}
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 text-lg italic mb-4">"{currentWord.definition}"</p>
                <p className="text-sm text-gray-500">Difficulty: {'⭐'.repeat(currentWord.difficulty)}</p>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your spelling here..."
                  className="w-full max-w-md px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={checkSpelling}
                  disabled={!userInput.trim()}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-all"
                >
                  Submit Spelling
                </button>
                <button
                  onClick={showRandomHint}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all"
                >
                  💡 Need a Hint?
                </button>
              </div>

              {showHint && (
                <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-lg">
                  <p className="text-yellow-800">
                    <strong>Hint:</strong> {showHint}
                  </p>
                </div>
              )}
            </div>

            {feedback && (
              <div className={`p-4 rounded-lg font-semibold text-lg ${
                feedback.includes('Not quite') 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {feedback}
              </div>
            )}
          </div>
        </div>
      )}

      {gameStatus === 'finished' && (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold mb-6">🎉 Spelling Challenge Complete!</h2>
          
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-yellow-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{score}</div>
              <div className="text-gray-600">Final Score</div>
            </div>
            <div className="bg-green-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{10 - mistakes.length}/10</div>
              <div className="text-gray-600">Correct</div>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{Math.round((10 - mistakes.length) / 10 * 100)}%</div>
              <div className="text-gray-600">Accuracy</div>
            </div>
          </div>

          {mistakes.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Review Your Mistakes:</h3>
              <div className="space-y-2">
                {mistakes.map((mistake, index) => (
                  <div key={index} className="bg-red-50 p-3 rounded-lg">
                    <span className="font-semibold">Word:</span> {mistake.word} | 
                    <span className="font-semibold"> Your spelling:</span> {mistake.userAnswer}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => setGameStatus('ready')}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all mr-4"
            >
              Try Different Level
            </button>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {gameStatus === 'playing' && (
        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-500"
              style={{ width: `${(wordsAttempted / 10) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Progress: {wordsAttempted}/10 words completed
          </p>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  name: "Spelling Bee",
  gradeLevel: "2-8",
  category: "Language",
  icon: "🐝"
};