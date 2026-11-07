import React, { useState, useEffect, useRef } from "react";
import levelsData from '../../data/levels.json';
import { Lock, CheckCircle, Circle, Star } from "lucide-react";


// Helper: get grade string from userProfile (assume grade6 if missing)
function getUserGrade(userProfile) {
  if (userProfile?.gradeId && typeof userProfile.gradeId === 'string') {
    return userProfile.gradeId.startsWith('grade') ? userProfile.gradeId : 'grade6';
  }
  return 'grade6';
}

// Generate all levels and sublevels from levels.json for a grade
function getAllLevelsFromJson(grade) {
  const gradeData = levelsData.levelrewards?.[grade]?.rewards || {};
  const levels = [];
  const rarityList = [
    'bronze','silver','gold','platinum','diamond','emerald','ruby','sapphire','divine'
  ];
  let rarityIdx = 0;
  Object.entries(gradeData).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([points, data], idx) => {
    // Main level
    levels.push({
      points: Number(points),
      title: data.badge || data.reward || `Level ${idx+1}`,
      reward: data.reward,
      coins: data.coins,
      badge: data.badge,
      rarity: rarityList[rarityIdx] || 'bronze',
      isSub: false
    });
    rarityIdx++;
    // Sublevels
    if (data.sublevels) {
      Object.entries(data.sublevels).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([subPoints, subData]) => {
        levels.push({
          points: Number(subPoints),
          title: subData.badge || subData.reward || `Sublevel ${subPoints}`,
          reward: subData.reward,
          coins: subData.coins,
          badge: subData.badge,
          rarity: 'sub',
          isSub: true
        });
      });
    }
  });
  return levels.sort((a, b) => a.points - b.points);
}

// Rarity styles (unchanged)
const RARITY_STYLES = {
  bronze: { bg: "from-amber-800 to-orange-900", border: "border-amber-600", glow: "shadow-xl shadow-amber-500/40", text: "text-amber-100", icon: "bg-amber-700 text-amber-100" },
  silver: { bg: "from-slate-600 to-slate-800", border: "border-slate-400", glow: "shadow-xl shadow-slate-500/40", text: "text-slate-100", icon: "bg-slate-600 text-slate-100" },
  gold: { bg: "from-yellow-600 to-yellow-800", border: "border-yellow-400", glow: "shadow-xl shadow-yellow-500/50", text: "text-yellow-100", icon: "bg-yellow-600 text-yellow-100" },
  platinum: { bg: "from-blue-600 to-blue-800", border: "border-blue-400", glow: "shadow-xl shadow-blue-500/40", text: "text-blue-100", icon: "bg-blue-600 text-blue-100" },
  diamond: { bg: "from-cyan-600 to-cyan-800", border: "border-cyan-400", glow: "shadow-xl shadow-cyan-500/50", text: "text-cyan-100", icon: "bg-cyan-600 text-cyan-100" },
  emerald: { bg: "from-green-600 to-green-800", border: "border-green-400", glow: "shadow-xl shadow-green-500/40", text: "text-green-100", icon: "bg-green-600 text-green-100" },
  ruby: { bg: "from-red-600 to-red-800", border: "border-red-400", glow: "shadow-xl shadow-red-500/50", text: "text-red-100", icon: "bg-red-600 text-red-100" },
  sapphire: { bg: "from-indigo-600 to-indigo-800", border: "border-indigo-400", glow: "shadow-xl shadow-indigo-500/40", text: "text-indigo-100", icon: "bg-indigo-600 text-indigo-100" },
  divine: { bg: "from-purple-600 via-pink-600 to-orange-600", border: "border-pink-400", glow: "shadow-2xl shadow-pink-500/60", text: "text-pink-100", icon: "bg-gradient-to-br from-purple-500 to-pink-500 text-white" },
  sub: { bg: "from-amber-700 to-amber-800", border: "border-amber-500", glow: "shadow-md shadow-amber-500/20", text: "text-amber-200", icon: "bg-amber-600 text-amber-100" }
};

function AnimatedProgressBar({ isVisible, height }) {
  if (!isVisible) return null;
  
  return (
    <div 
      className="absolute left-1/2 transform -translate-x-1/2 w-2 bg-gradient-to-t from-yellow-400 via-orange-500 to-red-500 rounded-full transition-all duration-300 ease-out z-30"
      style={{ 
        height: `${height}px`,
        boxShadow: '0 0 20px rgba(251, 191, 36, 0.8)',
        bottom: 0
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-300 to-orange-400 rounded-full animate-pulse opacity-50" />
    </div>
  );
}



function LevelCard({ level, status, isLast, shouldAnimate, animationDelay, subAlign = 'center' }) {
  const [isVisible, setIsVisible] = useState(false);
  const style = RARITY_STYLES[level.rarity];
  // Use a star icon for all levels (customize if needed)
  const IconComponent = Star;

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, animationDelay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [shouldAnimate, animationDelay]);

  const getStatusIcon = () => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === 'current') return <Circle className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />;
    if (status === 'locked') return <Lock className="w-4 h-4 text-gray-400" />;
    return null;
  };

  // For sublevels, move left/right
  let alignClass = 'items-center';
  let cardMargin = '';
  let extraSpace = '';
  if (level.isSub) {
    if (subAlign === 'left') {
      alignClass = 'items-end';
      cardMargin = 'mr-auto -ml-10';
    } else if (subAlign === 'right') {
      alignClass = 'items-start';
      cardMargin = 'ml-auto -mr-10';
    }
    extraSpace = 'my-8'; // more space above/below sublevels
  } else {
    extraSpace = 'my-16'; // even more space for main levels
  }

  return (
    <div className={`relative flex flex-col ${alignClass} w-full transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} ${extraSpace}`}>
      {/* Progress line connector */}
      {!isLast && (
        <div className={`absolute ${level.isSub ? 'top-8' : 'top-16'} left-1/2 transform -translate-x-1/2 w-1 ${level.isSub ? 'h-4' : 'h-12'} z-0`}>
          <div className="w-full h-full bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full opacity-60" />
          {status === 'completed' && (
            <div className="absolute inset-0 bg-gradient-to-b from-green-400 to-green-600 rounded-full" />
          )}
        </div>
      )};
      {/* Level card */}
      <div className={`
        relative z-10 rounded-xl border-2 transition-all duration-300
        bg-gradient-to-br ${style.bg} ${style.border} ${style.glow}
        ${status === 'current' ? 'scale-110 animate-pulse' : 'scale-100'}
        ${status === 'completed' ? 'opacity-95' : ''}
        ${status === 'locked' ? 'opacity-60' : ''}
        ${level.isSub ? 'p-1 w-32 text-xs' : 'p-4 w-72'}
        hover:scale-105 cursor-pointer
        ${cardMargin}
      `}>
        {/* Card header */}
        <div className={`flex items-center justify-between ${level.isSub ? 'mb-1' : 'mb-3'}`}>
          <div className={`
            ${level.isSub ? 'p-1' : 'p-2'} rounded-lg ${style.icon} shadow-md
            ${status === 'current' ? 'animate-bounce' : ''}
          `}>
            <IconComponent className={level.isSub ? "w-3.5 h-3.5" : "w-5 h-5"} />
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <span className={`bg-black/30 px-2 py-0.5 rounded-full text-white ${level.isSub ? 'text-xs' : 'text-sm'} font-bold`}>
              {level.points >= 1000 ? `${(level.points/1000).toFixed(0)}K` : level.points}
            </span>
          </div>
        </div>
        {/* Level info */}
        <div className="text-center">
          <h3 className={`font-bold ${style.text} ${level.isSub ? 'text-xs' : 'text-lg'} ${level.isSub ? 'mb-0.5' : 'mb-2'}`}>
            {level.title}
          </h3>
          <div className={`bg-black/20 rounded-md ${level.isSub ? 'p-1' : 'p-2'}`}>
            <p className={`text-white/60 ${level.isSub ? 'text-[10px]' : 'text-xs'} mb-0.5`}>REWARD</p>
            <p className={`${style.text} font-semibold ${level.isSub ? 'text-xs' : 'text-sm'}`}>{level.reward}</p>
          </div>
        </div>
        {/* Current level highlight */}
        {status === 'current' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-xl -z-10 animate-pulse" />
        )}
      </div>
    </div>
  );
}



import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LevelMap({ score: propScore }) {
  const location = useLocation();
  const { userProfile } = useAuth();
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [visibleUpTo, setVisibleUpTo] = useState(0);
  const [quests, setQuests] = useState([]);
  // Accept score from props, navigation state, or fallback to 0
  const [score, setScore] = useState(
    typeof propScore === 'number' ? propScore :
    (location?.state && typeof location.state.score === 'number' ? location.state.score : 0)
  );

  // Get grade and all levels from JSON
  const grade = getUserGrade(userProfile);
  const allLevels = getAllLevelsFromJson(grade);


  // Find current level
  let currentIdx = -1;
  for (let i = 0; i < allLevels.length; i++) {
    if ((score ?? 0) >= allLevels[i].points) {
      currentIdx = i;
    } else {
      break;
    }
  }

  // Hardcoded demo quests (replace with local state/logic as needed)
  useEffect(() => {
    setQuests([
      { id: "first-quiz", title: "Complete your first quiz!", reward: 100, completed: score > 0 },
      { id: "first-badge", title: "Earn your first badge!", reward: 50, completed: (allLevels.find(l => l.badge && (score ?? 0) >= l.points)) ? true : false }
    ]);
  }, [score, allLevels]);

  // Auto-scroll animation effect
  useEffect(() => {
    if (!scrollRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const scrollContainer = scrollRef.current;
    const targetLevel = Math.max(0, currentIdx);
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    const animationDuration = 1000;
    const intervalTime = 50;
    const totalSteps = animationDuration / intervalTime;
    let step = 0;
    const animateScroll = () => {
      step++;
      const progress = step / totalSteps;
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const levelsToShow = Math.floor(easeOutProgress * (targetLevel + 2));
      setVisibleUpTo(levelsToShow);
      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      let targetScroll;
      if (step < totalSteps) {
        targetScroll = maxScroll * (1 - easeOutProgress * (targetLevel / (allLevels.length - 1)));
      } else {
        const levelElements = scrollContainer.querySelectorAll('[data-level-index]');
        const currentElement = levelElements[allLevels.length - 1 - currentIdx];
        if (currentElement) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = currentElement.getBoundingClientRect();
          const offset = elementRect.top - containerRect.top + scrollContainer.scrollTop - containerRect.height / 2 + elementRect.height / 2;
          targetScroll = offset;
        } else {
          targetScroll = maxScroll * (1 - (targetLevel / (allLevels.length - 1)));
        }
      }
      scrollContainer.scrollTop = targetScroll;
      setAnimationProgress(easeOutProgress * 100);
      if (step < totalSteps) {
        setTimeout(animateScroll, intervalTime);
      } else {
        setIsAnimating(false);
      }
    };
    setTimeout(animateScroll, 200);
  }, [currentIdx, allLevels.length]);

  // Calculate progress
  const nextLevel = allLevels[currentIdx + 1];
  const currentLevel = allLevels[currentIdx];
  const progress = nextLevel ? 
    ((score - (currentLevel?.points || 0)) / (nextLevel.points - (currentLevel?.points || 0))) * 100 : 100;

  // No Firestore reward logic needed; all data comes from JSON

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-800 overflow-hidden">
      {/* Animated golden background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(251,191,36,0.2),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(245,158,11,0.2),transparent_70%)]" />
        {/* Floating golden particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-20 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm p-4">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 mb-2">
            GOLDEN ARENA
          </h1>
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="text-center">
              <p className="text-yellow-200 text-xs">Score</p>
              <p className="text-lg font-bold text-yellow-100">{score.toLocaleString()}</p>
            </div>
            <div className="w-px h-8 bg-yellow-600" />
            <div className="text-center">
              <p className="text-yellow-200 text-xs">Level</p>
              <p className="text-lg font-bold text-yellow-100">{currentLevel?.title || 'Max'}</p>
            </div>
          </div>
          {/* Progress bar */}
          {nextLevel && (
            <div className="max-w-sm mx-auto">
              <div className="bg-amber-900/50 rounded-full h-2 p-0.5 border border-yellow-600">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(5, progress)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable level map */}
      <div 
        ref={scrollRef}
        className="relative z-10 h-[calc(100vh-140px)] overflow-y-auto px-4"
        style={{ scrollBehavior: isAnimating ? 'auto' : 'smooth' }}
      >
        <div className="relative flex flex-col items-center gap-0 py-8 pb-20">
          {/* Golden progress line always visible behind cards */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3 h-full bg-gradient-to-b from-yellow-400 via-orange-400 to-yellow-600 rounded-full opacity-80 z-0 pointer-events-none" />
          {/* Animated progress bar during initial animation */}
          {isAnimating && (
            <AnimatedProgressBar 
              isVisible={true} 
              height={animationProgress * 8} 
            />
          )}
          {allLevels.slice().reverse().map((level, idx) => {
            const originalIdx = allLevels.length - 1 - idx;
            const shouldShow = !isAnimating || idx <= visibleUpTo;
            let status = 'locked';
            if (originalIdx <= currentIdx) status = 'completed';
            if (originalIdx === currentIdx + 1) status = 'current';
            // Alternate sublevel alignment (just alternate left/right for sublevels)
            let subAlign = 'center';
            if (level.isSub) {
              subAlign = (originalIdx % 2 === 0) ? 'left' : 'right';
            }
            return (
              <div
                key={level.points}
                data-level-index={idx}
                className={`relative z-10 transition-all duration-500 ${shouldShow ? 'opacity-100' : 'opacity-0'}`}
              >
                <LevelCard 
                  level={level}
                  status={status}
                  isLast={idx === allLevels.length - 1}
                  shouldAnimate={isAnimating}
                  animationDelay={idx * 100}
                  subAlign={subAlign}
                />
              </div>
            );
          })}
        </div>
      </div>
      {/* Animation status */}
      {isAnimating && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-yellow-300">
          <p className="text-sm animate-pulse">🚀 Climbing to your level...</p>
        </div>
      )}
      {/* Quests display (optional, for debug/UX) */}
      {quests && quests.length > 0 && (
        <div className="absolute right-4 top-24 bg-black/60 rounded-xl p-4 z-30 max-w-xs">
          <h2 className="text-yellow-200 font-bold mb-2 text-lg">Quests</h2>
          <ul className="space-y-2">
            {quests.map(q => (
              <li key={q.id} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${q.completed ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></span>
                <span className="text-white text-sm">{q.title}</span>
                <span className="ml-auto text-yellow-300 font-bold text-xs">+{q.reward}G</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}