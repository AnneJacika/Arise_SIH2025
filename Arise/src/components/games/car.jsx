import React, { useState, useEffect } from "react";
import { Car, Fuel, Target, Clock, Zap, Settings, Play, RotateCcw, Wrench } from "lucide-react";

const CONTAINER_WIDTH = 900;
const ANIMATION_HEIGHT = 300;
const MARGIN = 30;
const CAR_LEFT_EDGE = MARGIN;
const PETROL_BUNK_LEFT_EDGE = CONTAINER_WIDTH - MARGIN - 125; // Adjusted for larger bunk size

// Enhanced Theme Colors - Full page background themes
const THEMES = [
  { 
    name: "Pink Paradise", 
    gradient: "from-pink-400 via-rose-300 to-orange-300", 
    accent: "#f472b6", 
    bunkColor: "#ec4899",
    cardBg: "rgba(244, 114, 182, 0.2)",
    bgImage: "/images/Pink.jpg",
    pageBackground: "bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50"
  },
  { 
    name: "Ocean Dreams", 
    gradient: "from-blue-400 via-cyan-300 to-teal-300", 
    accent: "#06b6d4", 
    bunkColor: "#0891b2",
    cardBg: "rgba(6, 182, 212, 0.2)",
    bgImage: "/images/Blue.jpg",
    pageBackground: "bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-50"
  },
  { 
    name: "Forest Adventure", 
    gradient: "from-green-400 via-emerald-300 to-lime-300", 
    accent: "#10b981", 
    bunkColor: "#059669",
    cardBg: "rgba(16, 185, 129, 0.2)",
    bgImage: "/images/Green.jpg",
    pageBackground: "bg-gradient-to-br from-green-100 via-emerald-50 to-lime-50"
  },
  { 
    name: "Sunset Valley", 
    gradient: "from-yellow-400 via-orange-300 to-red-300", 
    accent: "#f59e0b", 
    bunkColor: "#d97706",
    cardBg: "rgba(245, 158, 11, 0.2)",
    bgImage: "/images/Orange.jpg",
    pageBackground: "bg-gradient-to-br from-yellow-100 via-orange-50 to-red-50"
  },
  { 
    name: "Lavender Fields", 
    gradient: "from-purple-400 via-violet-300 to-indigo-300", 
    accent: "#8b5cf6", 
    bunkColor: "#7c3aed",
    cardBg: "rgba(139, 92, 246, 0.2)",
    bgImage: "/images/Lavender.jpg",
    pageBackground: "bg-gradient-to-br from-purple-100 via-violet-50 to-indigo-50"
  },
  { 
    name: "Mint Mountains", 
    gradient: "from-emerald-400 via-green-300 to-cyan-300", 
    accent: "#34d399", 
    bunkColor: "#10b981",
    cardBg: "rgba(52, 211, 153, 0.2)",
    bgImage: "/images/Mint.jpg",
    pageBackground: "bg-gradient-to-br from-emerald-100 via-green-50 to-cyan-50"
  }
];

const WRONG_THEME = { 
  name: "Danger Zone", 
  gradient: "from-red-500 via-red-400 to-pink-400", 
  accent: "#ef4444", 
  bunkColor: "#dc2626",
  cardBg: "rgba(239, 68, 68, 0.2)",
  pageBackground: "bg-gradient-to-br from-red-100 via-red-50 to-pink-50"
};

const DEFAULT_THEME = { 
  name: "Starting Point", 
  gradient: "from-slate-400 via-gray-300 to-stone-300", 
  accent: "#6b7280", 
  bunkColor: "#4b5563",
  cardBg: "rgba(107, 114, 128, 0.2)",
  pageBackground: "/images/Grey.jpg"
};

const QUESTION_TIME_LIMIT = 30;
const paramNames = ["Speed", "Distance", "Time", "Acceleration", "Force"];

function getRandomParams(difficulty) {
  const paramCount = Math.min(5, 3 + Math.floor(difficulty / 3));
  const hiddenIndex = Math.floor(Math.random() * paramCount);
  
  const mass = 10 + Math.floor(Math.random() * 20);
  const acceleration = Math.floor(Math.random() * (3 + difficulty) + 1);
  const time = Math.floor(Math.random() * (8 + difficulty * 2) + 2);
  const initialVelocity = Math.floor(Math.random() * (10 + difficulty * 3) + 5);
  
  const finalVelocity = initialVelocity + (acceleration * time);
  const averageVelocity = (initialVelocity + finalVelocity) / 2;
  const distance = averageVelocity * time;
  const force = mass * acceleration;
  
  const allParams = [averageVelocity, distance, time, acceleration, force];
  const params = allParams.slice(0, paramCount).map((val, idx) => 
    idx === hiddenIndex ? null : Math.round(val * 100) / 100
  );
  
  return { 
    hiddenIndex, 
    params, 
    mass, 
    paramCount,
    correctValue: Math.round(allParams[hiddenIndex] * 100) / 100
  };
}

const ModernCard = ({ children, className = "", theme, glowing = false }) => (
  <div 
    className={`rounded-xl border shadow-lg transition-all duration-300 relative ${className}`}
    style={{
      background: `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
      borderColor: glowing ? theme?.accent || '#ffffff' : 'rgba(255, 255, 255, 0.5)',
      boxShadow: glowing 
        ? `0 0 20px ${theme?.accent}40, 0 8px 25px rgba(0,0,0,0.2)` 
        : '0 8px 25px rgba(0,0,0,0.1)'
    }}
  >
    {theme && (
      <div 
        className="absolute inset-0 rounded-xl opacity-10"
        style={{ background: `linear-gradient(145deg, ${theme.cardBg}, transparent)` }}
      />
    )}
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

const ModernButton = ({ children, onClick, disabled = false, variant = "primary", theme, className = "", ...props }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const getStyles = () => {
    const baseStyles = {
      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isPressed ? 'scale(0.97) translateY(1px)' : 'scale(1) translateY(0)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1
    };

    if (disabled) {
      return {
        ...baseStyles,
        background: 'linear-gradient(145deg, #9ca3af 0%, #6b7280 100%)',
        color: 'white',
        border: 'none',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: `linear-gradient(145deg, ${theme.accent} 0%, ${theme.accent}dd 100%)`,
          color: 'white',
          border: 'none',
          boxShadow: `0 4px 15px ${theme.accent}30, inset 0 1px 2px rgba(255,255,255,0.2)`,
        };
      case 'secondary':
        return {
          ...baseStyles,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
          color: theme.accent,
          border: `2px solid ${theme.accent}`,
          boxShadow: `0 4px 15px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)`
        };
      case 'danger':
        return {
          ...baseStyles,
          background: 'linear-gradient(145deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3), inset 0 1px 2px rgba(255,255,255,0.2)'
        };
      default:
        return baseStyles;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${className}`}
      style={getStyles()}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      {...props}
    >
      {children}
    </button>
  );
};

const CountdownTimer = ({ timeLeft, maxTime, theme }) => {
  const percentage = (timeLeft / maxTime) * 100;
  const isLow = percentage < 30;
  const isCritical = percentage < 15;
  const isGlowing = isCritical;
  
  return (
    <>
      <div 
        className={`text-sm font-bold flex items-center gap-1 ${isCritical ? 'animate-pulse text-red-600' : 'text-gray-800'}`}
      >
        <Clock className="w-3 h-3" style={{ color: isCritical ? '#ef4444' : theme.accent }} />
        {timeLeft.toFixed(1)}s
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`,
            background: isCritical 
              ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
              : isLow 
              ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' 
              : `linear-gradient(90deg, ${theme.accent} 0%, #10b981 100%)`
          }}
        />
      </div>
    </>
  );
};

const FuelGauge = ({ fuel, maxFuel, theme }) => {
  const percentage = (fuel / maxFuel) * 100;
  const isLow = fuel < 30;
  const isCritical = fuel < 15;
  
  return (
    <>
      <div className={`text-sm font-bold flex items-center gap-1 ${isCritical ? 'text-red-600' : 'text-gray-800'}`}>
        <Fuel className="w-3 h-3" style={{ color: isCritical ? '#ef4444' : '#10b981' }} />
        {fuel}%
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`,
            background: isCritical 
              ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
              : isLow 
              ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' 
              : 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
          }}
        />
      </div>
    </>
  );
};

const Odometer = ({ currentSpeed, maxSpeed, distance, theme }) => {
  const speedRatio = Math.min(currentSpeed / maxSpeed, 1);
  const angle = speedRatio * 270;
  const proportionColor = speedRatio < 0.3 ? '#10b981' : speedRatio < 0.7 ? '#f59e0b' : '#ef4444'; // Green to orange to red based on proportion
  
  return (
    <ModernCard theme={theme} className="p-3">
      <div className="relative">
        <svg width="120" height="120" className="transform -rotate-45">
          <defs>
            <linearGradient id={`speedGrad-${theme.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: proportionColor, stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: proportionColor, stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path
            d="M 25 60 A 35 35 0 1 1 95 60"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 25 60 A 35 35 0 1 1 95 60"
            fill="none"
            stroke={`url(#speedGrad-${theme.name})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${speedRatio * 165} 165`}
            className="transition-all duration-500"
          />
          <line
            x1="60"
            y1="60"
            x2={60 + 30 * Math.cos((angle - 135) * Math.PI / 180)}
            y2={60 + 30 * Math.sin((angle - 135) * Math.PI / 180)}
            stroke="#1f2937"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <circle cx="60" cy="60" r="6" fill="#1f2937" />
          <circle cx="60" cy="60" r="3" fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-lg font-bold mt-6 text-gray-800">
            {currentSpeed.toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">m/s</div>
        </div>
      </div>
      <div className="text-center text-sm font-bold text-gray-800 mt-2">
        Distance: <span style={{ color: theme.accent }}>{distance.toFixed(1)}m</span>
      </div>
    </ModernCard>
  );
};

// More realistic car component
const RealisticCar = ({ position, theme, isMoving }) => (
  <div
    className="absolute transition-all duration-1000 ease-out z-30"
    style={{
      bottom: "75px",
      left: `${position}px`,
      transform: isMoving ? "scale(1.1) translateY(-2px)" : "scale(1)",
    }}
  >
    <div className={`relative ${isMoving ? 'animate-pulse' : ''}`}>
      {/* Car body */}
      <svg width="60" height="30" viewBox="0 0 60 30" className="drop-shadow-lg">
        <defs>
          <linearGradient id={`carGrad-${theme.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: theme.accent, stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: theme.accent, stopOpacity: 0.7 }} />
          </linearGradient>
        </defs>
        {/* Car body */}
        <rect x="3" y="12" width="54" height="12" rx="3" fill={`url(#carGrad-${theme.name})`} />
        <rect x="12" y="6" width="36" height="9" rx="4" fill={`url(#carGrad-${theme.name})`} />
        {/* Windows */}
        <rect x="15" y="7.5" width="12" height="6" rx="1.5" fill="#87CEEB" opacity="0.8" />
        <rect x="33" y="7.5" width="12" height="6" rx="1.5" fill="#87CEEB" opacity="0.8" />
        {/* Wheels */}
        <circle cx="15" cy="24" r="4.5" fill="#2D2D2D" />
        <circle cx="45" cy="24" r="4.5" fill="#2D2D2D" />
        <circle cx="15" cy="24" r="2.2" fill="#C0C0C0" />
        <circle cx="45" cy="24" r="2.2" fill="#C0C0C0" />
        {/* Headlights */}
        <circle cx="55.5" cy="15" r="2.2" fill="#FFFF99" opacity="0.9" />
        <circle cx="55.5" cy="21" r="2.2" fill="#FFFF99" opacity="0.9" />
      </svg>
      
      {/* Exhaust smoke when moving */}
      {isMoving && (
        <div className="absolute -bottom-1 -left-3">
          <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-ping opacity-60"
                style={{ 
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// More realistic petrol station (scaled up to height ~150)
const RealisticPetrolStation = ({ position, theme, isTarget }) => (
  <div
    className="absolute transition-all duration-300 z-20"
    style={{
      bottom: "60px",
      left: `${position}px`,
    }}
  >
    <div className="relative">
      {/* Station canopy (scaled) */}
      <div 
        className="absolute -top-50 -left-25 w-125 h-38 rounded shadow-lg"
        style={{ 
          background: `linear-gradient(145deg, ${theme.bunkColor}dd, ${theme.bunkColor}aa)`
        }}
      />
      
      {/* Main pump structure (scaled up) */}
      <svg width="100" height="150" viewBox="0 0 16 24" className="drop-shadow-lg">
        <defs>
          <linearGradient id={`pumpGrad-${theme.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: theme.bunkColor, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: theme.bunkColor, stopOpacity: 0.8 }} />
          </linearGradient>
        </defs>
        
        {/* Pump body */}
        <rect x="2" y="4" width="12" height="20" rx="2" fill={`url(#pumpGrad-${theme.name})`} />
        
        {/* Display screen */}
        <rect x="3" y="6" width="10" height="6" rx="1" fill="#000000" />
        <rect x="4" y="7" width="8" height="4" rx="0.5" fill="#00FF00" opacity="0.8" />
        
        {/* Pump handle holder */}
        <rect x="14" y="10" width="2" height="8" rx="1" fill="#C0C0C0" />
        
        {/* Hose */}
        <path d="M 14 14 Q 18 16 18 20" stroke="#333333" strokeWidth="2" fill="none" />
        
        {/* Handle */}
        <rect x="17" y="19" width="3" height="4" rx="1" fill="#FF4444" />
        
        {/* Base */}
        <rect x="1" y="22" width="14" height="2" rx="1" fill="#666666" />
        
        {/* Logo/Brand area */}
        <rect x="5" y="14" width="6" height="3" rx="0.5" fill="white" opacity="0.9" />
        <circle cx="8" cy="15.5" r="0.8" fill={theme.bunkColor} />
      </svg>
      
      {/* Target indicator */}
      {isTarget && (
        <div className="absolute -top-75 left-1/2 transform -translate-x-1/2">
          <Target size={24} className="text-green-500 animate-spin drop-shadow" />
        </div>
      )}
    </div>
  </div>
);

const RoadMap = ({ currentLevel, theme }) => {
  return (
    <ModernCard theme={theme} className="p-2 mb-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">
          Journey Progress
        </h3>
        <div className="flex gap-1">
          {THEMES.slice(0, Math.max(6, currentLevel + 2)).map((t, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                i < currentLevel ? 'animate-pulse' :
                i === currentLevel ? 'animate-bounce' : ''
              }`}
              style={{
                backgroundColor: i < currentLevel ? '#10b981' : i === currentLevel ? theme.accent : '#e5e7eb',
                borderColor: i < currentLevel ? '#10b981' : i === currentLevel ? 'white' : '#d1d5db',
                boxShadow: i === currentLevel ? `0 0 10px ${theme.accent}50` : 'none'
              }}
            />
          ))}
        </div>
      </div>
    </ModernCard>
  );
};

export function DriveAway() {
  const [difficulty, setDifficulty] = useState(0);
  const [gameState, setGameState] = useState(getRandomParams(0));
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [carPos, setCarPos] = useState(CAR_LEFT_EDGE);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);
  const [maxDistanceReached, setMaxDistanceReached] = useState(0);
  const [showNextRoundModal, setShowNextRoundModal] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);

  const { hiddenIndex, params, paramCount, correctValue } = gameState;

  const speed = params[0] != null ? params[0] : correctValue;
  const distance = params[1] != null ? params[1] : 
    paramCount > 1 && params[1] != null ? params[1] : Math.abs(speed * (params[2] || 5));
  const totalTime = params[2] != null ? params[2] : Math.abs(distance / speed);

  // Question timer effect
  useEffect(() => {
    if (submitDisabled || showNextRoundModal || showGameOver) return;
    
    const handleTimeUp = () => {
      setFeedback(`Time's up! The answer was ${correctValue}. No fuel gained.`);
      setFuel((prevFuel) => {
        const newFuel = Math.max(0, Math.floor(prevFuel / 2));
        if (newFuel <= 0) {
          setTimeout(() => setShowGameOver(true), 1500);
        }
        return newFuel;
      });
      setCurrentTheme(WRONG_THEME);
      setWrongAnswerCount(prev => prev + 1);
      
      setTimeout(() => {
        if (fuel > 25) {
          nextQuestion();
        }
      }, 2000);
    };
    
    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 0.1) {
          handleTimeUp();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [submitDisabled, showNextRoundModal, showGameOver, correctValue, fuel]);

  // Animation effect - only when answer is submitted, not on level changes
  useEffect(() => {
    if (!isAnimating) {
      setMaxDistanceReached(0);
      setCurrentSpeed(0);
      return;
    }

    let step = 0;
    const animInterval = setInterval(() => {
      step += 0.1;
      const newElapsed = Math.min(step, totalTime);

      const userAnswer = parseFloat(answer);
      let effectiveSpeed = speed;
      
      if (!isNaN(userAnswer)) {
        if (hiddenIndex === 0) effectiveSpeed = userAnswer;
        else if (hiddenIndex === 1) {
          const ratio = Math.min(userAnswer / distance, 2);
          effectiveSpeed = speed * ratio;
        }
        else if (hiddenIndex === 2) {
          effectiveSpeed = distance / userAnswer;
        }
      }

      setCurrentSpeed(effectiveSpeed);
      const currentDistance = Math.min(effectiveSpeed * newElapsed, distance * 2);
      setMaxDistanceReached(currentDistance);
      
      let ratio = distance > 0 ? currentDistance / distance : 0;
      ratio = Math.max(0, Math.min(2, ratio));
      
      const newCarPos = ratio * (PETROL_BUNK_LEFT_EDGE - CAR_LEFT_EDGE) + CAR_LEFT_EDGE;
      setCarPos(Math.min(newCarPos, CONTAINER_WIDTH - 40));

      if (step >= totalTime) {
        clearInterval(animInterval);
        setIsAnimating(false);
        setCurrentSpeed(0);
      }
    }, 100);

    return () => clearInterval(animInterval);
  }, [isAnimating, speed, distance, totalTime, answer, hiddenIndex]);

  const handleSubmit = () => {
    const userVal = parseFloat(answer);
    if (isNaN(userVal)) {
      setFeedback("Please enter a valid number");
      return;
    }

    setAttempts((prev) => prev + 1);
    const isCorrect = Math.abs(userVal - correctValue) < 0.01;
    const timeRemaining = questionTimeLeft;

    if (isCorrect) {
      const timeBonus = Math.floor((timeRemaining / QUESTION_TIME_LIMIT) * 25);
      const fuelReward = Math.max(10, timeBonus);
      
      setFuel((prev) => Math.min(100, prev + fuelReward));
      setFeedback(`Perfect! +${fuelReward} fuel! Driving to next station!`);
      setScore((prev) => prev + 1);
      setSubmitDisabled(true);
      setIsAnimating(true);
      setWrongAnswerCount(0);
      
      const animDuration = totalTime * 1000 + 500;
      setTimeout(() => {
        setCarPos(CAR_LEFT_EDGE);
        setCurrentTheme(THEMES[difficulty % THEMES.length]);
        setTimeout(() => {
          setShowNextRoundModal(true);
        }, 500);
      }, animDuration);
    } else {
      setFuel((prevFuel) => {
        const newFuel = Math.max(0, Math.floor(prevFuel / 2));
        if (newFuel <= 0) {
          setTimeout(() => setShowGameOver(true), 1500);
        }
        return newFuel;
      });
      setCurrentTheme(WRONG_THEME);
      setWrongAnswerCount(prev => prev + 1);
      
      if (userVal > correctValue) {
        setFeedback("Too high! Car overshoots the station!");
      } else {
        setFeedback("Too low! Car doesn't reach the station!");
      }
    }
  };

  const nextQuestion = () => {
    const nextDifficulty = difficulty + 1;
    setDifficulty(nextDifficulty);
    setGameState(getRandomParams(nextDifficulty));
    setFeedback("");
    setAnswer("");
    setAttempts(0);
    setSubmitDisabled(false);
    setMaxDistanceReached(0);
    setQuestionTimeLeft(QUESTION_TIME_LIMIT);
    setCurrentSpeed(0);
    
    // Reset car position immediately when starting new level
    setCarPos(CAR_LEFT_EDGE);
    
    if (currentTheme === WRONG_THEME && wrongAnswerCount < 2) {
      setCurrentTheme(THEMES[difficulty % THEMES.length]);
    }
  };

  const onModalOk = () => {
    setShowNextRoundModal(false);
    // Reset car position before starting next question
    setCarPos(CAR_LEFT_EDGE);
    nextQuestion();
  };

  const resetGame = () => {
    setScore(0);
    setFuel(100);
    setDifficulty(0);
    setGameState(getRandomParams(0));
    setFeedback("");
    setAnswer("");
    setAttempts(0);
    setCarPos(CAR_LEFT_EDGE);
    setCurrentTheme(DEFAULT_THEME);
    setSubmitDisabled(false);
    setMaxDistanceReached(0);
    setShowNextRoundModal(false);
    setQuestionTimeLeft(QUESTION_TIME_LIMIT);
    setCurrentSpeed(0);
    setWrongAnswerCount(0);
    setShowGameOver(false);
  };

  return (
    <div 
      className={`min-h-screen transition-all duration-1000 relative`}
      style={{
        background: currentTheme.bgImage 
          ? `url(${currentTheme.bgImage})`
          : `linear-gradient(135deg, ${currentTheme.gradient.replace('from-', '').replace('via-', ', ').replace('to-', ', ').replace(/-/g, ' ')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="relative z-10 p-3">
        <div className="max-w-5xl mx-auto space-y-3">
          {/* Header */}
          <ModernCard theme={currentTheme} className="p-3 text-center">
            <h1 className="text-2xl font-bold mb-2 text-gray-800 flex items-center justify-center gap-2">
              Drive Away <Zap size={24} style={{ color: currentTheme.accent }} />
            </h1>
            <p className="text-gray-700 text-sm mb-2">
              Master physics equations to fuel your journey!
            </p>
            <div 
              className="inline-block px-4 py-1 rounded-lg font-semibold text-sm text-white"
              style={{ backgroundColor: currentTheme.accent }}
            >
              Destination: {currentTheme.name}
            </div>
          </ModernCard>

          {/* Road Map */}
          <RoadMap currentLevel={difficulty} theme={currentTheme} />

          {/* Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ModernCard theme={currentTheme} glowing={questionTimeLeft < 15 || fuel < 15} className="p-2 col-span-1 md:col-span-2">
              <div className="space-y-1">
                <CountdownTimer timeLeft={questionTimeLeft} maxTime={QUESTION_TIME_LIMIT} theme={currentTheme} />
                <FuelGauge fuel={fuel} maxFuel={100} theme={currentTheme} />
              </div>
            </ModernCard>
            
            <ModernCard theme={currentTheme} className="p-2">
              <div className="flex justify-between items-center">
                <div className="space-y-1 text-sm font-semibold text-gray-700 w-32">
                  <div>SCORE: <span className="text-green-600">{score}</span></div>
                  <div className="flex items-center">TRIES: {Array.from({length: attempts}).map((_, i) => <Wrench key={i} className="w-4 h-4 text-purple-600" />)}</div>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{ backgroundColor: currentTheme.accent }}
                  >
                    {difficulty + 1}
                  </div>
                  <div className="text-xs font-semibold text-gray-700 mt-1">LEVEL</div>
                </div>
              </div>
            </ModernCard>

            <Odometer 
              currentSpeed={currentSpeed}
              maxSpeed={Math.max(speed * 1.5, 20)}
              distance={maxDistanceReached}
              theme={currentTheme}
            />
          </div>

          {/* Animation Area */}
          <ModernCard theme={currentTheme} className="p-3 relative overflow-hidden">
            <div 
              className="relative mx-auto rounded-xl overflow-hidden shadow-inner"
              style={{ 
                width: CONTAINER_WIDTH, 
                height: ANIMATION_HEIGHT,
                background: `linear-gradient(135deg, ${currentTheme.gradient.replace('from-', '').replace('via-', ', ').replace('to-', ', ').replace(/-/g, ' ')})`
              }}
            >
              {/* Background with theme image */}
              <div 
                className="absolute inset-0 transition-all duration-1000"
                style={{
                  backgroundImage: currentTheme.bgImage ? `url(${currentTheme.bgImage})` : 
                    `linear-gradient(135deg, ${currentTheme.gradient.replace('from-', '').replace('via-', ',').replace('to-', ',').replace(/-/g, ' ')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              
              {/* Semi-transparent overlay for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

              {/* Road */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-600 via-gray-500 to-gray-400 z-10">
                <div className="absolute top-1/2 left-0 right-0 flex justify-center">
                  <div className="w-full h-0.5 bg-white opacity-60"></div>
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400"></div>
              </div>

              {/* Realistic Car and Petrol Station */}
              <RealisticCar position={carPos} theme={currentTheme} isMoving={isAnimating} />
              <RealisticPetrolStation 
                position={PETROL_BUNK_LEFT_EDGE} 
                theme={currentTheme} 
                isTarget={Math.abs(carPos - PETROL_BUNK_LEFT_EDGE) < 30} 
              />
            </div>
          </ModernCard>

          {/* Question Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Parameters Display */}
            <ModernCard theme={currentTheme} className="p-3">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Given Parameters:</h3>
              <div className="space-y-2">
                {params.map((param, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2 rounded-lg border ${
                      param === null ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700 text-sm">
                        {paramNames[idx]}:
                      </span>
                      <span className="text-sm font-bold" style={{ color: currentTheme.accent }}>
                        {param === null ? "???" : `${param} ${idx === 0 ? 'm/s' : idx === 1 ? 'm' : idx === 2 ? 's' : idx === 3 ? 'm/s²' : 'N'}`}
                      </span>
                    </div>
                  </div>
                ))}
                
                {paramCount > 3 && (
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-300">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700 text-sm">Mass:</span>
                      <span className="text-sm font-bold text-blue-600">{gameState.mass} kg</span>
                    </div>
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Answer Input */}
            <ModernCard theme={currentTheme} className="p-3">
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                Find the missing {paramNames[hiddenIndex]}:
              </h3>
              
              <div className="space-y-3">
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  disabled={submitDisabled || showGameOver}
                  className="w-full px-3 py-2 text-lg font-bold text-center rounded-lg border-2 focus:outline-none transition-all"
                  style={{
                    borderColor: currentTheme.accent,
                    boxShadow: `0 0 10px ${currentTheme.accent}20`
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && !submitDisabled && handleSubmit()}
                />
                
                <div className="text-center text-gray-600 text-xs">
                  Unit: {hiddenIndex === 0 ? 'm/s' : hiddenIndex === 1 ? 'm' : hiddenIndex === 2 ? 's' : hiddenIndex === 3 ? 'm/s²' : 'N'}
                </div>
                
                <ModernButton
                  onClick={handleSubmit}
                  disabled={submitDisabled || !answer.trim() || showGameOver}
                  theme={currentTheme}
                  className="w-full text-sm flex items-center justify-center gap-1"
                >
                  <Play className="w-4 h-4" />
                  Submit Answer
                </ModernButton>

                {/* Feedback */}
                {feedback && (
                  <div 
                    className={`p-3 rounded-lg border text-center font-semibold text-sm ${
                      feedback.includes('Perfect') ? 'bg-green-100 border-green-400 text-green-800' :
                      feedback.includes('Time') || feedback.includes('high') || feedback.includes('low') ? 'bg-red-100 border-red-400 text-red-800' :
                      'bg-blue-100 border-blue-400 text-blue-800'
                    }`}
                  >
                    {feedback}
                  </div>
                )}
              </div>
            </ModernCard>
          </div>

          {/* Control Panel */}
          <ModernCard theme={currentTheme} className="p-3">
            <div className="flex justify-center gap-3">
              <ModernButton
                onClick={resetGame}
                variant="danger"
                theme={currentTheme}
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Game
              </ModernButton>
              
              <ModernButton
                onClick={() => setAnswer(correctValue.toString())}
                variant="secondary"
                theme={currentTheme}
                disabled={submitDisabled}
                className="flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                Hint
              </ModernButton>
            </div>
          </ModernCard>

          {/* Next Round Modal */}
          {showNextRoundModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <ModernCard theme={currentTheme} className="p-6 max-w-sm mx-4" glowing={true}>
                <div className="text-center space-y-4">
                  <div className="text-4xl">🎉</div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Level Complete!
                  </h2>
                  <p className="text-gray-600 text-sm">
                    You've reached {currentTheme.name}. Ready for the next challenge?
                  </p>
                  <ModernButton
                    onClick={onModalOk}
                    theme={currentTheme}
                    className="w-full"
                  >
                    Continue Journey!
                  </ModernButton>
                </div>
              </ModernCard>
            </div>
          )}

          {/* Game Over Modal */}
          {showGameOver && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <ModernCard theme={WRONG_THEME} className="p-6 max-w-sm mx-4" glowing={true}>
                <div className="text-center space-y-4">
                  <div className="text-4xl">⛽</div>
                  <h2 className="text-xl font-bold text-red-600">
                    Out of Fuel!
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Your journey ends here. You reached level {difficulty + 1} and scored {score} points!
                  </p>
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-gray-800">
                      Final Stats:
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg text-sm">
                      <div>Score: {score}</div>
                      <div>Max Level: {difficulty + 1}</div>
                      <div>Success Rate: {attempts > 0 ? Math.round((score / attempts) * 100) : 0}%</div>
                    </div>
                  </div>
                  <ModernButton
                    onClick={resetGame}
                    theme={WRONG_THEME}
                    className="w-full flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </ModernButton>
                </div>
              </ModernCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  name: "Physics Drive Quest",
  gradeLevel: "8-12",
  category: "Physics",
  icon: "🚗"
};