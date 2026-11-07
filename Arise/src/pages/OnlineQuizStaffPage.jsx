import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import OnlineQuizTeacher from '../components/OnlineQuizTeacher';
import { useNavigate } from 'react-router-dom';
import { ClipboardListIcon } from '../components/Icons';

export default function OnlineQuizStaffPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [sectionId, setSectionId] = React.useState(null);
  const [sectionName, setSectionName] = React.useState('');
  const [role, setRole] = React.useState('');
  const [sections, setSections] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Find all sections where user is incharge or subject teacher
    async function fetchSections() {
      if (!userProfile?.schoolId || !userProfile?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const { getSchoolGrades, getGradeSections } = await import('../services/school.service');
        const grades = await getSchoolGrades(userProfile.schoolId);
        let eligibleSections = [];
        
        for (const grade of grades) {
          const secs = await getGradeSections(userProfile.schoolId, grade.id);
          secs.forEach(sec => {
            let isIncharge = String(sec.incharge) === String(userProfile.id);
            let isSubjectFaculty = Array.isArray(sec.subjects) && sec.subjects.some(subj => 
              String(subj.teacherId) === String(userProfile.id) || subj.teacherEmail === userProfile.email
            );
            
            if (isIncharge || isSubjectFaculty) {
              eligibleSections.push({
                id: sec.id,
                name: `${grade.name} - ${sec.name}`,
                role: isIncharge ? 'incharge' : 'subject',
                gradeId: grade.id,
              });
            }
          });
        }
        
        setSections(eligibleSections);
        if (eligibleSections.length > 0) {
          setSectionId(eligibleSections[0].id);
          setSectionName(eligibleSections[0].name);
          setRole(eligibleSections[0].role);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
      
      setLoading(false);
    }
    fetchSections();
  }, [userProfile]);

  if (!userProfile) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600">You are not logged in.</div>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" 
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Loading your sections...</div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600">No sections assigned. You must be a class incharge or subject teacher to conduct quizzes.</div>
        <button 
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700" 
          onClick={() => navigate('/dashboard/staff')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 mt-12">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardListIcon />
          <h1 className="text-2xl font-bold text-indigo-700">Online Quiz Controls</h1>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Select Section</label>
          <select
            className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={sectionId || ''}
            onChange={e => {
              const sec = sections.find(s => s.id === e.target.value);
              setSectionId(e.target.value);
              setSectionName(sec?.name || '');
              setRole(sec?.role || '');
            }}
          >
            <option value="">Select a section</option>
            {sections.map(sec => (
              <option key={sec.id} value={sec.id}>
                {sec.name} ({sec.role === 'incharge' ? 'Class Incharge' : 'Subject Teacher'})
              </option>
            ))}
          </select>
        </div>
        
        {sectionId && (
          <div className="mb-6">
            <OnlineQuizTeacher 
              sectionId={sectionId} 
              gradeId={sections.find(s => s.id === sectionId)?.gradeId}
              schoolId={userProfile?.schoolId}
            />
          </div>
        )}
        
        <button 
          className="text-indigo-600 hover:text-indigo-800 underline" 
          onClick={() => navigate('/dashboard/staff')}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}