import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LeaderboardPage() {
  const { userProfile } = useAuth();
  const [allLeaderboards, setAllLeaderboards] = useState({});
  const [gradeNames, setGradeNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAllLeaderboards() {
      setLoading(true);
      setError(null);
      try {
        if (!userProfile?.schoolId) {
          setAllLeaderboards({});
          setGradeNames({});
          setLoading(false);
          return;
        }
        const { getSchoolUsers, getSchoolGrades } = await import('../services/school.service');
        // Fetch all grades for the school to get their names
        const grades = await getSchoolGrades(userProfile.schoolId);
        const gradeNameMap = {};
        grades.forEach(g => {
          gradeNameMap[g.id] = g.name || g.id;
        });
        setGradeNames(gradeNameMap);

        const users = await getSchoolUsers(userProfile.schoolId);
        // Group by gradeId
        const byGrade = {};
        users.forEach(u => {
          if (u.roleId === 'student' && u.gradeId) {
            if (!byGrade[u.gradeId]) byGrade[u.gradeId] = [];
            byGrade[u.gradeId].push(u);
          }
        });
        // Sort each grade by points
        Object.keys(byGrade).forEach(gradeId => {
          byGrade[gradeId].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
        });
        setAllLeaderboards(byGrade);
      } catch (err) {
        setError('Failed to load leaderboards.');
      } finally {
        setLoading(false);
      }
    }
    fetchAllLeaderboards();
  }, [userProfile]);

  // Helper to get grade label
  function getGradeLabel(gradeId) {
    const name = gradeNames[gradeId] || gradeId;
    // If the name is a number or like '6', '7', '8', '9', '10', '11', '12', format as '6th Grade'
    if (/^\d+$/.test(name)) {
      const n = parseInt(name, 10);
      let suffix = 'th';
      if (n === 1) suffix = 'st';
      else if (n === 2) suffix = 'nd';
      else if (n === 3) suffix = 'rd';
      else if (n >= 11 && n <= 13) suffix = 'th';
      else if (n % 10 === 1) suffix = 'st';
      else if (n % 10 === 2) suffix = 'nd';
      else if (n % 10 === 3) suffix = 'rd';
      return `${n}${suffix} Grade`;
    }
    // If the name is like 'Grade 6', 'grade 7', etc., just return as is
    return name;
  }

  return (
    <div className="min-h-screen bg-indigo-950">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" 
           style={{
             backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
             backgroundSize: '32px 32px'
           }}>
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            className="mb-8 px-5 py-3 bg-indigo-800 text-indigo-200 hover:bg-indigo-700 hover:text-white transition-all duration-200 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
            onClick={() => navigate(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>

          {/* Clean header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-indigo-600 rounded-xl">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                School Leaderboards
              </h1>
            </div>
            <p className="text-indigo-300 text-lg">See how you stack up against your classmates</p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-3 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-indigo-300">Loading rankings...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-300 text-center">
              {error}
            </div>
          ) : Object.keys(allLeaderboards).length === 0 ? (
            <div className="bg-indigo-900/30 rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-indigo-300 text-lg">No students found</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.keys(allLeaderboards).sort().map(gradeId => (
                <div key={gradeId} className="bg-indigo-900/30 backdrop-blur-sm rounded-xl border border-indigo-800 shadow-xl overflow-hidden">
                  <div className="bg-indigo-800/50 px-6 py-4 border-b border-indigo-700">
                    <h2 className="text-xl font-bold text-white text-center">
                      {getGradeLabel(gradeId)}
                    </h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-indigo-950/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                            Rank
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                            Points
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allLeaderboards[gradeId].map((student, idx) => {
                          const rank = idx + 1;
                          const isCurrentUser = student.id === userProfile.id;
                          
                          return (
                            <tr 
                              key={student.id} 
                              className={`
                                border-b border-indigo-800/30 hover:bg-indigo-800/20 transition-colors duration-150
                                ${isCurrentUser 
                                  ? 'bg-indigo-600/20 border-l-4 border-l-indigo-400' 
                                  : ''
                                }
                              `}
                            >
                              <td className="px-6 py-5">
                                <div className="flex items-center">
                                  {rank === 1 && (
                                    <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                      👑
                                    </div>
                                  )}
                                  {rank === 2 && (
                                    <div className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                      2
                                    </div>
                                  )}
                                  {rank === 3 && (
                                    <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                      3
                                    </div>
                                  )}
                                  {rank > 3 && (
                                    <div className="w-10 h-10 bg-indigo-700 text-indigo-200 rounded-full flex items-center justify-center font-semibold">
                                      {rank}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-lg text-white">
                                    {student.name || student.displayName || student.firstName || 'Student'}
                                  </span>
                                  {isCurrentUser && (
                                    <span className="bg-indigo-500 text-white px-2 py-1 text-xs font-semibold rounded-md">
                                      YOU
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <span className="font-bold text-xl text-white">
                                  {(student.points ?? 0).toLocaleString()}
                                </span>
                                <span className="text-indigo-300 text-sm ml-1">pts</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}