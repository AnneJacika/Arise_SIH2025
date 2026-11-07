import React, { useState, useEffect } from 'react';
import { Atom, Beaker, Sparkles, Trophy, Book, Zap } from 'lucide-react';

export function PeriodicTableExplorer() {
  const [gameMode, setGameMode] = useState('menu'); // 'menu', 'explore', 'quiz', 'build'
  const [selectedElement, setSelectedElement] = useState(null);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [molecule, setMolecule] = useState([]);
  const [availableElements, setAvailableElements] = useState([]);

  // Simplified periodic table data
  const elements = [
    { symbol: 'H', name: 'Hydrogen', number: 1, group: 'nonmetal', color: '#ff6b6b' },
    { symbol: 'He', name: 'Helium', number: 2, group: 'noble', color: '#4ecdc4' },
    { symbol: 'Li', name: 'Lithium', number: 3, group: 'metal', color: '#45b7d1' },
    { symbol: 'Be', name: 'Beryllium', number: 4, group: 'metal', color: '#45b7d1' },
    { symbol: 'B', name: 'Boron', number: 5, group: 'metalloid', color: '#f7b731' },
    { symbol: 'C', name: 'Carbon', number: 6, group: 'nonmetal', color: '#ff6b6b' },
    { symbol: 'N', name: 'Nitrogen', number: 7, group: 'nonmetal', color: '#ff6b6b' },
    { symbol: 'O', name: 'Oxygen', number: 8, group: 'nonmetal', color: '#ff6b6b' },
    { symbol: 'F', name: 'Fluorine', number: 9, group: 'nonmetal', color: '#ff6b6b' },
    { symbol: 'Ne', name: 'Neon', number: 10, group: 'noble', color: '#4ecdc4' },
    { symbol: 'Na', name: 'Sodium', number: 11, group: 'metal', color: '#45b7d1' },
    { symbol: 'Mg', name: 'Magnesium', number: 12, group: 'metal', color: '#45b7d1' },
    { symbol: 'Al', name: 'Aluminum', number: 13, group: 'metal', color: '#45b7d1' },
    { symbol: 'Si', name: 'Silicon', number: 14, group: 'metalloid', color: '#f7b731' },
    { symbol: 'P', name: 'Phosphorus', number: 15, group: 'nonmetal', color: '#ff6b6b' },
    { symbol: 'S', name: 'Sulfur', number: 16, group: 'nonmetal', color: '#ff6b6b' },
    { symbol: 'Cl', name: 'Chlorine', number: 17, group: 'nonmetal', color: '#ff6b6b' },
    { symbol: 'Ar', name: 'Argon', number: 18, group: 'noble', color: '#4ecdc4' },
    { symbol: 'K', name: 'Potassium', number: 19, group: 'metal', color: '#45b7d1' },
    { symbol: 'Ca', name: 'Calcium', number: 20, group: 'metal', color: '#45b7d1' },
  ];

  const commonMolecules = [
    { name: 'Water', formula: 'H₂O', elements: ['H', 'H', 'O'] },
    { name: 'Carbon Dioxide', formula: 'CO₂', elements: ['C', 'O', 'O'] },
    { name: 'Methane', formula: 'CH₄', elements: ['C', 'H', 'H', 'H', 'H'] },
    { name: 'Ammonia', formula: 'NH₃', elements: ['N', 'H', 'H', 'H'] },
    { name: 'Salt', formula: 'NaCl', elements: ['Na', 'Cl'] },
  ];

  // Generate quiz question
  const generateQuestion = () => {
    const questionTypes = ['symbol', 'name', 'number', 'group'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const element = elements[Math.floor(Math.random() * elements.length)];
    
    let question, answer;
    
    switch(type) {
      case 'symbol':
        question = `What is the symbol for ${element.name}?`;
        answer = element.symbol;
        break;
      case 'name':
        question = `What element has the symbol "${element.symbol}"?`;
        answer = element.name;
        break;
      case 'number':
        question = `What is the atomic number of ${element.name}?`;
        answer = element.number.toString();
        break;
      case 'group':
        question = `What type of element is ${element.name}?`;
        answer = element.group;
        break;
    }
    
    setCurrentQuestion({ question, answer, type });
  };

  // Handle quiz answer
  const handleQuizAnswer = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      setFeedback('Correct! ⚡');
    } else {
      setFeedback(`Incorrect. The answer is: ${currentQuestion.answer}`);
    }
    
    setQuestionsAsked(prev => prev + 1);
    setUserAnswer('');
    
    setTimeout(() => {
      setFeedback('');
      if (questionsAsked < 9) {
        generateQuestion();
      } else {
        setGameMode('quizComplete');
      }
    }, 2000);
  };

  // Start quiz mode
  const startQuiz = () => {
    setGameMode('quiz');
    setScore(0);
    setQuestionsAsked(0);
    setCorrectAnswers(0);
    setUserAnswer('');
    setFeedback('');
    generateQuestion();
  };

  // Add element to molecule builder
  const addToMolecule = (element) => {
    setMolecule(prev => [...prev, element]);
  };

  // Remove element from molecule
  const removeFromMolecule = (index) => {
    setMolecule(prev => prev.filter((_, i) => i !== index));
  };

  // Check if built molecule matches any common molecule
  const checkMolecule = () => {
    const builtFormula = molecule.map(el => el.symbol).sort().join('');
    const match = commonMolecules.find(mol => {
      const molFormula = mol.elements.sort().join('');
      return molFormula === builtFormula;
    });
    
    if (match) {
      setFeedback(`🎉 You built ${match.name} (${match.formula})!`);
      setScore(prev => prev + 20);
    } else if (molecule.length > 0) {
      setFeedback('Not a recognized molecule. Try again!');
    }
    
    setTimeout(() => setFeedback(''), 3000);
  };

  // Menu screen
  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border border-white/20">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⚛️</div>
            <h1 className="text-4xl font-bold text-white mb-2">Periodic Table Explorer</h1>
            <p className="text-blue-200">Master the elements and build molecules!</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setGameMode('explore')}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-6 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Book className="w-8 h-8 mx-auto mb-2" />
              <div>Explore</div>
              <div className="text-sm opacity-80">Learn about elements</div>
            </button>
            
            <button
              onClick={startQuiz}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Zap className="w-8 h-8 mx-auto mb-2" />
              <div>Quiz</div>
              <div className="text-sm opacity-80">Test your knowledge</div>
            </button>
            
            <button
              onClick={() => {
                setGameMode('build');
                setMolecule([]);
                setScore(0);
                setFeedback('');
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-6 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Beaker className="w-8 h-8 mx-auto mb-2" />
              <div>Build</div>
              <div className="text-sm opacity-80">Create molecules</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Explore mode
  if (gameMode === 'explore') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Element Explorer</h1>
            <button
              onClick={() => setGameMode('menu')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              Back to Menu
            </button>
          </div>
          
          {/* Periodic table grid */}
          <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-18 gap-2 mb-8">
            {elements.map(element => (
              <button
                key={element.symbol}
                onClick={() => setSelectedElement(element)}
                className="aspect-square bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg flex flex-col items-center justify-center text-white transition-all duration-200 transform hover:scale-105"
                style={{ backgroundColor: element.color + '40', borderColor: element.color }}
              >
                <div className="text-xs font-bold">{element.number}</div>
                <div className="text-sm font-bold">{element.symbol}</div>
                <div className="text-xs opacity-80">{element.name}</div>
              </button>
            ))}
          </div>
          
          {/* Element details */}
          {selectedElement && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-center mb-4">
                    <div 
                      className="w-24 h-24 mx-auto rounded-2xl flex flex-col items-center justify-center text-white border-2 mb-4"
                      style={{ backgroundColor: selectedElement.color + '60', borderColor: selectedElement.color }}
                    >
                      <div className="text-xs font-bold">{selectedElement.number}</div>
                      <div className="text-2xl font-bold">{selectedElement.symbol}</div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedElement.name}</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Properties</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Atomic Number:</span>
                        <span className="text-white font-medium">{selectedElement.number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Element Type:</span>
                        <span className="text-white font-medium capitalize">{selectedElement.group}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Symbol:</span>
                        <span className="text-white font-medium">{selectedElement.symbol}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Fun Fact!</h4>
                    <p className="text-gray-200 text-sm">
                      {selectedElement.name === 'Hydrogen' && 'Hydrogen is the most abundant element in the universe!'}
                      {selectedElement.name === 'Helium' && 'Helium makes your voice sound funny because it\'s less dense than air!'}
                      {selectedElement.name === 'Oxygen' && 'You breathe oxygen every day - it makes up 21% of Earth\'s atmosphere!'}
                      {selectedElement.name === 'Carbon' && 'Carbon is the basis of all life on Earth!'}
                      {selectedElement.name === 'Gold' && 'Gold never rusts or tarnishes!'}
                      {!['Hydrogen', 'Helium', 'Oxygen', 'Carbon', 'Gold'].includes(selectedElement.name) && 
                       `${selectedElement.name} is an important element with many uses in science and industry!`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz mode
  if (gameMode === 'quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full border border-white/20">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-white">
              <div className="text-sm opacity-80">Question {questionsAsked + 1}/10</div>
              <div className="text-2xl font-bold">Score: {score}</div>
            </div>
            <div className="text-right text-white">
              <div className="text-sm opacity-80">Correct</div>
              <div className="text-xl font-bold">{correctAnswers}/{questionsAsked}</div>
            </div>
          </div>
          
          {/* Question */}
          <div className="text-center mb-8">
            <div className="text-2xl font-bold text-white mb-6">
              {currentQuestion?.question}
            </div>
            
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && userAnswer && handleQuizAnswer()}
              className="w-full text-xl text-center bg-white/20 border border-white/30 rounded-xl py-4 px-6 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Your answer..."
              autoFocus
            />
          </div>
          
          {/* Submit button */}
          <button
            onClick={handleQuizAnswer}
            disabled={!userAnswer}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Submit Answer ⚡
          </button>
          
          {/* Feedback */}
          {feedback && (
            <div className="mt-6 text-center">
              <div className={`text-lg font-semibold ${
                feedback.includes('Correct') ? 'text-green-400' : 'text-red-400'
              }`}>
                {feedback}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz complete
  if (gameMode === 'quizComplete') {
    const percentage = Math.round((correctAnswers / 10) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full border border-white/20">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '🥈' : '🥉'}
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h1>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-blue-200 mb-1">Final Score</div>
              <div className="text-3xl font-bold text-white">{score}</div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-blue-200 mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-white">{correctAnswers}/10 ({percentage}%)</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={startQuiz}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Try Again
            </button>
            <button
              onClick={() => setGameMode('menu')}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Molecule builder mode
  if (gameMode === 'build') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Molecule Builder</h1>
              <div className="text-white">Score: {score}</div>
            </div>
            <button
              onClick={() => setGameMode('menu')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              Back to Menu
            </button>
          </div>
          
          {/* Current molecule */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Your Molecule</h2>
            <div className="flex flex-wrap gap-2 mb-4 min-h-[60px]">
              {molecule.map((element, index) => (
                <button
                  key={index}
                  onClick={() => removeFromMolecule(index)}
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold border-2 hover:bg-white/20 transition-all duration-200"
                  style={{ backgroundColor: element.color + '60', borderColor: element.color }}
                >
                  {element.symbol}
                </button>
              ))}
              {molecule.length === 0 && (
                <div className="text-gray-400 text-center flex-1 py-4">
                  Click elements below to build your molecule
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={checkMolecule}
                disabled={molecule.length === 0}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Check Molecule
              </button>
              
              <button
                onClick={() => setMolecule([])}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Clear
              </button>
            </div>
            
            {feedback && (
              <div className="mt-4 text-center text-lg font-semibold text-yellow-400">
                {feedback}
              </div>
            )}
          </div>
          
          {/* Element selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Elements</h2>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {elements.slice(0, 20).map(element => (
                <button
                  key={element.symbol}
                  onClick={() => addToMolecule(element)}
                  className="aspect-square bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg flex flex-col items-center justify-center text-white transition-all duration-200 transform hover:scale-105"
                  style={{ backgroundColor: element.color + '40', borderColor: element.color }}
                >
                  <div className="text-xs font-bold">{element.number}</div>
                  <div className="text-sm font-bold">{element.symbol}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Common molecules reference */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-8 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Try Building These</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {commonMolecules.map((mol, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-3">
                  <div className="text-white font-semibold">{mol.name}</div>
                  <div className="text-blue-300 text-sm">{mol.formula}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Export metadata for Playground listing
export const metadata = {
  name: "Periodic Table Explorer",
  gradeLevel: "8-12",
  category: "Chemistry",
  icon: "⚛️"
};