
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';


export default function SchoolGradeLeaderboard() {
  const { userProfile } = useAuth();
  const [allLeaderboards, setAllLeaderboards] = useState({});
  const [gradeNames, setGradeNames] = useState({});
  const [selectedGrade, setSelectedGrade] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolMap, setSchoolMap] = useState({});


  useEffect(() => {
    async function fetchAllLeaderboards() {
      setLoading(true);
      setError(null);
      try {
        const { getAllSchools, getSchoolUsers, getSchoolGrades } = await import('../services/school.service');
        const schools = await getAllSchools();
        // Build a map of schoolId to school name
        const schoolMapObj = {};
        schools.forEach(s => { schoolMapObj[s.id] = s.name || s.id; });
        setSchoolMap(schoolMapObj);

        // Get all users from all schools
        let allUsers = [];
        for (const school of schools) {
          const users = await getSchoolUsers(school.id);
          // Attach schoolId to each user
          users.forEach(u => u.schoolId = school.id);
          allUsers = allUsers.concat(users);
        }

        // Get all grades (union of all grades across schools)
        let allGrades = [];
        for (const school of schools) {
          const grades = await getSchoolGrades(school.id);
          grades.forEach(g => allGrades.push({ ...g, schoolId: school.id }));
        }
        // Build grade name map (by gradeId)
        const gradeNameMap = {};
        allGrades.forEach(g => { gradeNameMap[g.id] = g.name || g.id; });
        setGradeNames(gradeNameMap);

        // Group students by gradeId (across all schools)
        const byGrade = {};
        allUsers.forEach(u => {
          if (u.roleId === 'student' && u.gradeId) {
            if (!byGrade[u.gradeId]) byGrade[u.gradeId] = [];
            byGrade[u.gradeId].push(u);
          }
        });
        Object.keys(byGrade).forEach(gradeId => {
          byGrade[gradeId].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
        });
        setAllLeaderboards(byGrade);
        // Default to first grade if not selected
        if (!selectedGrade && allGrades.length > 0) setSelectedGrade(allGrades[0].id);
      } catch (err) {
        setError('Failed to load leaderboards.');
      } finally {
        setLoading(false);
      }
    }
    fetchAllLeaderboards();
    // eslint-disable-next-line
  }, []);

  function getGradeLabel(gradeId) {
    const name = gradeNames[gradeId] || gradeId;
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
    return name;
  }

  return (
    <div className="my-8">
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {Object.keys(gradeNames).sort().map(gradeId => (
          <button
            key={gradeId}
            onClick={() => setSelectedGrade(gradeId)}
            className={`px-4 py-2 rounded-lg font-semibold border transition-all duration-150 ${selectedGrade === gradeId ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'}`}
          >
            {getGradeLabel(gradeId)}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading leaderboard...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : !selectedGrade || !allLeaderboards[selectedGrade] ? (
        <div className="text-center py-8 text-slate-400">No students found for this grade.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow border border-slate-100 bg-slate-50 max-w-xl mx-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">School</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Points</th>
              </tr>
            </thead>
            <tbody>
              {allLeaderboards[selectedGrade].slice(0, 5).map((student, idx) => (
                <tr key={student.id + '-' + (student.schoolId || '')} className={student.id === userProfile?.id ? 'bg-yellow-100 font-bold' : idx < 3 ? 'bg-indigo-50' : ''}>
                  <td className="px-6 py-2">{idx + 1}</td>
                  <td className="px-6 py-2">{student.name || student.displayName || student.firstName || 'Student'}</td>
                  <td className="px-6 py-2">{schoolMap[student.schoolId] || student.schoolId || '-'}</td>
                  <td className="px-6 py-2">{student.points ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
