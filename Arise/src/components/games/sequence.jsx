import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Plus, Move3D, AlertTriangle, CheckCircle, Trophy, Star, Target, Trash2, BookOpenText } from 'lucide-react';

export function LogicEngineGame() {
  // Biological process sequences
  const bioElements = {
    // Cell Division Process
    'DNA_REP': { name: 'DNA Replication', icon: '🧬', color: 'bg-gradient-to-br from-purple-300 to-lavender-400 border-purple-300' },
    'SPINDLE': { name: 'Spindle Formation', icon: '🕸️', color: 'bg-gradient-to-br from-indigo-300 to-purple-400 border-indigo-300' },
    'ALIGN': { name: 'Chromosome Alignment', icon: '📏', color: 'bg-gradient-to-br from-violet-300 to-purple-400 border-violet-300' },
    'SEPARATE': { name: 'Chromosome Separation', icon: '↔️', color: 'bg-gradient-to-br from-purple-400 to-indigo-400 border-purple-400' },
    'CYTOKIN': { name: 'Cytokinesis', icon: '🔄', color: 'bg-gradient-to-br from-indigo-400 to-blue-400 border-indigo-400' },
    
    // Photosynthesis Process
    'LIGHT_ABS': { name: 'Light Absorption', icon: '☀️', color: 'bg-gradient-to-br from-yellow-200 to-amber-300 border-yellow-300' },
    'WATER_SPL': { name: 'Water Splitting', icon: '💧', color: 'bg-gradient-to-br from-blue-200 to-indigo-300 border-blue-300' },
    'CO2_FIX': { name: 'CO2 Fixation', icon: '🌱', color: 'bg-gradient-to-br from-green-200 to-emerald-300 border-green-300' },
    'CALVIN': { name: 'Calvin Cycle', icon: '🔄', color: 'bg-gradient-to-br from-teal-200 to-cyan-300 border-teal-300' },
    'GLUCOSE': { name: 'Glucose Formation', icon: '🍯', color: 'bg-gradient-to-br from-orange-200 to-yellow-300 border-orange-300' },
    
    // Protein Synthesis
    'TRANSCR': { name: 'Transcription', icon: '📝', color: 'bg-gradient-to-br from-slate-300 to-gray-400 border-slate-400' },
    'MRNA_PROC': { name: 'mRNA Processing', icon: '✂️', color: 'bg-gradient-to-br from-purple-300 to-violet-400 border-purple-400' },
    'RIBOSOME': { name: 'Ribosome Binding', icon: '🔗', color: 'bg-gradient-to-br from-cyan-300 to-blue-400 border-cyan-400' },
    'TRANSLAT': { name: 'Translation', icon: '🔤', color: 'bg-gradient-to-br from-lime-300 to-green-400 border-lime-400' },
    'PROTEIN': { name: 'Protein Folding', icon: '🧲', color: 'bg-gradient-to-br from-violet-300 to-purple-400 border-violet-400' },
    
    // Respiration Process
    'GLYCOL': { name: 'Glycolysis', icon: '⚡', color: 'bg-gradient-to-br from-yellow-300 to-orange-400 border-yellow-400' },
    'KREBS': { name: 'Krebs Cycle', icon: '🌀', color: 'bg-gradient-to-br from-green-300 to-teal-400 border-green-400' },
    'ETC': { name: 'Electron Transport', icon: '🔋', color: 'bg-gradient-to-br from-blue-300 to-indigo-400 border-blue-400' },
    'ATP_SYNTH': { name: 'ATP Synthesis', icon: '💪', color: 'bg-gradient-to-br from-red-300 to-pink-400 border-red-400' }
  };

  // Game levels with biological processes
  const levels = [
    {
      id: 1,
      name: "Cell Division Engine",
      sequence: ['DNA_REP', 'ALIGN', 'SPINDLE', 'CYTOKIN', 'SEPARATE'],
      target: ['DNA_REP', 'SPINDLE', 'ALIGN', 'SEPARATE', 'CYTOKIN'],
      maxAttempts: 5,
      description: "Fix the cell division process sequence",
      process: "Mitosis"
    },
    {
      id: 2,
      name: "Photosynthesis Engine",
      sequence: ['LIGHT_ABS', 'CO2_FIX', 'GLUCOSE'],
      target: ['LIGHT_ABS', 'WATER_SPL', 'CO2_FIX', 'CALVIN', 'GLUCOSE'],
      maxAttempts: 4,
      description: "Complete the missing steps in photosynthesis",
      process: "Photosynthesis"
    },
    {
      id: 3,
      name: "Protein Synthesis Engine",
      sequence: ['TRANSCR', 'MRNA_PROC', 'MRNA_PROC', 'RIBOSOME', 'TRANSLAT', 'PROTEIN'],
      target: ['TRANSCR', 'MRNA_PROC', 'RIBOSOME', 'TRANSLAT', 'PROTEIN'],
      maxAttempts: 3,
      description: "Optimize protein synthesis by removing the duplicate mRNA Processing step.",
      process: "Gene Expression"
    },
    {
      id: 4,
      name: "Cellular Respiration Engine",
      sequence: ['GLYCOL', 'KREBS', 'ETC', 'ATP_SYNTH'],
      target: ['GLYCOL', 'KREBS', 'ETC', 'ATP_SYNTH'],
      maxAttempts: 3,
      description: "Complete the steps in cellular respiration.",
      process: "Respiration"
    }
  ];

  const [currentLevel, setCurrentLevel] = useState(0);
  const [sequence, setSequence] = useState([...levels[0].sequence]);
  const [loops, setLoops] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [engineStatus, setEngineStatus] = useState('offline');
  const [currentStep, setCurrentStep] = useState(-1);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [availableElements, setAvailableElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showRewards, setShowRewards] = useState(false);
  const [earnedRewards, setEarnedRewards] = useState([]);
  const [showManual, setShowManual] = useState(false);

  const tools = [
    {
      id: 'swap',
      name: 'Swap Elements',
      icon: Move3D,
      color: 'from-purple-400 to-indigo-500',
      description: 'Swap two process steps',
      cost: 1
    },
    {
      id: 'insert',
      name: 'Insert Element',
      icon: Plus,
      color: 'from-violet-400 to-purple-500',
      description: 'Add a missing process step',
      cost: 2
    },
    {
      id: 'delete',
      name: 'Remove Element',
      icon: Trash2,
      color: 'from-indigo-400 to-blue-500',
      description: 'Delete an incorrect step',
      cost: 2
    },
    {
      id: 'loop',
      name: 'Loop Elements',
      icon: RotateCcw,
      color: 'from-purple-500 to-violet-600',
      description: 'Optimize cyclic processes',
      cost: 3
    }
  ];

  const rewards = {
    perfect: { name: "Perfect Biologist", icon: "👑", points: 500, condition: "Complete level without any failed attempts" },
    efficient: { name: "Process Expert", icon: "⚡", points: 300, condition: "Complete level with minimal tool usage" },
    persistent: { name: "Never Give Up", icon: "🛡️", points: 200, condition: "Complete level on final attempt" },
    speedster: { name: "Quick Researcher", icon: "🚀", points: 250, condition: "Complete level quickly" },
    master: { name: "Biology Master", icon: "🎓", points: 1000, condition: "Complete all levels" }
  };

  useEffect(() => {
    const level = levels[currentLevel];
    setSequence([...level.sequence]);
    setLoops([]);
    setAttemptsUsed(0);
    setEngineStatus('offline');
    setLevelComplete(false);
    
    const usedElements = new Set(level.sequence);
    const targetElements = new Set(level.target);
    const missingElements = [...targetElements].filter(el => !usedElements.has(el));
    const allRelevantElements = [...new Set([...level.target, ...Object.keys(bioElements)])];
    setAvailableElements(allRelevantElements);
    setSelectedElement(missingElements[0] || allRelevantElements[0]);
  }, [currentLevel]);

  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch(type) {
        case 'click':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          break;
        case 'error':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          break;
        case 'success':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          break;
        case 'reward':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          break;
        case 'delete':
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          break;
      }
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      // Fallback if audio context fails
    }
  };

  const handleToolSelect = (toolId) => {
    playSound('click');
    setSelectedTool(selectedTool === toolId ? null : toolId);
    setSelectedItems([]);
  };

  const handleItemClick = (index) => {
    if (!selectedTool || isRunning || attemptsUsed >= levels[currentLevel].maxAttempts) return;
    
    playSound(selectedTool === 'delete' ? 'delete' : 'click');
    
    switch(selectedTool) {
      case 'swap':
        if (selectedItems.length === 0) {
          setSelectedItems([index]);
        } else if (selectedItems.length === 1) {
          const [firstIndex] = selectedItems;
          if (firstIndex !== index) {
            const newSequence = [...sequence];
            [newSequence[firstIndex], newSequence[index]] = [newSequence[index], newSequence[firstIndex]];
            setSequence(newSequence);
          }
          setSelectedItems([]);
          setSelectedTool(null);
        }
        break;
        
      case 'insert':
        if (selectedElement) {
          const newSequence = [...sequence];
          newSequence.splice(index, 0, selectedElement);
          setSequence(newSequence);
          setSelectedTool(null);
        }
        break;
        
      case 'delete':
        const newSequence = [...sequence];
        newSequence.splice(index, 1);
        setSequence(newSequence);
        setSelectedTool(null);
        break;
        
      case 'loop':
        if (selectedItems.length === 0) {
          setSelectedItems([index]);
        } else if (selectedItems.length === 1) {
          const [startIndex] = selectedItems;
          const start = Math.min(startIndex, index);
          const end = Math.max(startIndex, index);
          const newLoops = [...loops, { start, end, id: Date.now() }];
          setLoops(newLoops);
          setSelectedItems([]);
          setSelectedTool(null);
        }
        break;
    }
  };

  const processSequenceWithModifications = (seq) => {
    let processedSeq = [...seq];
    
    // Custom logic to fix the duplicate MRNA_PROC in Level 3
    if (currentLevel === 2) {
      const isMRNAProcessed = loops.some(loop => loop.start <= 1 && loop.end >= 2);
      if (isMRNAProcessed) {
        let mRNALoopStartIndex = -1;
        for (let i = 0; i < processedSeq.length - 1; i++) {
          if (processedSeq[i] === 'MRNA_PROC' && processedSeq[i+1] === 'MRNA_PROC') {
            mRNALoopStartIndex = i;
            break;
          }
        }
        if (mRNALoopStartIndex !== -1) {
          processedSeq.splice(mRNALoopStartIndex + 1, 1);
        }
      }
    }
    
    return processedSeq;
  };

  const calculateScore = (success, attempts, toolsUsed) => {
    if (!success) return 0;
    
    const baseScore = 1000;
    const attemptPenalty = (attempts - 1) * 100;
    const toolPenalty = toolsUsed * 50;
    const timeBonus = Math.max(0, 500 - (Date.now() % 10000));
    
    return Math.max(100, baseScore - attemptPenalty - toolPenalty + timeBonus);
  };

  const checkRewards = (levelScore, attempts, toolsUsed) => {
    const newRewards = [];
    
    if (attempts === 1) {
      newRewards.push('perfect');
    }
    if (toolsUsed <= 2) {
      newRewards.push('efficient');
    }
    if (attempts === levels[currentLevel].maxAttempts) {
      newRewards.push('persistent');
    }
    if (levelScore > 800) {
      newRewards.push('speedster');
    }
    if (currentLevel === levels.length - 1) {
      newRewards.push('master');
    }
    
    return newRewards;
  };

  const runEngine = async () => {
    setIsRunning(true);
    setEngineStatus('running');
    setCurrentStep(-1);
    setAttemptsUsed(prev => prev + 1);
    playSound('click');
    
    const processedSequence = processSequenceWithModifications(sequence);
    const targetSequence = levels[currentLevel].target;
    
    for (let i = 0; i < Math.max(processedSequence.length, targetSequence.length); i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (i >= processedSequence.length || i >= targetSequence.length || 
          processedSequence[i] !== targetSequence[i]) {
        setEngineStatus('error');
        setIsRunning(false);
        playSound('error');
        
        setTimeout(() => {
          setEngineStatus('offline');
          setCurrentStep(-1);
        }, 2000);
        return;
      }
    }
    
    if (processedSequence.length !== targetSequence.length) {
      setEngineStatus('error');
      setIsRunning(false);
      playSound('error');
      setTimeout(() => {
        setEngineStatus('offline');
        setCurrentStep(-1);
      }, 2000);
      return;
    }
    
    setEngineStatus('success');
    setLevelComplete(true);
    const toolsUsed = attemptsUsed;
    const levelScore = calculateScore(true, attemptsUsed, toolsUsed);
    setScore(levelScore);
    setTotalScore(prev => prev + levelScore);
    
    const newRewards = checkRewards(levelScore, attemptsUsed, toolsUsed);
    setEarnedRewards(newRewards);
    
    if (newRewards.length > 0) {
      setShowRewards(true);
      playSound('reward');
    } else {
      playSound('success');
    }
    
    setIsRunning(false);
    setCurrentStep(-1);
    
    if (currentLevel === levels.length - 1) {
      setGameComplete(true);
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(prev => prev + 1);
      setScore(0);
      setShowRewards(false);
      setEarnedRewards([]);
    }
  };

  const resetLevel = () => {
    const level = levels[currentLevel];
    setSequence([...level.sequence]);
    setLoops([]);
    setAttemptsUsed(0);
    setEngineStatus('offline');
    setLevelComplete(false);
    setScore(0);
    setSelectedTool(null);
    setSelectedItems([]);
    setCurrentStep(-1);
    playSound('click');
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setTotalScore(0);
    setGameComplete(false);
    resetLevel();
  };

  const currentLevelData = levels[currentLevel];
  const attemptsLeft = currentLevelData.maxAttempts - attemptsUsed;

  const manualContent = (
    <div className="text-left text-gray-700">
      <h3 className="text-2xl font-bold text-purple-700 mb-4">How to Play</h3>
      <p className="mb-4 text-sm md:text-base">
        Your mission is to fix and optimize biological processes by arranging their steps in the correct order.
        Use the <strong>Tool Panel</strong> to manipulate the sequence until it matches the biological target.
      </p>

      <h4 className="text-xl font-bold text-indigo-600 mb-2">Tool Explanations</h4>
      <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
        <li><strong className="text-purple-600">Swap Elements:</strong> Swap two steps to correct their order.</li>
        <li><strong className="text-violet-600">Insert Element:</strong> Add a missing step from the available selection.</li>
        <li><strong className="text-indigo-600">Remove Element:</strong> Delete an incorrect or duplicate step.</li>
        <li><strong className="text-purple-700">Loop Elements:</strong> Group steps that repeat cyclically to optimize the sequence.</li>
      </ul>

      <p className="mb-4 text-sm md:text-base">
        Click <strong className="text-purple-600">START PROCESS</strong> to test your solution. The engine will indicate if your sequence is correct or where it fails.
      </p>

      <p className="mb-4 text-sm md:text-base">
        Click <strong className="text-indigo-600">RESET</strong> to revert the sequence to its original state for the current level.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-indigo-100 p-4 md:p-8 font-sans text-gray-800">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 via-lavender-200 to-indigo-200 blur-3xl opacity-40 rounded-full"></div>
            <h1 className="relative text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent mb-4 tracking-wide drop-shadow-sm">
              ORDER UP
            </h1>
          </div>
          <div className="bg-gradient-to-r from-white/70 via-purple-50/70 to-indigo-50/70 backdrop-blur-sm rounded-2xl border border-purple-200/50 p-6 mb-6 shadow-xl">
            <p className="text-xl md:text-2xl font-bold text-purple-700 mb-4">{currentLevelData.process} Simulation</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-purple-100/80 to-indigo-100/80 rounded-xl p-4 border border-purple-200/50 backdrop-blur-sm shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <BookOpenText className="text-purple-600" size={24} />
                  <span className="text-lg font-bold text-purple-700">Level Progress</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">{currentLevel + 1}</span>
                  <span className="text-lg text-purple-600">/{levels.length}</span>
                </div>
                <div className="w-full bg-purple-200/50 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-purple-400 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                       style={{ width: `${((currentLevel + 1) / levels.length) * 100}%` }}></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-100/80 to-violet-100/80 rounded-xl p-4 border border-indigo-200/50 backdrop-blur-sm shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <AlertTriangle className="text-indigo-600" size={24} />
                  <span className="text-lg font-bold text-indigo-700">Attempts</span>
                </div>
                <div className="text-center">
                  <span className={`text-2xl font-bold ${attemptsLeft <= 1 ? 'text-red-500' : 'text-gray-800'}`}>{attemptsLeft}</span>
                  <span className="text-lg text-indigo-600"> remaining</span>
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  {Array.from({ length: currentLevelData.maxAttempts }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < attemptsUsed ? 'bg-red-400' : 'bg-indigo-200/60'}`}></div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-violet-100/80 to-purple-100/80 rounded-xl p-4 border border-violet-200/50 backdrop-blur-sm shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Trophy className="text-violet-600" size={24} />
                  <span className="text-lg font-bold text-violet-700">Score</span>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{score}</div>
                  <div className="text-sm text-violet-600">Total: {totalScore}</div>
                </div>
                <div className="flex justify-center gap-1 mt-2">
                  <Star className="text-yellow-400" size={16} />
                  <Star className="text-yellow-400" size={16} />
                  <Star className="text-yellow-400" size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Level Info */}
        <div className="bg-gradient-to-br from-white/60 to-purple-50/60 backdrop-blur-sm rounded-xl border border-purple-200/60 p-6 mb-6 text-center shadow-xl">
          <h3 className="text-xl md:text-2xl font-bold text-purple-700 mb-2">{currentLevelData.name}</h3>
          <p className="text-gray-700 text-sm md:text-base">{currentLevelData.description}</p>
        </div>

        {/* Dynamic Test Case Display */}
        {currentLevel === 2 && (
          <div className="bg-gradient-to-br from-violet-50/80 to-purple-50/80 p-4 rounded-lg mb-4 border border-violet-200/50 text-left text-gray-700 shadow-lg backdrop-blur-sm">
            <h4 className="text-lg font-bold text-violet-700 mb-1 flex items-center gap-2">
              <Star className="text-yellow-500" /> Challenge: Optimize Protein Synthesis
            </h4>
            <p className="text-sm">
              The <span className="font-bold text-purple-600">mRNA Processing</span> step is duplicated. Use the <span className="font-bold text-indigo-600">Remove Element</span> tool to fix the sequence.
            </p>
          </div>
        )}

        {/* Main Engine Display */}
        <div className="bg-gradient-to-br from-white/50 to-purple-50/50 backdrop-blur-sm rounded-2xl border border-purple-200/60 p-8 mb-6 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-4 uppercase tracking-wide">PROCESS SEQUENCE</h2>
            
            {/* Engine Visual */}
            <div className="relative mb-12">
              <div className={`w-36 h-36 mx-auto rounded-full border-4 transition-all duration-500 flex items-center justify-center relative ${
                engineStatus === 'offline' ? 'border-purple-300/60' :
                engineStatus === 'running' ? 'border-indigo-400/80 animate-pulse-slow' :
                engineStatus === 'error' ? 'border-red-400/80 animate-jiggle' :
                'border-violet-500/80 animate-pulse-slow'
              }`}>
                <div className={`w-full h-full rounded-full flex items-center justify-center transition-transform duration-1000 ${
                  engineStatus === 'offline' ? 'bg-purple-100/30' :
                  engineStatus === 'running' ? 'bg-indigo-100/40' :
                  engineStatus === 'error' ? 'bg-red-100/50' :
                  'bg-violet-100/40'
                }`}>
                  <div className="text-4xl">🧬</div>
                </div>
                {engineStatus === 'error' && (
                  <div className="absolute -top-4 -right-4 bg-red-100 border border-red-300 rounded-full p-2 animate-bounce-short">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                )}
                {engineStatus === 'success' && (
                  <div className="absolute -top-4 -right-4 bg-green-100 border border-green-300 rounded-full p-2 animate-bounce-short">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Sequence Display */}
            <div className="flex justify-center flex-wrap gap-4 max-w-4xl mx-auto">
              {sequence.map((elementKey, index) => {
                const element = bioElements[elementKey];
                return (
                  <div key={`${index}-${elementKey}`} className="relative">
                    <div
                      onClick={() => handleItemClick(index)}
                      className={`relative w-28 h-28 rounded-xl flex flex-col items-center justify-center text-xs font-bold cursor-pointer transition-all duration-300 p-2 shadow-lg hover:shadow-xl border-2 ${
                        currentStep === index ? 'ring-4 ring-indigo-400 animate-pulse' :
                        selectedItems.includes(index) ? 'ring-4 ring-purple-400' : ''
                      } ${
                        selectedTool ? 'hover:scale-105' : ''
                      } ${
                        engineStatus === 'error' && currentStep === index 
                          ? 'bg-red-200/80 border-red-400 text-red-800 animate-shake' 
                          : engineStatus === 'success' 
                          ? 'bg-green-200/80 border-green-400 text-green-800 animate-fade-in'
                          : `${element?.color || 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400'} text-gray-800 hover:brightness-110`
                      }`}
                    >
                      <div className="text-xl mb-1">{element?.icon || '❓'}</div>
                      <div className="text-center leading-tight">{element?.name || elementKey}</div>
                      {selectedItems.includes(index) && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Element Selection for Insertion */}
        {selectedTool === 'insert' && (
          <div className="bg-gradient-to-br from-violet-50/80 to-purple-50/80 rounded-xl p-4 mb-6 border border-purple-200/50 shadow-md backdrop-blur-sm">
            <h3 className="text-purple-700 font-semibold mb-3 text-center text-lg">Select Process Step to Insert:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-w-4xl mx-auto">
              {availableElements.map(elementKey => {
                const element = bioElements[elementKey];
                return (
                  <button
                    key={elementKey}
                    onClick={() => setSelectedElement(elementKey)}
                    className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                      selectedElement === elementKey
                        ? 'border-purple-400 bg-purple-100/60 scale-105 shadow-lg'
                        : 'border-purple-200/50 hover:border-purple-300'
                    } ${element?.color || 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400'} text-gray-800 text-xs`}
                  >
                    <div className="text-sm mb-1">{element?.icon || '❓'}</div>
                    <div className="leading-tight">{element?.name || elementKey}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tool Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            const isDisabled = isRunning || attemptsUsed >= currentLevelData.maxAttempts;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                disabled={isDisabled}
                className={`p-4 rounded-xl border-2 transition-all duration-300 shadow-md ${
                  selectedTool === tool.id
                    ? `border-purple-400 bg-gradient-to-br ${tool.color} text-white shadow-xl scale-105`
                    : 'border-purple-200/50 bg-gradient-to-br from-white/70 to-purple-50/70 text-purple-700 hover:border-purple-300/50 hover:bg-purple-100/70'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'} backdrop-blur-sm`}
              >
                <div className="flex flex-col items-center">
                  <IconComponent className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold text-sm">{tool.name}</div>
                  <div className="text-xs opacity-75 mt-1">{tool.description}</div>
                  <div className="text-xs mt-1 font-bold text-purple-800">Cost: {tool.cost}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Control Panel */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={runEngine}
            disabled={isRunning || attemptsUsed >= currentLevelData.maxAttempts}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-full border-2 border-purple-400 transition-all duration-300 hover:from-purple-500 hover:to-indigo-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
          >
            <Play className="w-6 h-6" />
            {isRunning ? 'PROCESSING...' : 'START PROCESS'}
          </button>
          
          <button
            onClick={resetLevel}
            disabled={isRunning}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-lg rounded-full border-2 border-violet-400 transition-all duration-300 hover:from-violet-500 hover:to-purple-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <RotateCcw className="w-6 h-6" />
            RESET
          </button>

          <button
            onClick={() => setShowManual(!showManual)}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg rounded-full border-2 border-indigo-400 transition-all duration-300 hover:from-indigo-500 hover:to-blue-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <BookOpenText className="w-6 h-6" />
            {showManual ? 'HIDE MANUAL' : 'SHOW MANUAL'}
          </button>

          {levelComplete && !gameComplete && (
            <button
              onClick={nextLevel}
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-green-600 text-white font-bold text-lg rounded-full border-2 border-teal-400 transition-all duration-300 hover:from-teal-500 hover:to-green-500 hover:scale-105 flex items-center gap-3 shadow-lg"
            >
              <Target className="w-6 h-6" />
              NEXT PROCESS
            </button>
          )}
        </div>

        {/* Game Over State */}
        {attemptsUsed >= currentLevelData.maxAttempts && !levelComplete && (
          <div className="bg-gradient-to-br from-red-100/50 to-pink-100/50 rounded-xl p-6 mt-8 text-center border border-red-300/50 shadow-xl backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-red-700 mb-4">PROCESS FAILED</h3>
            <p className="text-red-600 mb-4 text-sm md:text-base">All repair attempts exhausted. Order Up is disrupted.</p>
            <button
              onClick={resetLevel}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-lg hover:from-red-500 hover:to-pink-500 transition-colors"
            >
              Restart Process
            </button>
          </div>
        )}

        {/* Rewards Modal */}
        {showRewards && (
          <div className="fixed inset-0 bg-gray-800/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl border-2 border-purple-400 text-center max-w-md w-full shadow-2xl scale-in-center">
              <div className="text-gray-800">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  REWARD UNLOCKED! <Trophy className="inline-block ml-2" />
                </h2>
                <p className="text-xl font-semibold mb-6">Congratulations, Biologist!</p>
                
                <div className="space-y-4">
                  {earnedRewards.map((rewardKey) => {
                    const reward = rewards[rewardKey];
                    if (!reward) return null;
                    return (
                      <div key={rewardKey} className="flex items-center gap-4 bg-purple-100 p-4 rounded-lg border border-purple-200 shadow-inner">
                        <span className="text-3xl">{reward.icon}</span>
                        <div className="flex-1 text-left">
                          <h4 className="text-lg font-bold text-purple-800">{reward.name}</h4>
                          <p className="text-sm text-gray-600">{reward.condition}</p>
                        </div>
                        <div className="text-xl font-bold text-yellow-500">+{reward.points}</div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowRewards(false)}
                  className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-full transition-all duration-300 hover:scale-105"
                >
                  CONTINUE
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Game Complete Modal */}
        {gameComplete && (
          <div className="fixed inset-0 bg-gray-800/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl border-2 border-green-400 text-center max-w-md w-full shadow-2xl scale-in-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
                GAME COMPLETE!
              </h2>
              <p className="text-xl font-semibold mb-2 text-gray-800">You are a Biology Master! 🎓</p>
              <p className="text-2xl font-bold text-purple-700">Final Score: {totalScore}</p>
              
              <button
                onClick={resetGame}
                className="mt-8 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-full transition-all duration-300 hover:scale-105"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}

        {/* Manual Modal */}
        {showManual && (
          <div className="fixed inset-0 bg-gray-800/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl border-2 border-purple-400 max-w-2xl w-full shadow-2xl scale-in-center overflow-y-auto max-h-[90vh]">
              {manualContent}
              <button
                onClick={() => setShowManual(false)}
                className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-full transition-all duration-300 hover:scale-105"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Export metadata for Playground listing
export const metadata = {
  name: "Order Up",
  gradeLevel: "6-12",
  category: "Science",
  icon: "🥷"
};