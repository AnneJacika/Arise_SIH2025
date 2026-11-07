
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export default function OnlineQuizTeacher({ sectionId, gradeId, schoolId }) {
  // --- All original logic and state are preserved ---
  const isValid = sectionId && gradeId && schoolId;
  const [scheduled, setScheduled] = useState(false);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const socketRef = useRef();

  useEffect(() => {
    if (!sectionId) return;
    if (!socketRef.current) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  socketRef.current = io(API_URL);
    }
    const socket = socketRef.current;
    socket.emit('join-section', { sectionId, teacher: true });
    socket.on('lobby-update', ({ participants }) => setParticipants(participants));
    socket.on('quiz-scheduled', () => {
      setScheduled(true);
      setStatus('Quiz scheduled successfully. Students can now join the lobby.');
    });
    socket.on('quiz-started', () => {
      setStarted(true);
      setStatus('Quiz started! Students are now answering questions.');
      setShowLeaderboard(true);
    });
    socket.on('leaderboard-update', ({ leaderboard, newSubmission }) => {
      setLeaderboard(leaderboard);
      if (newSubmission) {
        setStatus(`${newSubmission.name} just scored ${newSubmission.score} points!`);
      }
    });
    return () => {
      socket.emit('leave-section', { sectionId, teacher: true });
      socket.off('lobby-update');
      socket.off('quiz-scheduled');
      socket.off('quiz-started');
      socket.off('leaderboard-update');
    };
  }, [sectionId]);

  useEffect(() => {
    const checkExistingQuiz = async () => {
      if (!isValid) return;
      try {
  const res = await fetch(`${API_URL}/quiz-status?schoolId=${schoolId}&gradeId=${gradeId}&sectionId=${sectionId}`);
        const data = await res.json();
        if (data.quiz) {
          if (data.quiz.status === 'scheduled' && !data.quiz.startedAt) {
            setScheduled(true);
            setStatus('Quiz is already scheduled. Click Start to begin.');
          } else if (data.quiz.status === 'started' && !data.quiz.endedAt) {
            setScheduled(true);
            setStarted(true);
            setStatus('Quiz is currently running.');
            setShowLeaderboard(true);
          }
        }
      } catch (err) {
        console.error('Error checking quiz status:', err);
      }
    };
    checkExistingQuiz();
  }, [isValid, schoolId, gradeId, sectionId]);

  const scheduleQuiz = async () => {
    setLoading(true);
    setError('');
    try {
  const response = await fetch(`${API_URL}/schedule-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, gradeId, schoolId, hostName: 'Teacher' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to schedule quiz');
      setScheduled(true);
      setStatus('Quiz scheduled successfully. Students can now join the lobby.');
    } catch (err) {
      console.error('Error scheduling quiz:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    setError('');
    try {
  const response = await fetch(`${API_URL}/start-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, gradeId, schoolId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start quiz');
      setStarted(true);
      setStatus('Quiz started! Students are now answering questions.');
      setShowLeaderboard(true);
    } catch (err) {
      console.error('Error starting quiz:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const endQuiz = async () => {
    setLoading(true);
    setError('');
    try {
  const response = await fetch(`${API_URL}/end-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, gradeId, schoolId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to end quiz');
      setStatus('Quiz ended successfully.');
      setStarted(false);
      setScheduled(false);
      setParticipants([]);
    } catch (err) {
      console.error('Error ending quiz:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 font-sans">
      <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
        <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
        Online Quiz Controls
      </h2>
      
      {!isValid && (
        <div className="text-red-700 font-medium mb-4 p-4 bg-red-100 border border-red-200 rounded-lg text-center">
          Please select a class section from the dashboard to activate quiz controls.
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-800 font-semibold">
          <strong>Error:</strong> {error}
        </div>
      )}

      {status && (
        <div className={`text-center font-semibold p-3 rounded-lg mb-6 text-sm transition-all duration-300 ${
          started 
            ? 'text-green-800 bg-green-100 border border-green-200' 
            : scheduled
              ? 'text-blue-800 bg-blue-100 border border-blue-200'
              : 'text-slate-700 bg-slate-100 border border-slate-200'
        }`}>
          {status}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Controls & Lobby */}
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button onClick={scheduleQuiz} disabled={scheduled || !isValid || loading}
                  className={`w-full px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:shadow-none ${
                    scheduled || !isValid ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } ${loading ? 'opacity-60 animate-pulse' : ''}`}
                >
                  {scheduled ? 'Quiz Published' : loading ? 'Publishing...' : 'Publish Quiz'}
                </button>
                
                {scheduled && !started && (
                  <button onClick={startQuiz} disabled={loading}
                    className={`w-full px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:shadow-none ${
                      loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                    } ${loading ? 'opacity-60 animate-pulse' : ''}`}
                  >
                    {loading ? 'Starting...' : 'Start Quiz'}
                  </button>
                )}
                
                {started && (
                  <button onClick={endQuiz} disabled={loading}
                    className={`w-full px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:shadow-none ${
                      loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'
                    } ${loading ? 'opacity-60 animate-pulse' : ''}`}
                  >
                    {loading ? 'Ending...' : 'End Quiz'}
                  </button>
                )}
            </div>
            
            {scheduled && !started && (
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-slate-700 mb-3">Students in Lobby ({participants.length})</h3>
                  {participants.length === 0 ? (
                    <div className="text-slate-500 text-sm text-center py-4">
                      Waiting for students to join...
                    </div>
                  ) : (
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {participants.map((p, i) => (
                          <li key={i} className="flex items-center justify-between p-2.5 bg-white rounded-lg shadow-sm">
                            <span className="font-medium text-slate-700">{p.name}</span>
                            {p.ready && <span className="text-xs text-green-700 font-bold bg-green-100 px-2.5 py-1 rounded-full">Ready</span>}
                          </li>
                      ))}
                      </ul>
                  )}
              </div>
            )}
        </div>

        {/* Right Column: Leaderboard / Stats */}
        <div>
            {started && (
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-slate-700 mb-3">Live Leaderboard</h3>
                  {leaderboard.length === 0 ? (
                    <p className="text-center text-slate-500 text-sm py-4">Waiting for first submission...</p>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard.map((entry, i) => (
                          <div key={i} className={`flex justify-between items-center p-2.5 rounded-lg shadow-sm transition-all duration-300 ${
                            i === 0 ? 'bg-gradient-to-r from-amber-200 to-yellow-300' : 'bg-white'
                          }`}>
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                                i === 0 ? 'bg-amber-400 text-white' :
                                i === 1 ? 'bg-slate-400 text-white' :
                                i === 2 ? 'bg-orange-400 text-white' :
                                'bg-slate-200 text-slate-600'
                              }`}>{i + 1}</span>
                              <span className={`font-bold ${i===0 ? 'text-amber-800' : 'text-slate-700'}`}>{entry.name}</span>
                            </div>
                            <div className={`font-bold text-lg ${i===0 ? 'text-amber-900' : 'text-slate-800'}`}>{entry.score} pts</div>
                          </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
