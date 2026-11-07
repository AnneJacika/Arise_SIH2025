// import React, { useState, useEffect } from 'react';

// const GAME_MODES = {
//   VISUAL_MATCH: 'visual_match',
//   EQUIVALENT: 'equivalent', 
//   COMPARE: 'compare',
//   ADD_SUBTRACT: 'add_subtract'
// };

// const generateFraction = (maxDenominator = 12) => {
//   const denominator = Math.floor(Math.random() * maxDenominator) + 2;
//   const numerator = Math.floor(Math.random() * denominator) + 1;
//   return { numerator, denominator };
// };

// const simplifyFraction = (numerator, denominator) => {
//   const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
//   const divisor = gcd(numerator, denominator);
//   return {
//     numerator: numerator / divisor,
//     denominator: denominator / divisor
//   };
// };

// const fractionsEqual = (f1, f2) => {
//   const s1 = simplifyFraction(f1.numerator, f1.denominator);
//   const s2 = simplifyFraction(f2.numerator, f2.denominator);
//   return s1.numerator === s2.numerator && s1.denominator === s2.denominator;
// };

// const FractionVisual = ({ numerator, denominator, size = 80, className = "" }) => {
//   const filled = Math.floor((numerator / denominator) * 8);
//   const segments = Array.from({ length: 8 }, (_, i) => i < filled);

//   if (denominator <= 4) {
//     return (
//       <div className={`relative ${className}`} style={{ width: size, height: size }}>
//         <div className="w-full h-full rounded-lg border-4 border-blue-600 overflow-hidden bg-white">
//           <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5 p-1">
//             {Array.from({ length: denominator }).map((_, i) => (
//               <div
//                 key={i}
//                 className={`rounded ${
//                   i < numerator ? 'bg-blue-500' : 'bg-gray-200'
//                 }`}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`relative ${className}`} style={{ width: size, height: size }}>
//       <svg width={size} height={size} className="transform -rotate-90">
//         <circle
//           cx={size/2}
//           cy={size/2}
//           r={size/2 - 6}
//           fill="white"
//           stroke="#2563eb"
//           strokeWidth="4"
//         />
//         {segments.map((filled, i) => {
//           const angle = (360 / 8) * i;
//           const x1 = size/2;
//           const y1 = size/2;
//           const x2 = size/2 + (size/2 - 10) * Math.cos((angle * Math.PI) / 180);
//           const y2 = size/2 + (size/2 - 10) * Math.sin((angle * Math.PI) / 180);
//           const x3 = size/2 + (size/2 - 10) * Math.cos(((angle + 45) * Math.PI) / 180);
//           const y3 = size/2 + (size/2 - 10) * Math.sin(((angle + 45) * Math.PI) / 180);

//           return (
//             <path
//               key={i}
//               d={`M ${x1} ${y1} L ${x2} ${y2} A ${size/2 - 10} ${size/2 - 10} 0 0 1 ${x3} ${y3} Z`}
//               fill={filled ? '#3b82f6' : '#e5e7eb'}
//               stroke="#2563eb"
//               strokeWidth="1"
//             />
//           );
//         })}
//       </svg>
//       <div className="absolute inset-0 flex items-center justify-center">
//         <span className="text-sm font-bold text-gray-700 bg-white/80 px-2 py-1 rounded">
//           {numerator}/{denominator}
//         </span>
//       </div>
//     </div>
//   );
// };

// export function FractionFrenzy() {
//   const [gameMode, setGameMode] = useState(GAME_MODES.VISUAL_MATCH);
//   const [currentQuestion, setCurrentQuestion] = useState(null);
//   const [options, setOptions] = useState([]);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const [score, setScore] = useState(0);
//   const [streak, setStreak] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [gameStatus, setGameStatus] = useState('ready'); // 'ready', 'playing', 'finished'
//   const [feedback, setFeedback] = useState('');

//   useEffect(() => {
//     let timer;
//     if (gameStatus === 'playing' && timeLeft > 0) {
//       timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//     } else if (timeLeft === 0 && gameStatus === 'playing') {
//       setGameStatus('finished');
//     }
//     return () => clearTimeout(timer);
//   }, [timeLeft, gameStatus]);

//   const generateVisualMatchQuestion = () => {
//     const target = generateFraction(8);
//     const correct = { ...target };
//     const wrongs = [];
    
//     while (wrongs.length < 3) {
//       const wrong = generateFraction(8);
//       if (!fractionsEqual(wrong, target) && !wrongs.some(w => fractionsEqual(w, wrong))) {
//         wrongs.push(wrong);
//       }
//     }
    
//     const allOptions = [correct, ...wrongs].sort(() => Math.random() - 0.5);
    
//     setCurrentQuestion({
//       type: 'visual_match',
//       target,
//       question: "Which fraction matches the visual?",
//       correctAnswer: allOptions.findIndex(opt => fractionsEqual(opt, correct))
//     });
//     setOptions(allOptions);
//   };

//   const generateEquivalentQuestion = () => {
//     const base = generateFraction(6);
//     const multiplier = Math.floor(Math.random() * 3) + 2;
//     const equivalent = {
//       numerator: base.numerator * multiplier,
//       denominator: base.denominator * multiplier
//     };
    
//     const wrongs = [];
//     while (wrongs.length < 3) {
//       const wrong = generateFraction(12);
//       if (!fractionsEqual(wrong, base) && !wrongs.some(w => fractionsEqual(w, wrong))) {
//         wrongs.push(wrong);
//       }
//     }
    
//     const allOptions = [base, ...wrongs].sort(() => Math.random() - 0.5);
    
//     setCurrentQuestion({
//       type: 'equivalent',
//       target: equivalent,
//       question: `Which fraction is equivalent to ${equivalent.numerator}/${equivalent.denominator}?`,
//       correctAnswer: allOptions.findIndex(opt => fractionsEqual(opt, base))
//     });
//     setOptions(allOptions);
//   };

//   const generateCompareQuestion = () => {
//     const f1 = generateFraction(10);
//     const f2 = generateFraction(10);
    
//     const val1 = f1.numerator / f1.denominator;
//     const val2 = f2.numerator / f2.denominator;
    
//     let correctAnswer;
//     if (val1 > val2) correctAnswer = 0;
//     else if (val1 < val2) correctAnswer = 1;
//     else correctAnswer = 2;
    
//     setCurrentQuestion({
//       type: 'compare',
//       fractions: [f1, f2],
//       question: `Compare these fractions:`,
//       correctAnswer
//     });
//     setOptions([
//       `${f1.numerator}/${f1.denominator} > ${f2.numerator}/${f2.denominator}`,
//       `${f1.numerator}/${f1.denominator} < ${f2.numerator}/${f2.denominator}`,
//       `${f1.numerator}/${f1.denominator} = ${f2.numerator}/${f2.denominator}`
//     ]);
//   };

//   const generateAddSubtractQuestion = () => {
//     const commonDenom = [4, 6, 8, 12][Math.floor(Math.random() * 4)];
//     let f1 = { numerator: Math.floor(Math.random() * commonDenom) + 1, denominator: commonDenom };
//     let f2 = { numerator: Math.floor(Math.random() * commonDenom) + 1, denominator: commonDenom };
    
//     const operation = Math.random() > 0.5 ? 'add' : 'subtract';
    
//     let result;
//     if (operation === 'add') {
//       result = simplifyFraction(f1.numerator + f2.numerator, commonDenom);
//     } else {
//       if (f1.numerator < f2.numerator) [f1, f2] = [f2, f1]; // swap to keep positive
//       result = simplifyFraction(f1.numerator - f2.numerator, commonDenom);
//     }
    
//     const wrongs = [];
//     while (wrongs.length < 3) {
//       const wrong = generateFraction(12);
//       if (!fractionsEqual(wrong, result) && !wrongs.some(w => fractionsEqual(w, wrong))) {
//         wrongs.push(wrong);
//       }
//     }
    
//     const allOptions = [result, ...wrongs].sort(() => Math.random() - 0.5);
    
//     setCurrentQuestion({
//       type: 'add_subtract',
//       fractions: [f1, f2],
//       operation,
//       question: `${f1.numerator}/${f1.denominator} ${operation === 'add' ? '+' : '-'} ${f2.numerator}/${f2.denominator} = ?`,
//       correctAnswer: allOptions.findIndex(opt => fractionsEqual(opt, result))
//     });
//     setOptions(allOptions);
//   };


//   const generateQuestion = () => {
//     setSelectedAnswer(null);
//     setFeedback('');
    
//     switch (gameMode) {
//       case GAME_MODES.VISUAL_MATCH:
//         generateVisualMatchQuestion();
//         break;
//       case GAME_MODES.EQUIVALENT:
//         generateEquivalentQuestion();
//         break;
//       case GAME_MODES.COMPARE:
//         generateCompareQuestion();
//         break;
//       case GAME_MODES.ADD_SUBTRACT:
//         generateAddSubtractQuestion();
//         break;
//     }
//   };

//   const handleAnswer = (answerIndex) => {
//     if (selectedAnswer !== null) return;
    
//     setSelectedAnswer(answerIndex);
//     const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
//     if (isCorrect) {
//       const points = (10 + streak) * (timeLeft > 30 ? 2 : 1);
//       setScore(prev => prev + points);
//       setStreak(prev => prev + 1);
//       setFeedback(`🎉 Correct! +${points} points`);
//     } else {
//       setStreak(0);
//       setFeedback('❌ Try again!');
//     }
    
//     setTimeout(() => {
//       if (gameStatus === 'playing') {
//         generateQuestion();
//       }
//     }, 1500);
//   };

//   const startGame = () => {
//     setScore(0);
//     setStreak(0);
//     setTimeLeft(60);
//     setGameStatus('playing');
//     generateQuestion();
//   };

//   const resetGame = () => {
//     setGameStatus('ready');
//     setSelectedAnswer(null);
//     setFeedback('');
//     setCurrentQuestion(null);
//   };

//   const renderQuestion = () => {
//     if (!currentQuestion) return null;

//     switch (currentQuestion.type) {
//       case 'visual_match':
//         return (
//           <div className="text-center">
//             <FractionVisual 
//               numerator={currentQuestion.target.numerator} 
//               denominator={currentQuestion.target.denominator} 
//               size={120}
//               className="mx-auto mb-4"
//             />
//             <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
//             <div className="grid grid-cols-2 gap-4">
//               {options.map((option, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleAnswer(index)}
//                   disabled={selectedAnswer !== null}
//                   className={`p-4 rounded-lg border-2 transition-all duration-300 ${
//                     selectedAnswer === index
//                       ? index === currentQuestion.correctAnswer
//                         ? 'bg-green-100 border-green-500'
//                         : 'bg-red-100 border-red-500'
//                       : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
//                   } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
//                 >
//                   <div className="font-bold text-lg">{option.numerator}/{option.denominator}</div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         );

//       case 'compare':
//         return (
//           <div className="text-center">
//             <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>
//             <div className="flex justify-center gap-8 mb-6">
//               <FractionVisual 
//                 numerator={currentQuestion.fractions[0].numerator} 
//                 denominator={currentQuestion.fractions[0].denominator} 
//                 size={100}
//               />
//               <div className="flex items-center text-4xl font-bold text-gray-400">VS</div>
//               <FractionVisual 
//                 numerator={currentQuestion.fractions[1].numerator} 
//                 denominator={currentQuestion.fractions[1].denominator} 
//                 size={100}
//               />
//             </div>
//             <div className="space-y-3">
//               {options.map((option, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleAnswer(index)}
//                   disabled={selectedAnswer !== null}
//                   className={`block w-full p-4 rounded-lg border-2 transition-all duration-300 font-semibold text-lg ${
//                     selectedAnswer === index
//                       ? index === currentQuestion.correctAnswer
//                         ? 'bg-green-100 border-green-500 text-green-800'
//                         : 'bg-red-100 border-red-500 text-red-800'
//                       : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
//                   } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
//                 >
//                   {option}
//                 </button>
//               ))}
//             </div>
//           </div>
//         );

//       default:
//         return (
//           <div className="text-center">
//             <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>
//             {currentQuestion.type === 'add_subtract' && (
//               <div className="flex justify-center gap-4 items-center mb-6 text-2xl font-bold">
//                 <FractionVisual 
//                   numerator={currentQuestion.fractions[0].numerator} 
//                   denominator={currentQuestion.fractions[0].denominator} 
//                   size={80}
//                 />
//                 <span className="text-4xl text-gray-600">
//                   {currentQuestion.operation === 'add' ? '+' : '-'}
//                 </span>
//                 <FractionVisual 
//                   numerator={currentQuestion.fractions[1].numerator} 
//                   denominator={currentQuestion.fractions[1].denominator} 
//                   size={80}
//                 />
//                 <span className="text-4xl text-gray-600">=</span>
//                 <span className="text-4xl text-gray-600">?</span>
//               </div>
//             )}
//             <div className="grid grid-cols-2 gap-4">
//               {options.map((option, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleAnswer(index)}
//                   disabled={selectedAnswer !== null}
//                   className={`p-4 rounded-lg border-2 transition-all duration-300 ${
//                     selectedAnswer === index
//                       ? index === currentQuestion.correctAnswer
//                         ? 'bg-green-100 border-green-500'
//                         : 'bg-red-100 border-red-500'
//                       : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
//                   } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
//                 >
//                   <div className="font-bold text-lg">
//                     {typeof option === 'string' ? option : `${option.numerator}/${option.denominator}`}
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-orange-50 to-red-50 min-h-screen">
//       <div className="text-center mb-6">
//         <h1 className="text-4xl font-bold text-gray-800 mb-2">🔢 Fraction Frenzy</h1>
//         <p className="text-gray-600">Master fractions through visual puzzles and challenges!</p>
//       </div>

//       {gameStatus === 'ready' && (
//         <div className="bg-white p-8 rounded-lg shadow-lg text-center">
//           <h2 className="text-2xl font-bold mb-6">Choose Your Challenge</h2>
//           <div className="grid grid-cols-2 gap-4 mb-6">
//             <button
//               onClick={() => setGameMode(GAME_MODES.VISUAL_MATCH)}
//               className={`p-6 rounded-lg border-2 transition-all ${
//                 gameMode === GAME_MODES.VISUAL_MATCH
//                   ? 'bg-blue-100 border-blue-500'
//                   : 'bg-gray-100 border-gray-300 hover:border-blue-400'
//               }`}
//             >
//               <div className="text-3xl mb-2">👁️</div>
//               <div className="font-semibold">Visual Match</div>
//               <div className="text-sm text-gray-600">Match fractions to visuals</div>
//             </button>
//             <button
//               onClick={() => setGameMode(GAME_MODES.EQUIVALENT)}
//               className={`p-6 rounded-lg border-2 transition-all ${
//                 gameMode === GAME_MODES.EQUIVALENT
//                   ? 'bg-blue-100 border-blue-500'
//                   : 'bg-gray-100 border-gray-300 hover:border-blue-400'
//               }`}
//             >
//               <div className="text-3xl mb-2">⚖️</div>
//               <div className="font-semibold">Equivalents</div>
//               <div className="text-sm text-gray-600">Find equivalent fractions</div>
//             </button>
//             <button
//               onClick={() => setGameMode(GAME_MODES.COMPARE)}
//               className={`p-6 rounded-lg border-2 transition-all ${
//                 gameMode === GAME_MODES.COMPARE
//                   ? 'bg-blue-100 border-blue-500'
//                   : 'bg-gray-100 border-gray-300 hover:border-blue-400'
//               }`}
//             >
//               <div className="text-3xl mb-2">🔍</div>
//               <div className="font-semibold">Compare</div>
//               <div className="text-sm text-gray-600">Which is greater?</div>
//             </button>
//             <button
//               onClick={() => setGameMode(GAME_MODES.ADD_SUBTRACT)}
//               className={`p-6 rounded-lg border-2 transition-all ${
//                 gameMode === GAME_MODES.ADD_SUBTRACT
//                   ? 'bg-blue-100 border-blue-500'
//                   : 'bg-gray-100 border-gray-300 hover:border-blue-400'
//               }`}
//             >
//               <div className="text-3xl mb-2">➕</div>
//               <div className="font-semibold">Add & Subtract</div>
//               <div className="text-sm text-gray-600">Fraction operations</div>
//             </button>
//           </div>
//           <button
//             onClick={startGame}
//             className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl rounded-lg transition-colors shadow-lg"
//           >
//             Start Game!
//           </button>
//         </div>
//       )}

//       {gameStatus === 'playing' && (
//         <div>
//           {/* Game Stats */}
//           <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
//             <div className="flex gap-6">
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-orange-600">{score}</div>
//                 <div className="text-sm text-gray-600">Score</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-blue-600">{streak}</div>
//                 <div className="text-sm text-gray-600">Streak</div>
//               </div>
//             </div>
//             <div className="text-center">
//               <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-green-600'}`}>
//                 {timeLeft}s
//               </div>
//               <div className="text-sm text-gray-600">Time Left</div>
//             </div>
//           </div>

//           {/* Question Area */}
//           <div className="bg-white p-8 rounded-lg shadow-lg mb-4">
//             {renderQuestion()}
//           </div>

//           {/* Feedback */}
//           {feedback && (
//             <div className={`text-center p-4 rounded-lg font-semibold text-lg ${
//               feedback.includes('Correct') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//             }`}>
//               {feedback}
//             </div>
//           )}
//         </div>
//       )}

//       {gameStatus === 'finished' && (
//         <div className="bg-white p-8 rounded-lg shadow-lg text-center">
//           <h2 className="text-3xl font-bold mb-4">🎊 Time's Up!</h2>
//           <div className="grid grid-cols-2 gap-6 mb-6">
//             <div className="bg-orange-100 p-6 rounded-lg">
//               <div className="text-3xl font-bold text-orange-600">{score}</div>
//               <div className="text-gray-600">Final Score</div>
//             </div>
//             <div className="bg-blue-100 p-6 rounded-lg">
//               <div className="text-3xl font-bold text-blue-600">{Math.floor(score / 60)}</div>
//               <div className="text-gray-600">Questions Per Minute</div>
//             </div>
//           </div>
//           <div className="space-y-3">
//             <button
//               onClick={startGame}
//               className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors mr-4"
//             >
//               Play Again
//             </button>
//             <button
//               onClick={resetGame}
//               className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
//             >
//               Change Mode
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export const metadata = {
//   name: "Fraction Frenzy",
//   gradeLevel: "3-8",
//   category: "Math",
//   icon: "🔢"
// };