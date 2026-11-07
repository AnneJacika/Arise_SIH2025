import React, { useState, useRef, useEffect, useCallback } from 'react';

export const PhotosynthesisAdventure = () => {
  // Enhanced game state
  const [stage, setStage] = useState('intro');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [health, setHealth] = useState(100);
  const [energy, setEnergy] = useState(50);
  const [answers, setAnswers] = useState([]);
  const [equationParts, setEquationParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [timer, setTimer] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [particles, setParticles] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [animationFrame, setAnimationFrame] = useState(0);
  const canvasRef = useRef(null);

  // Game constants
  const canvasWidth = 600;
  const canvasHeight = 400;
  const maxHealth = 100;
  const maxEnergy = 100;

  // Different questions for each level to avoid repetition
  const getQuestionsForLevel = (currentLevel) => {
    const questionSets = [
      // Level 1 - Basic concepts
      {
        sunlight: {
          question: 'What provides the energy for photosynthesis?',
          options: ['Sunlight', 'Moonlight', 'Starlight', 'Lightning'],
          correct: 'Sunlight',
          feedback: 'Excellent! Sunlight is the primary energy source for photosynthesis!',
          wrongFeedback: 'Not quite! Only sunlight has enough energy to drive photosynthesis.'
        },
        ingredients: {
          question: 'What raw materials does a plant need for photosynthesis?',
          options: ['Water & CO₂', 'Soil & Rocks', 'Wind & Rain', 'Sugar & Salt'],
          correct: 'Water & CO₂',
          feedback: 'Perfect! Water and carbon dioxide are the key ingredients!',
          wrongFeedback: 'Try again! Plants need water and CO₂ to make their food.'
        },
        products: {
          question: 'What does photosynthesis produce?',
          options: ['Glucose & Oxygen', 'Protein & Fat', 'Vitamins & Minerals', 'Water & CO₂'],
          correct: 'Glucose & Oxygen',
          feedback: 'Amazing! Plants make glucose (sugar) for energy and oxygen as a bonus!',
          wrongFeedback: 'Not correct! Photosynthesis produces glucose and oxygen.'
        }
      },
      // Level 2 - Intermediate concepts
      {
        sunlight: {
          question: 'Which part of sunlight is most important for photosynthesis?',
          options: ['Red & Blue light', 'Green light', 'UV rays', 'Infrared heat'],
          correct: 'Red & Blue light',
          feedback: 'Correct! Red and blue wavelengths are absorbed most efficiently by chlorophyll!',
          wrongFeedback: 'Actually, plants reflect green light and absorb red and blue!'
        },
        ingredients: {
          question: 'Where do plants get water for photosynthesis?',
          options: ['Roots from soil', 'Leaves from air', 'Stem storage', 'Flower petals'],
          correct: 'Roots from soil',
          feedback: 'Right! Roots absorb water from soil and transport it to leaves!',
          wrongFeedback: 'Water comes from the roots absorbing it from the soil!'
        },
        products: {
          question: 'What happens to the oxygen produced in photosynthesis?',
          options: ['Released to atmosphere', 'Stored in roots', 'Converted to CO₂', 'Used immediately'],
          correct: 'Released to atmosphere',
          feedback: 'Excellent! Oxygen is released through leaf pores called stomata!',
          wrongFeedback: 'Plants release oxygen to the air through their stomata!'
        }
      },
      // Level 3 - Advanced concepts
      {
        sunlight: {
          question: 'What is the name of the green pigment that captures sunlight?',
          options: ['Chlorophyll', 'Carotene', 'Anthocyanin', 'Melanin'],
          correct: 'Chlorophyll',
          feedback: 'Perfect! Chlorophyll is the green molecule that captures light energy!',
          wrongFeedback: 'Chlorophyll is the green pigment responsible for capturing light!'
        },
        ingredients: {
          question: 'How does CO₂ enter the plant?',
          options: ['Through stomata', 'Through roots', 'Through bark', 'Through flowers'],
          correct: 'Through stomata',
          feedback: 'Correct! Stomata are tiny pores that allow gas exchange!',
          wrongFeedback: 'CO₂ enters through tiny pores called stomata on the leaves!'
        },
        products: {
          question: 'What type of sugar is glucose?',
          options: ['Simple sugar C₆H₁₂O₆', 'Complex starch', 'Protein chain', 'Fat molecule'],
          correct: 'Simple sugar C₆H₁₂O₆',
          feedback: 'Excellent! Glucose is a simple sugar with the formula C₆H₁₂O₆!',
          wrongFeedback: 'Glucose is a simple sugar molecule with 6 carbons!'
        }
      }
    ];
    
    return questionSets[Math.min(currentLevel - 1, questionSets.length - 1)];
  };

  const questions = getQuestionsForLevel(level);

  const equationPartsList = ['6CO₂', '+', '6H₂O', '→', 'C₆H₁₂O₆', '+', '6O₂'];
  const correctEquation = '6CO₂+6H₂O→C₆H₁₂O₆+6O₂';

  // Particle system for visual effects
  const createParticle = (x, y, color, type = 'star') => ({
    x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
    life: 60, maxLife: 60, color, type, size: Math.random() * 3 + 2
  });

  const addParticles = useCallback((x, y, count, color, type) => {
    const newParticles = Array.from({length: count}, () => createParticle(x, y, color, type));
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Shuffle array utility
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize equation parts
  useEffect(() => {
    if (stage === 'equation') {
      setEquationParts(shuffleArray(equationPartsList));
      setSelectedParts([]);
    }
  }, [stage]);

  // Enhanced timer with visual warnings
  useEffect(() => {
    if (['sunlight', 'ingredients', 'products', 'equation'].includes(stage) && !gameOver) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setHealth(h => Math.max(0, h - 20));
            setCombo(0);
            const newHealth = Math.max(0, health - 20);
            if (newHealth <= 0) {
              setGameOver(true);
              setFeedback('Your plant withered! Try again!');
            } else {
              setFeedback('Time\'s up! Your plant lost some health!');
              nextQuestion();
            }
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stage, gameOver, health]);

  // Animation frame counter
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
      setParticles(prev => prev.map(p => ({
        ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1
      })).filter(p => p.life > 0));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Enhanced drawing with better plant scaling and photosynthesis animation
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Animated background
    const time = animationFrame * 0.01;
    const gradient = ctx.createRadialGradient(
      canvasWidth/2, canvasHeight/2, 0,
      canvasWidth/2, canvasHeight/2, canvasWidth
    );
    gradient.addColorStop(0, `hsl(120, 70%, ${85 + Math.sin(time) * 10}%)`);
    gradient.addColorStop(1, `hsl(140, 50%, ${45 + Math.sin(time * 0.7) * 5}%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Enhanced plant with proper scaling
    const plantHealth = Math.max(0, health / maxHealth);
    const baseHeight = 60;
    const maxPlantHeight = canvasHeight * 0.6; // Don't let plant go beyond 60% of canvas
    const plantHeight = Math.min(baseHeight + score * 1.5, maxPlantHeight);
    const plantWidth = 12 + level * 1.5;
    
    // Plant stem with gradient - grows from bottom up
    const stemGradient = ctx.createLinearGradient(0, canvasHeight - 20, 0, canvasHeight - plantHeight - 20);
    stemGradient.addColorStop(0, '#8B4513');
    stemGradient.addColorStop(1, '#228B22');
    ctx.fillStyle = stemGradient;
    ctx.fillRect(canvasWidth/2 - plantWidth/2, canvasHeight - 20, plantWidth, -plantHeight);

    // Animated leaves - positioned relative to plant top
    const leafSize = 20 + level * 2 + Math.sin(time * 2) * 2;
    ctx.fillStyle = `hsl(120, ${60 + plantHealth * 40}%, ${30 + plantHealth * 20}%)`;
    
    // Multiple leaves with animation
    const leafCount = Math.min(level + 1, 5);
    for (let i = 0; i < leafCount; i++) {
      const angle = (i * Math.PI * 2) / leafCount + time * 0.5;
      const leafDistance = leafSize + 8;
      const x = canvasWidth/2 + Math.cos(angle) * leafDistance;
      const y = canvasHeight - plantHeight - 20 + Math.sin(angle) * 10;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.sin(time + i) * 0.2);
      ctx.beginPath();
      ctx.ellipse(0, 0, leafSize, leafSize * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Animated sun with rays
    if (['sunlight', 'simulation'].includes(stage)) {
      const sunX = 100, sunY = 80;
      const sunSize = 30 + Math.sin(time * 2) * 3;
      
      // Sun rays
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8 + time;
        const rayLength = 20 + Math.sin(time * 3 + i) * 5;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(angle) * (sunSize + 5), sunY + Math.sin(angle) * (sunSize + 5));
        ctx.lineTo(sunX + Math.cos(angle) * (sunSize + rayLength), sunY + Math.sin(angle) * (sunSize + rayLength));
        ctx.stroke();
      }
      
      // Sun body
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize);
      sunGradient.addColorStop(0, '#FFFF00');
      sunGradient.addColorStop(1, '#FFD700');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Photosynthesis animation - molecules moving and combining
    if (stage === 'simulation') {
      // Animated H2O molecules moving toward plant
      for (let i = 0; i < 3; i++) {
        const progress = (time * 0.5 + i * 0.3) % 1;
        const startX = canvasWidth - 120;
        const startY = canvasHeight - 60;
        const endX = canvasWidth/2 - 30;
        const endY = canvasHeight - plantHeight/2;
        
        const x = startX + (endX - startX) * progress;
        const y = startY + (endY - startY) * progress;
        
        ctx.fillStyle = '#1E90FF';
        ctx.beginPath();
        ctx.arc(x, y, 12 - progress * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('H₂O', x, y + 3);
      }
      
      // Animated CO2 molecules
      for (let i = 0; i < 3; i++) {
        const progress = (time * 0.4 + i * 0.4) % 1;
        const startX = canvasWidth - 80;
        const startY = canvasHeight - 140;
        const endX = canvasWidth/2 + 20;
        const endY = canvasHeight - plantHeight/2;
        
        const x = startX + (endX - startX) * progress;
        const y = startY + (endY - startY) * progress;
        
        ctx.fillStyle = '#A9A9A9';
        ctx.beginPath();
        ctx.arc(x, y, 10 - progress * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CO₂', x, y + 2);
      }
      
      // Glucose and Oxygen production
      const productionProgress = (Math.sin(time * 2) + 1) / 2;
      
      // Glucose (moving down from plant)
      const glucoseY = canvasHeight - plantHeight/2 + productionProgress * 50;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(canvasWidth/2, glucoseY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('C₆H₁₂O₆', canvasWidth/2, glucoseY + 2);
      
      // Oxygen bubbles (moving up and away)
      for (let i = 0; i < 5; i++) {
        const bubbleProgress = (time * 0.6 + i * 0.2) % 1;
        const x = canvasWidth/2 + 40 + Math.sin(time + i) * 20;
        const y = canvasHeight - plantHeight/2 - bubbleProgress * 100;
        const size = 8 + Math.sin(time + i) * 2;
        
        ctx.fillStyle = `rgba(135, 206, 250, ${1 - bubbleProgress})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - bubbleProgress})`;
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('O₂', x, y + 2);
      }
      
      // Energy flow visualization
      const energyParticles = 8;
      for (let i = 0; i < energyParticles; i++) {
        const progress = (time * 0.8 + i * 0.125) % 1;
        const angle = (i / energyParticles) * Math.PI * 2 + time;
        const radius = 30 + progress * 20;
        const x = canvasWidth/2 + Math.cos(angle) * radius;
        const y = canvasHeight - plantHeight/2 + Math.sin(angle) * radius * 0.3;
        
        ctx.fillStyle = `hsl(60, 100%, ${50 + Math.sin(time + i) * 20}%)`;
        ctx.beginPath();
        ctx.arc(x, y, 3 + Math.sin(time * 3 + i) * 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Regular molecules for other stages
    if (['ingredients'].includes(stage)) {
      // Static water molecule
      const waterX = canvasWidth - 100 + Math.sin(time) * 5;
      const waterY = canvasHeight - 80 + Math.cos(time * 1.5) * 8;
      ctx.fillStyle = '#1E90FF';
      ctx.beginPath();
      ctx.arc(waterX, waterY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('H₂O', waterX, waterY + 3);

      // Static CO₂ molecule
      const co2X = canvasWidth - 60 + Math.cos(time * 1.2) * 5;
      const co2Y = canvasHeight - 120 + Math.sin(time * 0.8) * 6;
      ctx.fillStyle = '#A9A9A9';
      ctx.beginPath();
      ctx.arc(co2X, co2Y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '9px Arial';
      ctx.fillText('CO₂', co2X, co2Y + 3);
    }

    // Particles
    particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      
      if (p.type === 'star') {
        // Star particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(time + p.x);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const x = Math.cos(angle) * p.size;
          const y = Math.sin(angle) * p.size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;

    // UI with enhanced styling
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(10, 10, 220, 110);
    ctx.strokeStyle = '#2D5B2D';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 220, 110);

    // Score and stats
    ctx.fillStyle = '#2D5B2D';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score.toLocaleString()}`, 20, 35);
    ctx.fillText(`Level: ${level}`, 20, 55);
    if (combo > 1) {
      ctx.fillStyle = '#FF6600';
      ctx.fillText(`${combo}x Combo!`, 20, 75);
    }

    // Health bar
    ctx.fillStyle = health > 60 ? '#4CAF50' : health > 30 ? '#FFA500' : '#FF4444';
    ctx.fillRect(20, 85, (health / maxHealth) * 140, 12);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 85, 140, 12);
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText(`Health: ${health}%`, 20, 110);

    // Timer with color coding
    if (timer > 0 && ['sunlight', 'ingredients', 'products', 'equation'].includes(stage)) {
      const timerColor = timer > 10 ? '#4CAF50' : timer > 5 ? '#FFA500' : '#FF4444';
      ctx.fillStyle = timerColor;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      if (timer <= 5) {
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`${timer}s`, canvasWidth/2, 40);
      } else {
        ctx.fillText(`${timer}s`, canvasWidth/2, 35);
      }
    }

    // Equation display for equation stage
    if (stage === 'equation' && selectedParts.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(canvasWidth/2 - 150, canvasHeight - 80, 300, 40);
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvasWidth/2 - 150, canvasHeight - 80, 300, 40);
      
      ctx.fillStyle = '#2D5B2D';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(selectedParts.join(' '), canvasWidth/2, canvasHeight - 55);
    }

    // Level indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`L${level}`, canvasWidth - 20, 50);
  }, [stage, score, level, health, timer, selectedParts, particles, animationFrame, combo]);

  // Forward declare nextQuestion function
  const nextQuestion = useCallback(() => {
    const stages = ['sunlight', 'ingredients', 'products', 'equation'];
    const currentIndex = stages.indexOf(stage);
    
    if (currentIndex < stages.length - 1) {
      setStage(stages[currentIndex + 1]);
    } else {
      setStage('simulation');
    }
    
    setTimer(Math.max(7, 15 - level * 2));
    setFeedback('');
  }, [stage, level]);

  // Canvas setup and animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationId;
    const loop = () => {
      drawScene();
      if (!gameOver) {
        animationId = requestAnimationFrame(loop);
      }
    };
    animationId = requestAnimationFrame(loop);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [drawScene, gameOver]);

  // Enhanced answer handling with combo system
  const handleAnswer = (option, questionType) => {
    const question = questions[questionType];
    const isCorrect = option === question.correct;
    
    if (isCorrect) {
      const comboBonus = combo * 5;
      const levelBonus = level * 10;
      const points = 10 + comboBonus + levelBonus;
      
      setScore(prev => prev + points);
      setHealth(prev => Math.min(maxHealth, prev + 10));
      setEnergy(prev => Math.min(maxEnergy, prev + 20));
      setCombo(prev => prev + 1);
      setFeedback(`${question.feedback} +${points} points!`);
      
      // Success particles
      addParticles(canvasWidth/2, canvasHeight/2, 15, '#4CAF50', 'star');
      
      // Check for achievements
      if (combo === 4) { // Will be 5 after increment
        setAchievements(prev => [...prev, 'Combo Master!']);
      }
      
      setAnswers(prev => [...prev, { stage: questionType, answer: option, correct: true }]);
      
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    } else {
      setHealth(prev => Math.max(0, prev - 15));
      setCombo(0);
      setFeedback(`${question.wrongFeedback} -15 health!`);
      
      // Failure particles
      addParticles(canvasWidth/2, canvasHeight/2, 10, '#FF4444', 'circle');
      
      setAnswers(prev => [...prev, { stage: questionType, answer: option, correct: false }]);
      
      if (health <= 15) {
        setGameOver(true);
      }
    }
    
    setTimer(Math.max(20, 35 - level * 2));
  };

  // Enhanced equation handling
  const handleEquationPart = (part) => {
    const newSelected = [...selectedParts, part];
    setSelectedParts(newSelected);
    setEquationParts(prev => prev.filter(p => p !== part));
    
    if (newSelected.length === equationPartsList.length) {
      const userEquation = newSelected.join('');
      if (userEquation === correctEquation) {
        const points = 50 + combo * 10 + level * 15;
        setScore(prev => prev + points);
        setHealth(prev => Math.min(maxHealth, prev + 25));
        setCombo(prev => prev + 1);
        setFeedback(`Perfect equation! +${points} points!`);
        
        // Epic success particles
        addParticles(canvasWidth/2, canvasHeight/2, 25, '#FFD700', 'star');
        
        setAnswers(prev => [...prev, { stage: 'equation', answer: userEquation, correct: true }]);
        
        setTimeout(() => {
          setStage('simulation');
        }, 2000);
      } else {
        setHealth(prev => Math.max(0, prev - 20));
        setCombo(0);
        setFeedback('Incorrect equation! Try again!');
        
        // Reset equation
        setSelectedParts([]);
        setEquationParts(shuffleArray(equationPartsList));
        
        addParticles(canvasWidth/2, canvasHeight/2, 15, '#FF4444', 'circle');
      }
    }
  };

  // Enhanced simulation
  const handleSimulation = () => {
    const simulationBonus = 25 + level * 20;
    setScore(prev => prev + simulationBonus);
    setHealth(prev => Math.min(maxHealth, prev + 30));
    setFeedback(`Photosynthesis complete! Your plant thrives! +${simulationBonus} points!`);
    
    // Celebration particles
    addParticles(canvasWidth/2, canvasHeight/2, 30, '#4CAF50', 'star');
    
    setTimeout(() => {
      setStage('review');
    }, 3000);
  };

  // Level progression
  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setStage('sunlight');
    setTimer(Math.max(20, 35 - level * 2));
    setHealth(maxHealth);
    setEnergy(maxEnergy);
    setFeedback('');
    setAnswers([]);
    setSelectedParts([]);
    setEquationParts(shuffleArray(equationPartsList));
    setCombo(0);
  };

  // Game reset
  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setStage('intro');
    setHealth(maxHealth);
    setEnergy(maxEnergy);
    setAnswers([]);
    setSelectedParts([]);
    setFeedback('');
    setTimer(30);
    setGameOver(false);
    setCombo(0);
    setParticles([]);
    setAchievements([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-blue-200 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-3 sm:p-6 mb-4 sm:mb-6 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-green-800 mb-2">Photosynthesis Adventure</h1>
              <p className="text-gray-600 text-sm sm:text-base">Master the science of plant life through interactive gameplay!</p>
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">Score: {score.toLocaleString()}</div>
              <div className="text-base sm:text-lg text-gray-600">Level {level}</div>
              {combo > 1 && (
                <div className="text-lg font-bold text-orange-500 animate-pulse">
                  {combo}x Combo!
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
            <button
              onClick={resetGame}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg text-base sm:text-lg"
            >
              New Game
            </button>
            {stage === 'review' && (
              <button
                onClick={nextLevel}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg animate-pulse text-base sm:text-lg"
              >
                Next Level
              </button>
            )}
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-6">
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4">
              <h3 className="font-bold text-yellow-800 mb-2">New Achievements!</h3>
              <div className="flex flex-wrap gap-2">
                {achievements.map((achievement, i) => (
                  <span key={i} className="bg-yellow-200 px-3 py-1 rounded-full text-yellow-800 font-semibold">
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4 shadow-2xl">
              <div className="text-6xl mb-4">🍂</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Game Over!</h2>
              <div className="space-y-2 mb-6">
                <p className="text-xl">Final Score: <span className="font-bold text-blue-600">{score.toLocaleString()}</span></p>
                <p className="text-lg">Reached Level: <span className="font-bold text-green-600">{level}</span></p>
                <p className="text-lg">Best Combo: <span className="font-bold text-orange-600">{combo}x</span></p>
              </div>
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-green-200">
              <canvas 
                ref={canvasRef} 
                className="w-full rounded-xl shadow-inner border-2 border-gray-200" 
                style={{backgroundColor: '#f0f8f0'}}
              />
            </div>
          </div>

          {/* Game Controls */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-green-200">
              {stage === 'intro' && (
                <>
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-4">🌱</div>
                    <h3 className="text-2xl font-bold text-green-800 mb-3">Welcome, Plant Scientist!</h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Journey into the microscopic world of a leaf! Help plants create their own food through the amazing process of photosynthesis. 
                    Answer questions correctly to keep your plant healthy and watch it grow!
                  </p>
                  <div className="bg-green-50 p-4 rounded-xl mb-6">
                    <h4 className="font-semibold text-green-800 mb-2">How to Play:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Answer questions to earn points and health</li>
                      <li>• Build combo streaks for bonus points</li>
                      <li>• Complete the photosynthesis equation</li>
                      <li>• Keep your plant healthy to advance!</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setStage('sunlight')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold text-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Start Adventure
                  </button>
                </>
              )}

              {['sunlight', 'ingredients', 'products'].includes(stage) && (
                <>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">
                      {stage === 'sunlight' ? '☀️' : stage === 'ingredients' ? '🧪' : '🍯'}
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-3">{questions[stage].question}</h3>
                  </div>
                  <div className="space-y-3">
                    {questions[stage].options.map((opt, index) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt, stage)}
                        className={`w-full px-4 py-3 text-left rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg ${
                          index === 0 ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                          index === 1 ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                          index === 2 ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                          'bg-pink-500 hover:bg-pink-600 text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {feedback && (
                    <div className={`mt-4 p-4 rounded-xl ${feedback.includes('Correct') || feedback.includes('Perfect') || feedback.includes('Amazing') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <p className="font-semibold">{feedback}</p>
                    </div>
                  )}
                </>
              )}

              {stage === 'equation' && (
                <>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🧬</div>
                    <h3 className="text-xl font-bold text-green-800 mb-3">Build the Photosynthesis Equation</h3>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl mb-4">
                    <p className="text-blue-800 font-semibold mb-2">Target Equation:</p>
                    <p className="text-blue-700 font-mono text-center text-lg">6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂</p>
                  </div>
                  
                  {selectedParts.length > 0 && (
                    <div className="bg-white border-2 border-green-300 rounded-xl p-4 mb-4">
                      <p className="text-green-800 font-semibold mb-2">Your Equation:</p>
                      <p className="text-center text-lg font-mono text-green-700">{selectedParts.join(' ')}</p>
                    </div>
                  )}
                  
                  <p className="text-gray-700 mb-4">Click the parts in the correct order:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {equationParts.map((part, index) => (
                      <button
                        key={`${part}-${index}`}
                        onClick={() => handleEquationPart(part)}
                        className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-bold transform hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        {part}
                      </button>
                    ))}
                  </div>
                  {feedback && (
                    <div className={`mt-4 p-4 rounded-xl ${feedback.includes('Perfect') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <p className="font-semibold">{feedback}</p>
                    </div>
                  )}
                </>
              )}

              {stage === 'simulation' && (
                <>
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-4 animate-bounce">🌱</div>
                    <h3 className="text-xl font-bold text-green-800 mb-3">Photosynthesis in Action!</h3>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl mb-6">
                    <p className="text-green-800 text-center font-semibold mb-3">
                      Watch as your plant uses sunlight, water, and CO₂ to create glucose and oxygen!
                    </p>
                    <div className="text-center text-2xl space-x-2 mb-4">
                      <span>☀️</span>
                      <span>+</span>
                      <span>💧</span>
                      <span>+</span>
                      <span>🌫️</span>
                      <span>→</span>
                      <span>🍯</span>
                      <span>+</span>
                      <span>💨</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSimulation}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold text-lg transform hover:scale-105 transition-all duration-200 shadow-lg animate-pulse"
                  >
                    Complete Photosynthesis
                  </button>
                  {feedback && (
                    <div className="mt-4 p-4 rounded-xl bg-green-100 text-green-800">
                      <p className="font-semibold text-center">{feedback}</p>
                    </div>
                  )}
                </>
              )}

              {stage === 'review' && (
                <>
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-2xl font-bold text-green-800 mb-3">Level Complete!</h3>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-xl mb-4">
                    <h4 className="font-bold text-yellow-800 mb-3">Level Summary:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="font-semibold text-blue-600">Points Earned</div>
                        <div className="text-lg font-bold">{score}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="font-semibold text-green-600">Plant Health</div>
                        <div className="text-lg font-bold">{health}%</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="font-semibold text-orange-600">Best Combo</div>
                        <div className="text-lg font-bold">{combo}x</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="font-semibold text-purple-600">Accuracy</div>
                        <div className="text-lg font-bold">
                          {answers.length > 0 ? Math.round((answers.filter(a => a.correct).length / answers.length) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl mb-6">
                    <h4 className="font-bold text-blue-800 mb-3">What You Learned:</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Plants need sunlight for energy in photosynthesis
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Water and CO₂ are the raw materials plants use
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Plants produce glucose (food) and oxygen
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        The equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={nextLevel}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold text-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      Level {level + 1} - Harder Challenges!
                    </button>
                    <button
                      onClick={resetGame}
                      className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      Start Over
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Stats Panel */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-3 sm:p-6 border-2 border-blue-200">
              <h3 className="text-base sm:text-lg font-bold text-blue-800 mb-4">Plant Status</h3>
              
              {/* Health Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">Health</span>
                  <span className="text-xs sm:text-sm font-bold text-green-600">{health}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      health > 70 ? 'bg-green-500' : 
                      health > 40 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{width: `${health}%`}}
                  ></div>
                </div>
              </div>

              {/* Energy Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">Energy</span>
                  <span className="text-xs sm:text-sm font-bold text-blue-600">{energy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-blue-500 rounded-full transition-all duration-500"
                    style={{width: `${energy}%`}}
                  ></div>
                </div>
              </div>

              {/* Fun Facts */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-2 sm:p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">Did You Know?</h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {level === 1 && "A single tree can produce enough oxygen for 2 people per day!"}
                  {level === 2 && "Plants convert about 1% of sunlight into chemical energy through photosynthesis!"}
                  {level === 3 && "The Amazon rainforest produces 20% of the world's oxygen!"}
                  {level >= 4 && "Photosynthesis evolved about 3.5 billion years ago and changed Earth forever!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const metadata = {
  name: 'Enhanced Photosynthesis Adventure',
  gradeLevel: '6-12',
  category: 'Biology',
  icon: '🌱'
};