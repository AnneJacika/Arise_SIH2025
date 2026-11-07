import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

// --- (SVG Icons for UI enhancement) ---
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
const SOCKET_URL = BACKEND_URL;

// --- Main Component ---
export default function OnlineQuizStudent({ sectionId, studentName, schoolId, gradeId }) {
    // --- (All your existing JS logic, hooks, and functions remain here, unchanged) ---
    const [socket, setSocket] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [quizState, setQuizState] = useState('loading'); // loading, idle, lobby, active, finished
    const [participants, setParticipants] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [ready, setReady] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timer, setTimer] = useState(null);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const timerRef = useRef();
    const navigate = useNavigate();

    const checkQuizScheduled = async () => {
      if (!schoolId || !gradeId || !sectionId) {
        setQuizState('idle');
        return;
      }
      try {
        const res = await fetch(`${BACKEND_URL}/quiz-status?schoolId=${schoolId}&gradeId=${gradeId}&sectionId=${sectionId}`);
        const data = await res.json();
        if (data.quiz && data.quiz.status === 'started') {
          setQuizState('active');
          if (data.quiz.questions) {
            setQuestions(data.quiz.questions);
            setAnswers(Array(data.quiz.questions.length).fill(null));
          }
        } else if (data.scheduled) {
          setQuizState('lobby');
        } else {
          setQuizState('idle');
        }
      } catch (err) {
        console.error('Error checking quiz status:', err);
        setQuizState('idle');
      }
    };

    useEffect(() => {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      checkQuizScheduled();
      newSocket.emit('join-section', { sectionId, studentName });
      newSocket.on('quiz-scheduled', ({ sectionId: scheduledSectionId }) => {
        if (scheduledSectionId === sectionId) {
          setQuizState('lobby');
          setNotifications(n => [...n, 'A new quiz has been scheduled!']);
        }
      });
      newSocket.on('lobby-update', ({ participants }) => setParticipants(participants));
      newSocket.on('user-joined', ({ name }) => setNotifications(n => [...n, `${name} joined the quiz.`]));
      newSocket.on('user-left', ({ name }) => setNotifications(n => [...n, `${name} left the quiz.`]));
      newSocket.on('quiz-started', ({ questions }) => {
        setQuestions(questions);
        setAnswers(Array(questions.length).fill(null));
        setQuizState('active');
        setCurrentQuestion(0);
        setAnswerSubmitted(false);
        startTimer();
      });
      newSocket.on('leaderboard-update', ({ leaderboard, newSubmission }) => {
        setLeaderboard(leaderboard || []);
        if (newSubmission) {
          setNotifications(n => [...n, `${newSubmission.name} just submitted their answer!`]);
        }
      });
      newSocket.on('leaderboard', (lb) => {
        setLeaderboard(lb.leaderboard || []);
        setQuizState('finished');
        clearInterval(timerRef.current);
        navigate('/result-leaderboard', { state: { quizId: lb.quizId, schoolId, gradeId, sectionId } });
      });
      return () => {
        newSocket.emit('leave-section', { sectionId, studentName });
        newSocket.off('quiz-scheduled');
        newSocket.off('lobby-update');
        newSocket.off('user-joined');
        newSocket.off('user-left');
        newSocket.off('quiz-started');
        newSocket.off('leaderboard-update');
        newSocket.off('leaderboard');
        newSocket.disconnect();
        clearInterval(timerRef.current);
      };
    }, [sectionId, studentName, schoolId, gradeId, navigate]);

    function startTimer() {
      setTimer(30);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer(prev => (prev === 1 ? 0 : prev - 1));
      }, 1000);
    }
    
    useEffect(() => {
      if (quizState === 'active' && timer === 0 && !answerSubmitted) {
        handleNextQuestion(); // Automatically move to next question or submit
      }
    }, [timer, quizState]);

    const handleReady = () => {
      if (socket) {
        socket.emit('set-ready', { sectionId, studentName, ready: !ready });
        setReady(r => !r);
      }
    };

    const handleAnswer = (optIdx) => {
      if (answerSubmitted || timer === 0) return;
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = optIdx;
      setAnswers(newAnswers);
    };

    const handleSubmitFinal = () => {
      if (socket) {
        socket.emit('submit-answers', { sectionId, studentName, answers, schoolId, gradeId });
      }
    };

    const handleNextQuestion = () => {
      if (answerSubmitted) return;
      setAnswerSubmitted(true);
      clearInterval(timerRef.current);
    
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
          setAnswerSubmitted(false);
          startTimer();
        } else {
          handleSubmitFinal();
        }
      }, 1000); // 1-second delay to show feedback before moving on
    };

    // --- (The UI rendering logic is what has been completely revamped) ---
    const q = questions && questions.length > 0 ? questions[currentQuestion] : null;

    // A consistent background for all states
    const PageWrapper = ({ children }) => (
      <div className="min-h-screen min-w-full w-screen h-screen bg-slate-900 bg-gradient-to-br from-gray-900 via-purple-900/50 to-slate-900 text-white font-sans p-0 m-0 overflow-x-hidden relative">
        <div className="absolute top-0 left-0 h-full w-full bg-[url('/grid.svg')] opacity-20 pointer-events-none z-0"></div>
        <div className="relative z-10 w-full h-full flex flex-col justify-center items-stretch">{children}</div>
      </div>
    );
    
    // --- UI STATES ---

    if (quizState === 'loading') {
      return (
        <PageWrapper>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-slate-300 tracking-wider">Preparing the quiz...</p>
          </div>
        </PageWrapper>
      );
    }

    if (quizState === 'idle') {
      return (
        <PageWrapper>
          <div className="flex items-center justify-center min-h-screen w-full">
            <div className="w-full max-w-2xl text-center bg-black/20 backdrop-blur-xl p-8 sm:p-10 rounded-2xl border border-slate-700/80 shadow-2xl shadow-purple-500/10 mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300 mb-4">No Quiz Active</h2>
              <p className="text-slate-400 mb-8">Please wait for a quiz to be published for your section.</p>
              <button
                onClick={checkQuizScheduled}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 active:scale-95"
              >
                Check for Quiz
              </button>
            </div>
          </div>
        </PageWrapper>
      );
    }

    if (quizState === 'lobby') {
      return (
        <PageWrapper>
          <div className="w-full px-0 sm:px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
            <header className="text-center mb-8 sm:mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">Quiz Lobby</h1>
              <p className="text-slate-400 mt-2 text-lg">The quiz will begin shortly. Get ready!</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
              <div className="lg:col-span-2 bg-black/20 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-700/80 shadow-2xl shadow-purple-500/10">
                <h3 className="text-2xl font-semibold text-white mb-5 flex items-center"><UsersIcon /> Participants ({participants.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {participants.map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className={`w-3 h-3 rounded-full transition-colors ${p.ready ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
                      <span className="flex-1 font-medium text-slate-200">{p.name}</span>
                      {p.name === studentName && <span className="text-xs font-semibold px-2 py-1 bg-cyan-400/20 text-cyan-300 rounded-full">You</span>}
                      {p.ready && <span className="text-xs font-semibold px-2 py-1 bg-green-400/20 text-green-300 rounded-full">Ready</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-8">
                <div className="bg-black/20 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-700/80 text-center shadow-2xl shadow-purple-500/10">
                  <h3 className="text-2xl font-semibold text-white mb-5">Are you ready?</h3>
                  <button
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                      ready
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-purple-500/30'
                    }`}
                    onClick={handleReady}
                  >
                    {ready ? 'You are Ready!' : "I'm Ready"}
                  </button>
                  <p className="mt-4 text-slate-400 text-sm">Waiting for the host to start the quiz...</p>
                </div>
                {notifications.length > 0 && (
                  <div className="bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-slate-700/80 max-h-40 overflow-y-auto">
                    <div className="space-y-2 text-sm text-cyan-300">
                      {notifications.map((n, i) => <p key={i} className="bg-cyan-500/10 p-2 rounded-md border-l-2 border-cyan-400">{n}</p>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PageWrapper>
      );
    }
    
    if (quizState === 'active' && q) {
      return (
        <PageWrapper>
          <div className="w-full px-0 sm:px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
            {/* Header: Question Counter & Timer */}
            <div className="bg-black/20 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-slate-700/80 mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
              <div className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
                Question {currentQuestion + 1} <span className="text-slate-400">/ {questions.length}</span>
              </div>
              <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg flex items-center border ${
                  timer <= 5 ? 'bg-red-500/20 text-red-300 border-red-500/50' : 
                  timer <= 15 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                  'bg-green-500/20 text-green-300 border-green-500/50'
              }`}>
                <ClockIcon /> {String(timer).padStart(2, '0')}s
              </div>
            </div>
    
            {/* Main Question Card */}
            <div className="bg-black/20 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-700/80 shadow-2xl shadow-purple-500/10 w-full">
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-100 mb-8 leading-tight">{q.question}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {q.options.map((opt, oidx) => {
                  const isSelected = answers[currentQuestion] === oidx;
                  
                  return (
                    <button
                      key={oidx}
                      onClick={() => handleAnswer(oidx)}
                      disabled={answerSubmitted}
                      className={`block w-full text-left p-4 rounded-lg border-2 transition-all duration-200 transform
                        ${answerSubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-purple-400 hover:scale-[1.02]'}
                        ${isSelected ? 'bg-cyan-500/30 border-cyan-400' : 'bg-slate-800/50 border-slate-700'}
                      `}
                    >
                      <span className="text-lg font-medium text-slate-200">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center mt-6">
                {currentQuestion < questions.length ? (
                    <button
                        onClick={handleNextQuestion}
                        disabled={answers[currentQuestion] === null || answerSubmitted}
                        className="px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 flex items-center
                        bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/30 disabled:bg-slate-700 disabled:shadow-none"
                    >
                        {answerSubmitted ? <><CheckCircleIcon/> Submitted </> : (currentQuestion === questions.length - 1 ? 'Submit Final Answer' : 'Confirm & Next')}
                    </button>
                ) : null}
              </div>
            </div>

             {/* Live Leaderboard Section */}
            {leaderboard.length > 0 && (
                <div className="mt-8 bg-black/20 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-700/80 w-full">
                    <h3 className="text-2xl font-semibold text-white mb-5 flex items-center"><TrophyIcon /> Live Leaderboard</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto pr-2">
                        {leaderboard.map((entry, i) => (
                        <div key={i} className={`flex justify-between items-center p-4 rounded-lg border ${
                            i === 0 ? 'bg-yellow-400/10 border-yellow-400/40' :
                            i === 1 ? 'bg-slate-400/10 border-slate-400/40' :
                            i === 2 ? 'bg-orange-400/10 border-orange-400/40' :
                            'bg-slate-800/50 border-slate-700/80'
                        }`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                    i === 0 ? 'bg-yellow-400 text-yellow-900' :
                                    i === 1 ? 'bg-slate-400 text-slate-900' :
                                    i === 2 ? 'bg-orange-400 text-orange-900' :
                                    'bg-slate-600 text-slate-200'
                                }`}>
                                    {i + 1}
                                </span>
                                <span className="font-medium text-white">{entry.name}</span>
                            </div>
                            <div className="font-bold text-xl text-cyan-300">{entry.score}</div>
                        </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </PageWrapper>
      );
    }

    if (quizState === 'finished') {
      return (
         <PageWrapper>
          <div className="flex flex-col items-center justify-center min-h-screen w-full">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-slate-300 tracking-wider">Quiz finished! Calculating results...</p>
          </div>
        </PageWrapper>
      );
    }
  
    return null;
}