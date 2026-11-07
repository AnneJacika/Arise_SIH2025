      
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
// Lazy load LeaderboardPage for code splitting
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import SchoolDashboard from './pages/SchoolDashboard';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';
import OfflineQuiz from './pages/OfflineQuiz';
import './App.css';

import OnlineQuizStudentPage from './pages/OnlineQuizStudentPage';
import OnlineQuizStaffPage from './pages/OnlineQuizStaffPage';
import ResultLeaderboard from './pages/ResultLeaderboard';
import Playground from './pages/Playground';
import Lab from './pages/Lab';
import PhysicsLab from './pages/PhysicsLab';
import ChemistryLab from './pages/ChemistryLab';
import BiologyLab from './pages/BiologyLab';
import LevelMap from './components/games/LevelMap';

// Protected route component
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Update network status
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
      console.log("Online status: ", navigator.onLine);
    };

    // Listen to the online status
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Specify how to clean up after this effect:
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);



  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/select-role" element={<Login directRole="role" />} />
          <Route path="/register/school" element={<Login directRole="school" />} />
          <Route path="/register/staff" element={<Login directRole="staff" />} />
          <Route path="/register/student" element={<Login directRole="student" />} />
          <Route path="/select-role" element={<Login directRole="role" />} />
          <Route 
            path="/dashboard/school" 
            element={<PrivateRoute><SchoolDashboard isOnline={isOnline} /></PrivateRoute>} 
          />
          <Route 
            path="/dashboard/staff" 
            element={<PrivateRoute><StaffDashboard isOnline={isOnline} /></PrivateRoute>} 
          />
          <Route 
            path="/dashboard/student" 
            element={<PrivateRoute><StudentDashboard isOnline={isOnline} /></PrivateRoute>} 
          />
          <Route
            path="/dashboard/leaderboard"
            element={
              <PrivateRoute>
                <Suspense fallback={<div>Loading...</div>}>
                  <LeaderboardPage />
                </Suspense>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/student/online-quiz"
            element={<PrivateRoute><OnlineQuizStudentPage /></PrivateRoute>}
          />
          <Route
            path="/dashboard/staff/online-quiz"
            element={<PrivateRoute><OnlineQuizStaffPage /></PrivateRoute>}
          />
          <Route
            path="/dashboard/student/offline-quiz"
            element={<PrivateRoute><OfflineQuiz /></PrivateRoute>}
          />
          <Route
            path="/dashboard/student/playground"
            element={<PrivateRoute><Playground /></PrivateRoute>}
          />
          <Route path="/dashboard/student/lab" element={<PrivateRoute><Lab /></PrivateRoute>} />
          <Route path="/lab/physics" element={<PrivateRoute><PhysicsLab /></PrivateRoute>} />
          <Route path="/lab/chemistry" element={<PrivateRoute><ChemistryLab /></PrivateRoute>} />
          <Route path="/lab/biology" element={<PrivateRoute><BiologyLab /></PrivateRoute>} />
          <Route path="/result-leaderboard" element={<ResultLeaderboard />} />
          <Route
            path="/dashboard/student/offline-quiz/map"
            element={<PrivateRoute><LevelMap /></PrivateRoute>}
          />
          <Route
            path="/map"
            element={<PrivateRoute><LevelMap /></PrivateRoute>}
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
