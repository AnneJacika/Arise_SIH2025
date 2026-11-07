import React, { useState, useEffect } from 'react';
import offlineQuizzes from '../data/offlineQuizzes.json';
import levelsData from '../data/levels.json';
import { getAllQuizzes } from '../utils/db';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import ExportContentButton from '../components/ExportContentButton';
import ImportContentButton from '../components/ImportContentButton';
import WebShareContentButton from '../components/WebShareContentButton';
import LevelMap from '../components/games/LevelMap';



// Helper: get all level data for a grade from levels.json (returns sorted array of { points, ...data })
function getLevelDataForGrade(grade) {
  const rewards = levelsData.levelrewards?.[grade]?.rewards || {};
  return Object.entries(rewards)
    .map(([points, data]) => ({ points: Number(points), ...data }))
    .sort((a, b) => a.points - b.points);
}

// Helper: get all possible badges for a grade from levels.json
function getAllBadgesForGrade(grade) {
  if (!levelsData[grade] || !levelsData[grade].levels) return [];
  const badges = [];
  levelsData[grade].levels.forEach(lvl => {
    if (lvl.reward && lvl.reward.badge) badges.push(lvl.reward.badge);
    if (lvl.sublevels) {
      lvl.sublevels.forEach(sub => {
        if (sub.reward && sub.reward.badge) badges.push(sub.reward.badge);
      });
    }
  });
  return badges;
}

// Hardcoded quests for all students (can be extended per grade if needed)
const defaultQuests = [
  {
    id: 1,
    title: 'Complete your first quiz',
    goal: 1,
    progress: 0,
    completed: false,
    reward: { coins: 20, badge: 'Quiz Novice' }
  },
  {
    id: 2,
    title: 'Score 80% or more in a quiz',
    goal: 1,
    progress: 0,
    completed: false,
    reward: { coins: 30, badge: 'Quiz Ace' }
  },
  {
    id: 3,
    title: 'Complete 3 quizzes',
    goal: 3,
    progress: 0,
    completed: false,
    reward: { coins: 50, badge: 'Quiz Master' }
  },
  {
    id: 4,
    title: 'Earn 500 total points',
    goal: 500,
    progress: 0,
    completed: false,
    reward: { coins: 100, badge: 'Point Collector' }
  }
];

// Helper: get user's grade

// Helper: get grade string from userProfile (assume grade6 if missing)
function useUserGrade(userProfile) {
  const [grade, setGrade] = useState('grade6');
  useEffect(() => {
    if (userProfile?.gradeId && typeof userProfile.gradeId === 'string') {
      // Try to extract grade name from gradeId (e.g., 'grade6')
      setGrade(userProfile.gradeId.startsWith('grade') ? userProfile.gradeId : 'grade6');
    } else {
      setGrade('grade6');
    }
  }, [userProfile]);
  return grade;
}

// Existing hooks and components...
function useOfflineFirstQuizzes(grade) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      let data = [];
      try {
        // Try local DB first
        const all = await getAllQuizzes();
        data = all.filter(q => q.grade === grade);
        if (!data || data.length === 0) {
          if (offlineQuizzes[grade]) {
            data = offlineQuizzes[grade];
          }
        }
        if (!cancelled) setQuizzes(data);
      } catch (e) {
        if (offlineQuizzes[grade]) {
          data = offlineQuizzes[grade];
        } else {
          data = [];
        }
        if (!cancelled) {
          setQuizzes(data);
          setError(e.message || 'Failed to load quizzes');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (grade) load();
    return () => { cancelled = true; };
  }, [grade]);
  return { quizzes, loading, error };
}

// Icons
const BookOpenIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// New Game Components

// Quest Complete Popup
const QuestCompletePopup = ({ quest, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-center shadow-2xl transform animate-bounce">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-bold text-white mb-4">Quest Complete!</h3>
      <p className="text-lg text-white mb-4">{quest.title}</p>
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪙</span>
          <span className="text-xl font-bold text-white">+{quest.reward.coins}</span>
        </div>
        {quest.reward.badge && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="text-lg text-white">{quest.reward.badge}</span>
          </div>
        )}
      </div>
      <button 
        className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
        onClick={onClose}
      >
        Awesome!
      </button>
    </div>
  </div>
);

// Level Up Popup
const LevelUpPopup = ({ newLevel, reward, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-center shadow-2xl transform animate-pulse">
      <div className="text-8xl mb-4">🚀</div>
      <h3 className="text-3xl font-bold text-white mb-4">LEVEL UP!</h3>
      <p className="text-2xl text-yellow-300 mb-4">Level {newLevel}</p>
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪙</span>
          <span className="text-xl font-bold text-white">+{reward.coins}</span>
        </div>
        {reward.badge && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="text-lg text-white">{reward.badge}</span>
          </div>
        )}
      </div>
      <button 
        className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
        onClick={onClose}
      >
        Amazing!
      </button>
    </div>
  </div>
);

// Progress Bar Component
const ProgressBar = ({ current, total, color = "from-green-400 to-green-500" }) => (
  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
    <div 
      className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500 shadow-lg`}
      style={{ width: `${Math.min((current / total) * 100, 100)}%` }}
    ></div>
  </div>
);

// Enhanced Selection Card Component
const SelectionCard = ({ title, subtitle, icon, gradient, onClick, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`group relative overflow-hidden rounded-3xl shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="relative p-6 flex items-center justify-between text-white">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {icon}
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
        </div>
        <ChevronRightIcon />
      </div>
      <div className="absolute inset-0 bg-white/5 transform translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
    </div>
  );
};

// Back Button Component
const BackButton = ({ onClick }) => (
  <button 
    className="group flex items-center gap-2 opacity-80 hover:opacity-100 font-medium px-4 py-2 rounded-xl transition-all duration-200
      hover:bg-white/20 focus:bg-white/20 active:bg-white/30
      text-white hover:text-white focus:text-white"
    onClick={onClick}
  >
    <span className="flex items-center">
      <ArrowLeftIcon />
    </span>
    <span className="font-semibold">Back</span>
  </button>
);


export default function OfflineQuiz() {
  const [step, setStep] = useState(0); // 0: Home, 1: Subjects, 2: Quiz List, 5: Playing
  const [subject, setSubject] = useState(null);
  const [quizIdx, setQuizIdx] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const grade = useUserGrade(userProfile);
  const [playerState, setPlayerState] = useState(null);
  const [badges, setBadges] = useState([]);

  // Initialize player state from userProfile or local state (frontend only)
  useEffect(() => {
    if (!userProfile || !userProfile.roles || !userProfile.roles.student) {
      setPlayerState({
        level: 1,
        points: 0,
        coins: 0,
        quests: defaultQuests.map(q => ({ ...q })),
        badges: [],
        inventory: [],
        name: userProfile?.name || userProfile?.displayName || 'Student'
      });
      return;
    }
    const s = userProfile.roles.student;
    setPlayerState({
      level: typeof s.level === 'number' ? s.level : 1,
      points: typeof s.points === 'number' ? s.points : 0,
      coins: typeof s.coins === 'number' ? s.coins : 0,
      quests: Array.isArray(s.quests) && s.quests.length > 0 ? s.quests.map(q => ({ ...q })) : defaultQuests.map(q => ({ ...q })),
      badges: Array.isArray(s.badges) ? s.badges : [],
      inventory: Array.isArray(s.inventory) ? s.inventory : [],
      name: s.name || userProfile?.name || userProfile?.displayName || 'Student'
    });
  }, [userProfile]);

  // All possible badges for this grade
  useEffect(() => {
    setBadges(getAllBadgesForGrade(grade));
  }, [grade]);


  // Game state
  const [showQuestComplete, setShowQuestComplete] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(null);
  const [activeTab, setActiveTab] = useState('quests'); // quests, badges

  // Fetch quizzes for the user's grade (offline-first)
  const { quizzes, loading, error } = useOfflineFirstQuizzes(grade);
  const subjects = Array.from(new Set(quizzes.map(q => q.subject)));

  // Get level data for this grade
  const levelData = getLevelDataForGrade(grade);


  // Calculate current and next level info based on points (using JSON structure)
  const getCurrentLevelInfo = () => {
    const points = playerState?.points ?? 0;
    let currentLevel = levelData[0];
    let nextLevel = null;
    for (let i = 0; i < levelData.length; i++) {
      if (points >= levelData[i].points) {
        currentLevel = levelData[i];
        nextLevel = levelData[i + 1] || null;
      } else {
        nextLevel = levelData[i];
        break;
      }
    }
    return { currentLevel, nextLevel };
  };

  const { currentLevel, nextLevel } = getCurrentLevelInfo();

  // Award points and coins after quiz completion, using levels.json rewards for level up
  const awardRewards = (quizScore, totalQuestions) => {
    const percentage = Math.round((quizScore / totalQuestions) * 100);
    let pointsEarned = quizScore * 20;
    let coinsEarned = Math.floor(percentage / 10) * 5;
    // Bonus for perfect score
    if (percentage === 100) {
      pointsEarned += 50;
      coinsEarned += 25;
    }

    setPlayerState(prev => {
      const newState = { ...prev };
      newState.points = (newState.points ?? 0) + pointsEarned;
      newState.coins = (newState.coins ?? 0) + coinsEarned;

      // Update quests
      const updatedQuests = Array.isArray(newState.quests) ? [...newState.quests] : [];
      let completedQuests = [];
      updatedQuests.forEach(quest => {
        if (!quest.completed) {
          let shouldUpdate = false;
          if (quest.id === 1) { // Complete first quiz
            quest.progress = Math.min((quest.progress ?? 0) + 1, quest.goal ?? 1);
            shouldUpdate = true;
          } else if (quest.id === 2 && percentage >= 80) { // Score 80%+
            quest.progress = Math.min((quest.progress ?? 0) + 1, quest.goal ?? 1);
            shouldUpdate = true;
          } else if (quest.id === 3) { // Complete 3 quizzes
            quest.progress = Math.min((quest.progress ?? 0) + 1, quest.goal ?? 1);
            shouldUpdate = true;
          } else if (quest.id === 4) { // Earn 500 total points
            quest.progress = Math.min(newState.points, quest.goal ?? 500);
            shouldUpdate = true;
          }

          if (shouldUpdate && quest.progress >= (quest.goal ?? 1) && !quest.completed) {
            quest.completed = true;
            newState.coins = (newState.coins ?? 0) + (quest.reward?.coins ?? 0);
            if (quest.reward?.badge && !newState.badges?.includes(quest.reward.badge)) {
              newState.badges = [...(newState.badges ?? []), quest.reward.badge];
            }
            completedQuests.push(quest);
          }
        }
      });

      newState.quests = updatedQuests;

      // Check for level up
      const newLevel = levelData.findLast(l => newState.points >= l.pointsRequired)?.level || 1;
      if (newLevel > (prev.level ?? 1)) {
        const levelObj = levelData.find(l => l.level === newLevel);
        const reward = (levelObj && levelObj.reward) ? levelObj.reward : {};
        newState.level = newLevel;
        newState.coins = (newState.coins ?? 0) + (reward.coins ?? 0);
        if (reward.badge && !newState.badges?.includes(reward.badge)) {
          newState.badges = [...(newState.badges ?? []), reward.badge];
        }
        setTimeout(() => setShowLevelUp({ newLevel, reward: { coins: reward.coins ?? 0, badge: reward.badge ?? null } }), 1000);
      }

      // Show quest completion popups
      if (completedQuests.length > 0) {
        setTimeout(() => setShowQuestComplete(completedQuests[0]), 500);
      }

      // No backend writeback (frontend only)
      return newState;
    });
  };

  const resetQuiz = () => {
    setStep(0); // Return to home instead of subject selection
    setSubject(null);
    setQuizIdx(null);
    setCurrentQuestion(0);
    setSelectedOptions([]);
    setShowResult(false);
    setScore(0);
  };

  const renderCurrentStep = () => {
    // Step 0: Home Screen with Game Progression

    if (step === 0) {
      return (
        <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-0 m-0 overflow-auto">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 bg-opacity-20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-20 left-16 w-12 h-12 bg-pink-300 bg-opacity-20 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative min-h-screen flex flex-col p-8 text-white">
            {/* Header with Player Stats and Level Map Link */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                {console.log('OfflineQuiz userProfile:', userProfile)}
                <button
                  className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-300 hover:scale-105 transition-transform relative"
                  onClick={() => navigate('/dashboard/student/offline-quiz/map', { state: { score: playerState?.points ?? 0 } })}
                  title="View Level Map"
                  disabled={!playerState || playerState.level == null}
                >
                  {playerState?.level ?? '-'}
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white text-yellow-600 px-2 py-0.5 rounded-full shadow font-bold border border-yellow-300">Map</span>
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Level {playerState?.level ?? '-'}</h1>
                  <div className="text-lg font-semibold text-white/90 mb-1">
                    {userProfile?.roles?.student?.name || userProfile?.name || userProfile?.displayName || playerState?.name || 'Student'}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xl">⭐</span>
                      <span className="font-bold">{playerState?.points ?? '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xl">🪙</span>
                      <span className="font-bold">{playerState?.coins ?? '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Level Progress</h3>
              {nextLevel ? (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{currentLevel?.badge || currentLevel?.reward || 'Level'}</span>
                    <span>{nextLevel?.badge || nextLevel?.reward || '-'}</span>
                  </div>
                  <ProgressBar 
                    current={(playerState?.points ?? 0) - (currentLevel?.points ?? 0)}
                    total={(nextLevel?.points ?? ((currentLevel?.points ?? 0) + 1)) - (currentLevel?.points ?? 0)}
                    color="from-yellow-400 to-orange-500"
                  />
                  <p className="text-sm opacity-80 mt-2">
                    {typeof nextLevel?.points === 'number' && typeof playerState?.points === 'number'
                      ? Math.max(nextLevel.points - playerState.points, 0)
                      : '-'} points to next level
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-xl font-bold text-yellow-300">MAX LEVEL!</p>
                  <p className="text-sm opacity-80">You've reached the highest level!</p>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-white/10 rounded-2xl p-2 mb-6">
              {['quests', 'badges'].map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold capitalize transition-all duration-200 ${
                    activeTab === tab 
                      ? 'bg-white text-blue-600 shadow-lg' 
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              {activeTab === 'quests' && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold mb-4">Active Quests</h3>
                  {(playerState?.quests ?? []).map((quest) => (
                    <div 
                      key={quest.id} 
                      className={`bg-white/10 rounded-2xl p-6 backdrop-blur-sm ${quest.completed ? 'opacity-60' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold">{quest.title ?? '-'}</h4>
                        {quest.completed && <span className="text-green-400 text-2xl">✅</span>}
                      </div>
                      <div className="mb-3">
                        <ProgressBar 
                          current={quest.progress ?? 0} 
                          total={quest.goal ?? 1}
                          color="from-blue-600 to-blue-400"
                        />
                        <p className="text-sm opacity-80 mt-1">
                          {(quest.progress ?? 0)}/{quest.goal ?? 1} completed
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span>🪙</span>
                          <span className="font-bold">{quest.reward?.coins ?? '-'}</span>
                        </div>
                        {quest.reward?.badge && (
                          <div className="flex items-center gap-1">
                            <span>🏆</span>
                            <span className="text-sm">{quest.reward.badge}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'badges' && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold mb-4">Badge Collection</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(playerState?.badges ?? []).map((badge, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-center shadow-lg">
                        <div className="text-3xl mb-2">🏆</div>
                        <p className="font-bold text-white">{badge ?? '-'}</p>
                      </div>
                    ))}
                    {/* Show all possible badges from levels.json, faded if not achieved */}
                    {badges.filter(b => !(playerState?.badges ?? []).includes(b)).map((badge, idx) => (
                      <div key={"all-"+idx} className="bg-gradient-to-br from-yellow-200 to-orange-200 rounded-2xl p-4 text-center shadow-lg opacity-40">
                        <div className="text-3xl mb-2">🏆</div>
                        <p className="font-bold text-white/80">{badge ?? '-'}</p>
                      </div>
                    ))}
                    {(playerState?.badges ?? []).length === 0 && badges.length === 0 && (
                      <div className="col-span-full text-center text-white/60 py-8">
                        Complete quests to earn badges!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <div className="mt-8 text-center">
              <button
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300"
                onClick={() => setStep(1)}
              >
                Start Playing Quizzes
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Step 1: Subject Selection
    if (step === 1) {
      const subjectGradients = [
        'from-red-500 to-pink-600',
        'from-blue-500 to-indigo-600',
        'from-green-500 to-teal-600',
        'from-yellow-500 to-orange-600',
        'from-purple-500 to-violet-600',
        'from-cyan-500 to-blue-600'
      ];
      return (
        <div className="fixed inset-0 z-40 bg-gradient-to-br from-slate-800 via-blue-800 to-indigo-800 text-white overflow-auto">
          <div className="absolute inset-0 opacity-50 pointer-events-none">
            <div className="w-full h-full" style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M20 20c0 11.046-8.954 20-20 20v20h20v-20c11.046 0 20-8.954 20-20s-8.954-20-20-20z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
            }}></div>
          </div>
          <div className="relative min-h-screen flex flex-col p-8">
            <div className="flex items-center justify-between mb-8">
              <BackButton onClick={() => setStep(0)} />
              <h2 className="text-3xl font-bold text-center flex-1">Choose Your Subject</h2>
              <div className="w-20"></div>
            </div>
            {/* --- Sharing/Import Buttons --- */}
            <div className="flex flex-wrap gap-4 mb-8">
              <ExportContentButton />
              <ImportContentButton />
              <WebShareContentButton />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {subjects.map((subj, idx) => (
                  <SelectionCard
                    key={subj}
                    title={subj}
                    subtitle={`${quizzes.filter(q => q.subject === subj).length} quizzes`}
                    icon={<BookOpenIcon />}
                    gradient={subjectGradients[idx % subjectGradients.length]}
                    onClick={() => {
                      setSubject(subj);
                      setStep(2);
                    }}
                    delay={idx}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Quiz List for Selected Subject
    if (step === 2 && subject) {
      const quizzesBySubject = quizzes.filter(q => q.subject === subject);
      return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-blue-800 to-indigo-800 p-8 text-white shadow-2xl w-full h-full min-h-screen">
          <div className="flex items-center justify-between mb-8">
            <BackButton onClick={() => setStep(1)} />
            <h2 className="text-3xl font-bold text-center flex-1">Select a Quiz</h2>
            <div className="w-20"></div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
              {quizzesBySubject.length === 0 ? (
                <div className="text-slate-200 text-lg col-span-full">No quizzes found for this subject.</div>
              ) : (
                quizzesBySubject.map((quiz, idx) => (
                  <SelectionCard
                    key={quiz.title + idx}
                    title={quiz.title}
                    subtitle={quiz.chapter ? `Chapter: ${quiz.chapter}` : quiz.topic}
                    icon={<BookOpenIcon />}
                    gradient="from-blue-500 to-indigo-600"
                    onClick={() => {
                      setQuizIdx(idx);
                      setCurrentQuestion(0);
                      setSelectedOptions([]);
                      setShowResult(false);
                      setScore(0);
                      setStep(5);
                    }}
                    delay={idx}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    // Step 5: Quiz Playing
    if (step === 5 && subject && quizIdx !== null) {
      const quizzesBySubject = quizzes.filter(q => q.subject === subject);
      const quiz = quizzesBySubject[quizIdx];
      if (!quiz) return null;

      if (!showResult) {
        const currentQ = quiz.questions[currentQuestion];
        const hasAnswered = selectedOptions[currentQuestion] !== undefined;

        return (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-gray-700 to-slate-800 p-4 sm:p-8 text-white shadow-2xl w-full h-full min-h-screen flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
              {/* Progress and Back */}
              <div className="flex items-center justify-between mb-2">
                <BackButton onClick={() => setStep(2)} />
                <div className="flex-1 mx-4">
                  <ProgressBar current={currentQuestion + 1} total={quiz.questions.length} />
                  <div className="text-center">
                    <span className="text-sm opacity-60">Question {currentQuestion + 1} of {quiz.questions.length}</span>
                  </div>
                </div>
                <div className="w-20"></div>
              </div>

              {/* Question Card */}
              <div className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col items-center animate-fade-in">
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 text-center drop-shadow-lg animate-fade-in-up">{quiz.title}</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full mb-4 animate-pulse"></div>
                <p className="text-xl sm:text-2xl font-semibold text-white text-center leading-relaxed animate-fade-in-up" style={{textShadow:'0 2px 12px #0008'}}>{currentQ.question}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-5 mt-2">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOptions[currentQuestion] === idx;
                  const correctAnswerIndex = currentQ.options.findIndex(opt => opt === currentQ.answer);
                  const isCorrect = idx === correctAnswerIndex;
                  const isWrong = hasAnswered && isSelected && !isCorrect;

                  return (
                    <button
                      key={idx}
                      className={`relative flex items-center gap-4 px-6 py-5 rounded-2xl border-2 text-lg font-bold shadow-lg transition-all duration-300
                        ${hasAnswered
                          ? isCorrect
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-400 scale-105 shadow-emerald-400/40'
                            : isWrong
                              ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white border-red-400 scale-100 shadow-pink-400/40'
                              : 'bg-gray-100 text-gray-700 border-gray-200 opacity-80'
                          : 'bg-gradient-to-br from-white/80 to-blue-100/80 text-blue-900 border-blue-200 hover:scale-105 hover:shadow-xl hover:border-blue-400 focus:ring-2 focus:ring-blue-300'}
                        ${isSelected && !hasAnswered ? 'ring-4 ring-blue-300' : ''}
                        animate-fade-in-up`}
                      style={{transitionDelay: `${idx * 60}ms`}}
                      disabled={hasAnswered}
                      onClick={() => {
                        if (hasAnswered) return;
                        const newSelected = [...selectedOptions];
                        newSelected[currentQuestion] = idx;
                        setSelectedOptions(newSelected);
                        if (currentQ.answer === option) {
                          setScore(prev => prev + 1);
                        }
                        setTimeout(() => {
                          if (currentQuestion < quiz.questions.length - 1) {
                            setCurrentQuestion(prev => prev + 1);
                          } else {
                            setShowResult(true);
                          }
                        }, 1200);
                      }}
                    >
                      <span className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-lg font-extrabold
                        ${hasAnswered
                          ? isCorrect
                            ? 'bg-white text-green-600 border-green-400'
                            : isWrong
                              ? 'bg-white text-red-600 border-red-400'
                              : 'bg-gray-200 text-gray-700 border-gray-200'
                          : 'bg-blue-100 text-blue-600 border-blue-200'}
                        transition-all duration-300`}
                      >
                        {hasAnswered && isCorrect && <CheckIcon />}
                        {hasAnswered && isWrong && <XIcon />}
                        {!hasAnswered && String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`flex-1 text-left ${hasAnswered ? (isCorrect || isWrong ? 'text-white' : 'text-gray-700') : 'text-blue-900'}`}>{option}</span>
                      {hasAnswered && isCorrect && (
                        <span className="ml-2 text-2xl animate-bounce">🎉</span>
                      )}
                      {hasAnswered && isWrong && (
                        <span className="ml-2 text-2xl animate-shake">❌</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      // Quiz Results
      const percentage = Math.round((score / quiz.questions.length) * 100);
      const getGradeColor = () => {
        if (percentage >= 80) return 'from-green-500 to-emerald-600';
        if (percentage >= 60) return 'from-yellow-500 to-orange-600';
        return 'from-red-500 to-pink-600';
      };

      const getGradeText = () => {
        if (percentage >= 80) return 'Excellent!';
        if (percentage >= 60) return 'Good Job!';
        return 'Keep Trying!';
      };

      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-gray-700 to-slate-800 p-8 text-white shadow-2xl w-full h-full min-h-screen">
          <div className="relative text-center min-h-screen flex flex-col items-center justify-center">
            <div className={`w-32 h-32 bg-gradient-to-br ${getGradeColor()} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <TrophyIcon />
            </div>
            
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Quiz Complete!
            </h2>
            
            <div className={`text-6xl font-bold mb-2 bg-gradient-to-r ${getGradeColor()} bg-clip-text text-transparent`}>
              {percentage}%
            </div>
            
            <p className="text-2xl opacity-80 mb-6">{getGradeText()}</p>

            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-200">
              <div className="text-lg mb-4 text-gray-900 font-semibold flex flex-wrap items-center justify-center gap-1">
                <span>Your Score:</span>
                <span className="font-bold text-2xl text-blue-700">{score}</span>
                <span>out of</span>
                <span className="font-bold text-2xl text-blue-700">{quiz.questions.length}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
              <button
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={() => {
                  // Award rewards before going back to home
                  awardRewards(score, quiz.questions.length);
                  resetQuiz();
                }}
              >
                Return Home
              </button>

              <button
                className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl border-2 border-gray-600 hover:bg-gray-800 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={() => {
                  // Award rewards and restart the same quiz
                  awardRewards(score, quiz.questions.length);
                  setCurrentQuestion(0);
                  setSelectedOptions([]);
                  setScore(0);
                  setShowResult(false);
                }}
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // If quiz is active (step > 0), show as full screen overlay
  if (step > 0) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen w-full overflow-auto">
          {renderCurrentStep()}
        </div>
        
        {/* Quest Complete Popup */}
        {showQuestComplete && (
          <QuestCompletePopup 
            quest={showQuestComplete}
            onClose={() => setShowQuestComplete(null)}
          />
        )}
        
        {/* Level Up Popup */}
        {showLevelUp && (
          <LevelUpPopup 
            newLevel={showLevelUp.newLevel}
            reward={showLevelUp.reward}
            onClose={() => setShowLevelUp(null)}
          />
        )}
      </>
    );
  }

  // Step 0: Home Screen (rendered above)
  return (
    <>
      {renderCurrentStep()}
      
      {/* Quest Complete Popup */}
      {showQuestComplete && (
        <QuestCompletePopup 
          quest={showQuestComplete}
          onClose={() => setShowQuestComplete(null)}
        />
      )}
      
      {/* Level Up Popup */}
      {showLevelUp && (
        <LevelUpPopup 
          newLevel={showLevelUp.newLevel}
          reward={showLevelUp.reward}
          onClose={() => setShowLevelUp(null)}
        />
      )}
    </>
  );
}