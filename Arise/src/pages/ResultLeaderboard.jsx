import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ResultLeaderboard = () => {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId, schoolId, gradeId, sectionId } = location.state || {};
  console.log('[Leaderboard] location.state:', location.state);
  console.log('[Leaderboard] quizId:', quizId, 'schoolId:', schoolId, 'gradeId:', gradeId, 'sectionId:', sectionId);

  useEffect(() => {
    console.log('[Leaderboard] useEffect triggered');
    if (!quizId || !schoolId || !gradeId || !sectionId) {
      console.log('[Leaderboard] Missing required params, redirecting to /');
      navigate('/');
      return;
    }
    const quizDocRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId, 'quizzes', quizId);
    console.log('[Leaderboard] Firestore doc path:', quizDocRef.path);
    const unsubscribe = onSnapshot(quizDocRef, (docSnap) => {
      console.log('[Leaderboard] Firestore snapshot received:', docSnap.exists());
      if (docSnap.exists()) {
        const quizData = docSnap.data();
        console.log('[Leaderboard] quizData:', quizData);
        setResults(quizData.results || []);
      } else {
        console.log('[Leaderboard] Quiz document does not exist');
      }
    });
    return () => {
      console.log('[Leaderboard] Unsubscribing Firestore listener');
      unsubscribe();
    };
  }, [quizId, schoolId, gradeId, sectionId, navigate]);

  console.log('[Leaderboard] Render results:', results);
  return (
    <div className="leaderboard-container">
      <h2>Quiz Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {results
            .sort((a, b) => b.score - a.score)
            .map((result, idx) => {
              console.log('[Leaderboard] Row:', result);
              return (
                <tr key={result.studentId || result.name || idx}>
                  <td>{idx + 1}</td>
                  <td>{result.name}</td>
                  <td>{result.score}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultLeaderboard;
