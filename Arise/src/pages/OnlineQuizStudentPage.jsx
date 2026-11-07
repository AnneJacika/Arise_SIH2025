import React from 'react';
import { useUserContext } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import OnlineQuizStudent from '../components/OnlineQuizStudent';
import { useNavigate } from 'react-router-dom';

export default function OnlineQuizStudentPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [sectionId, setSectionId] = React.useState(null);
  const [gradeId, setGradeId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { users, setUsers } = useUserContext();
  // Initialize users context with all users for the school if empty
  React.useEffect(() => {
    async function fetchAllUsers() {
      try {
        const { getSchoolUsers } = await import('../services/school.service');
        const schoolId = userProfile?.schoolId;
        if (schoolId) {
          const allUsers = await getSchoolUsers(schoolId);
          setUsers(allUsers);
          console.log("Users context updated: ", allUsers);
          console.log("User profile: ", userProfile);
          // Get student name from users context where role is student and uid matches userProfile.uid
          const studentUser = allUsers.find(u => (u.id === userProfile?.id) && (u.role === 'student' || u.userType === 'student' || (u.roles && u.roles.includes('student'))));
          if (studentUser) {
             console.log("Found student user in context: ", studentUser);
            setStudentName(studentUser.name || studentUser.displayName || 'Student');
          } else {
            setStudentName(userProfile?.firstName || userProfile?.displayName || 'Student');
          }
        }
      } catch (err) {
      }
    }
    if (userProfile && users.length === 0) {
      fetchAllUsers();
    }
  }, [userProfile, users.length, setUsers]);
  // Always initialize studentName with useState, update via useEffect
  const [studentName, setStudentName] = React.useState('');

  React.useEffect(() => {
    async function resolveSectionId() {
      if (!userProfile) return setLoading(false);

      let resolvedStudentName = userProfile?.firstName || userProfile?.displayName || 'Student';

      // Try to get sectionId from userProfile (if dashboard logic sets it)
      if (userProfile.sectionId && userProfile.gradeId) {
        setSectionId(userProfile.sectionId);
        setGradeId(userProfile.gradeId);
        setStudentName(resolvedStudentName);
        // Add/update user in global users list
        setUsers(prev => {
          const filtered = prev.filter(u => u.uid !== userProfile.uid);
          return [...filtered, { ...userProfile, name: resolvedStudentName }];
        });
        setLoading(false);
        return;
      }

      // Fallback: fetch from Firestore roles
      if (userProfile.schoolId && userProfile.uid) {
        try {
          const { collection, getDocs } = await import('firebase/firestore');
          const db = (await import('../firebase')).db;
          const rolesRef = collection(db, 'schools', userProfile.schoolId, 'users', userProfile.uid, 'roles');
          const rolesSnap = await getDocs(rolesRef);
          let studentRoleDoc = null;

          rolesSnap.forEach(docSnap => {
            if (docSnap.id === 'student') studentRoleDoc = docSnap.data();
          });
          if (studentRoleDoc) {
            setSectionId(studentRoleDoc.sectionId);
            setGradeId(studentRoleDoc.gradeId);
            setStudentName(studentRoleDoc.name || resolvedStudentName);
            // Add/update user in global users list
            setUsers(prev => {
              const filtered = prev.filter(u => u.uid !== userProfile.uid);
              return [...filtered, { ...userProfile, ...studentRoleDoc }];
            });
          }

          if (studentRoleDoc?.sectionId && studentRoleDoc?.gradeId) {
            setSectionId(studentRoleDoc.sectionId);
            setGradeId(studentRoleDoc.gradeId);
            if (studentRoleDoc?.name) {
              resolvedStudentName = studentRoleDoc.name;
            }
          }
        } catch (error) {
          console.error('Error fetching student role:', error);
        }
      }
      setStudentName(resolvedStudentName);
      setLoading(false);
    }
    resolveSectionId();
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Loading your section...</div>
      </div>
    );
  }
  
  if (!sectionId || !gradeId) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600">No section assigned. Please contact your school admin.</div>
        <button 
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700" 
          onClick={() => navigate('/dashboard/student')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <OnlineQuizStudent 
          sectionId={sectionId} 
          gradeId={gradeId}
          schoolId={userProfile?.schoolId}
          studentName={studentName}
          users={users}
        />
    </div>
  );
}
