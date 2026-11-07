import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SwitchRole from '../components/SwitchRole';
import OnlineQuizStudent from '../components/OnlineQuizStudent';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { logOut } from '../firebase';

// --- Helper Icon Components ---
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm5-6a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1zm5 10a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13 3a1 1 0 00-1.22-.995l-3.1 1.24a1 1 0 00-.56 1.485L9.58 6.5H5.53A2.5 2.5 0 003.07 9.07l1.19 3.33a2.5 2.5 0 002.39 1.76h4.7a2.5 2.5 0 002.39-1.76l1.19-3.33A2.5 2.5 0 0014.47 6.5h-4.05l1.46-1.77a1 1 0 00-.22-1.485l-3.1-1.24A1 1 0 008 3h5zM4.6 15a1 1 0 100 2h10.8a1 1 0 100-2H4.6z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const WifiOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
  </svg>
);

const ActionCard = ({ title, description, icon, color, onClick, disabled = false }) => (
  <div 
    className={`group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/30 p-6 flex items-center gap-6 transition-all duration-300 ${
      disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
    }`}
    onClick={disabled ? undefined : onClick}
  >
    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
    <div className={`absolute top-1/2 -translate-y-1/2 right-6 text-slate-300 transition-all duration-300 ${
      !disabled && 'group-hover:text-slate-500 group-hover:translate-x-1'
    }`}>
      <ChevronRightIcon />
    </div>
    </div>
  );


import LoadingSpinner from '../components/LoadingSpinner';

const InfoCard = ({ title, children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 ${className}`}>
    <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
    {children}
  </div>
);


export default function StudentDashboard() {
  // --- Leaderboard State ---
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = React.useState(true);
  const [leaderboardError, setLeaderboardError] = React.useState(null);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useAuth(); // Destructure userProfile from useAuth
  const isOnline = useOnlineStatus();
  const [sectionInfo, setSectionInfo] = React.useState(null);
  const [showOnlineQuiz, setShowOnlineQuiz] = React.useState(false);
  const [inchargeInfo, setInchargeInfo] = React.useState(null);
  const [subjectTeachers, setSubjectTeachers] = React.useState([]);
  const [gradeName, setGradeName] = React.useState('');
  const [loadingInfo, setLoadingInfo] = React.useState(true);
  const [error, setError] = React.useState(null);

   // Fetch leaderboard: students in same grade and school, sorted by points
  React.useEffect(() => {
    async function fetchLeaderboard() {
      setLoadingLeaderboard(true);
      setLeaderboardError(null);
      try {
        if (!userProfile?.schoolId || !userProfile?.roles?.student?.gradeId) {
          setLeaderboard([]);
          setLoadingLeaderboard(false);
          return;
        }
        const { getSchoolUsers } = await import('../services/school.service');
        const users = await getSchoolUsers(userProfile.schoolId);
        // Filter: students in same grade
        const gradeId = userProfile.roles.student.gradeId;
        const students = users.filter(u =>
          u.roleId === 'student' && u.gradeId === gradeId
        );
        // Sort by points descending
        students.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
        setLeaderboard(students);
      } catch (err) {
        setLeaderboardError('Failed to load leaderboard.');
      } finally {
        setLoadingLeaderboard(false);
      }
    }
    fetchLeaderboard();
  }, [userProfile]);

  // If userProfile is null, show a message or redirect
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f7ff] via-[#e8f2ff] to-[#dae9ff]">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-4">You are not logged in</h2>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // --- Caching helpers ---
  function cacheStudentMeta(uid, meta) {
    if (!uid) return;
    try {
      localStorage.setItem(`arise-student-meta-${uid}`, JSON.stringify(meta));
    } catch {}
  }

  function getCachedStudentMeta(uid) {
    if (!uid) return null;
    try {
      const data = localStorage.getItem(`arise-student-meta-${uid}`);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }

  React.useEffect(() => {
    async function fetchSectionDetails() {
      if (!userProfile?.schoolId || !userProfile?.id) {
        setLoadingInfo(false);
        return;
      }

      setLoadingInfo(true);
      setError(null);

      // If offline, use cached meta
      if (!isOnline) {
        const cached = getCachedStudentMeta(userProfile.id);
        if (cached) {
          setSectionInfo(cached.sectionInfo || null);
          setInchargeInfo(cached.inchargeInfo || null);
          setSubjectTeachers(cached.subjectTeachers || []);
          setGradeName(cached.gradeName || '');
          setLoadingInfo(false);
          return;
        } else {
          setError('No cached data available for offline mode. Please connect to the internet once.');
          setLoadingInfo(false);
          return;
        }
      }

      try {
        // ...existing code for online fetch...
        const { collection, getDocs } = await import('firebase/firestore');
        const db = (await import('../firebase')).db;
        const rolesRef = collection(db, 'schools', userProfile.schoolId, 'users', userProfile.id, 'roles');
        const rolesSnap = await getDocs(rolesRef);
        let studentRoleDoc = null;
        rolesSnap.forEach(docSnap => {
          if (docSnap.id === 'student') studentRoleDoc = docSnap.data();
        });
        if (!studentRoleDoc) {
          setError('No student role found for your account. Please contact your school admin.');
          setLoadingInfo(false);
          return;
        }
        if (!studentRoleDoc.gradeId || !studentRoleDoc.sectionId) {
          setError('Your student role is missing grade or section assignment. Please contact your school admin.');
          setLoadingInfo(false);
          return;
        }
        const gradeId = studentRoleDoc.gradeId;
        const sectionId = studentRoleDoc.sectionId;

        const { getGradeSections, getSchoolUsers, getSchoolGrades } = await import('../services/school.service');
        // Get section info
        const sections = await getGradeSections(userProfile.schoolId, gradeId);
        const section = sections.find(sec => sec.id === sectionId);
        if (!section) {
          setError('Your section could not be found. Please contact your school admin.');
          setLoadingInfo(false);
          return;
        }
        setSectionInfo(section);

        // Get all users for lookup
        const users = await getSchoolUsers(userProfile.schoolId);

        // Incharge info
        let incharge = null;
        if (section?.incharge) {
          incharge = users.find(u => u.id === section.incharge);
        }
        setInchargeInfo(incharge);

        // Subject teachers
        let teachers = [];
        if (Array.isArray(section?.subjects)) {
          teachers = section.subjects.map(subj => {
            let teacher = null;
            if (subj.teacherId) {
              teacher = users.find(u => u.id === subj.teacherId);
            } else if (subj.teacherEmail) {
              teacher = users.find(u => u.email === subj.teacherEmail);
            }
            return {
              subject: subj.name || subj.subjectName || 'Subject',
              teacher: teacher
            };
          });
        }
        setSubjectTeachers(teachers);

        // Get grade name
        const grades = await getSchoolGrades(userProfile.schoolId);
        const grade = grades.find(g => g.id === gradeId);
        if (!grade) {
          setError('Your grade could not be found. Please contact your school admin.');
          setLoadingInfo(false);
          return;
        }
        setGradeName(grade.name);

        // Cache all meta for offline use
        cacheStudentMeta(userProfile.id, {
          sectionInfo: section,
          inchargeInfo: incharge,
          subjectTeachers: teachers,
          gradeName: grade.name
        });
      } catch (err) {
        console.error('[StudentDashboard] Error fetching section details:', err);
        setError('Failed to load section information. Please try again later.');
      } finally {
        setLoadingInfo(false);
      }
    }

    fetchSectionDetails();
  }, [userProfile, isOnline]);

  const handleLogout = async () => {
    try {
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleActionClick = (action) => {
    switch (action) {
      case 'continue':
        navigate('/quiz/continue');
        break;
      case 'offline-quizzes':
        navigate('/offline-quizzes');
        break;
      case 'progress':
        navigate('/progress');
        break;
      case 'achievements':
        navigate('/achievements');
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-[#e8f2ff] to-[#dae9ff]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                {t('student_dashboard_welcome', { name: userProfile?.firstName || t('student') })}
              </h1>
              {!isOnline && (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  <WifiOffIcon />
                  {t('offline_mode')}
                </div>
              )}
            </div>
            {gradeName && (
              <p className="text-lg text-slate-600">
                {t('grade')}: <span className="font-semibold text-slate-800">{gradeName}</span>
                {sectionInfo?.name && (
                  <span className="ml-2">{t('section')}: <span className="font-semibold text-slate-800">{sectionInfo.name}</span></span>
                )}
              </p>
            )}
          </div>
          
          <div className="mt-6 sm:mt-0 flex items-center gap-3">
            <SwitchRole />
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl bg-slate-400 text-white shadow-lg hover:bg-slate-500 hover:shadow-xl transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">{t('back')}</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-800 rounded-xl">
            {t('student_dashboard_error', { error })}
          </div>
        )}

        {/* Action Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
    <ActionCard
      title="Leaderboard"
      description="See the top students in every grade."
      icon={<TrophyIcon />}
      color="bg-gradient-to-br from-yellow-400 to-yellow-600"
      onClick={() => navigate('/dashboard/leaderboard')}
    />
    <ActionCard
      title="Q/A Corner"
      description="Ask questions to teachers and get answers."
      icon={<span role='img' aria-label='Q/A'>❓</span>}
      color="bg-gradient-to-br from-indigo-400 to-indigo-600"
      onClick={() => navigate('/dashboard/qacorner')}
    />
    <ActionCard
      title="Enter Playground"
      description="Play at least 20 fun games with mock questions!"
      icon={<span role='img' aria-label='playground'>🎮</span>}
      color="bg-gradient-to-br from-orange-400 to-pink-500"
      onClick={() => navigate('/dashboard/student/playground')}
    />
          <ActionCard
            title={t('student_dashboard_continue_learning')}
            description={t('student_dashboard_continue_learning_desc')}
            icon={<PlayIcon />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            onClick={() => handleActionClick('continue')}
          />
          <ActionCard
            title="Join Online Quiz"
            description="Participate in real-time quizzes scheduled by your teacher."
            icon={<ChartBarIcon />}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
            onClick={() => navigate('/dashboard/student/online-quiz')}
          />
          <ActionCard
            title={t('student_dashboard_offline_quizzes')}
            description={t('student_dashboard_offline_quizzes_desc')}
            icon={<BookOpenIcon />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            onClick={() => navigate('/dashboard/student/offline-quiz')}
          />
          <ActionCard
            title={t('student_dashboard_your_progress')}
            description={t('student_dashboard_your_progress_desc')}
            icon={<ChartBarIcon />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            onClick={() => handleActionClick('progress')}
          />
          <ActionCard
            title={t('student_dashboard_achievements')}
            description={t('student_dashboard_achievements_desc')}
            icon={<TrophyIcon />}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            onClick={() => handleActionClick('achievements')}
          />
        <ActionCard
          title="Enter Lab"
          description="Explore Physics, Chemistry, and Biology labs"
          icon={<span role="img" aria-label="lab" className="text-3xl">🧪</span>}
          color="bg-green-100 text-green-700"
          onClick={() => navigate('/dashboard/student/lab')}
        />
        </div>



        {/* Information Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subjects and Teachers */}
          <InfoCard title={t('student_dashboard_subjects_teachers')}>
            {loadingInfo ? (
              <LoadingSpinner />
            ) : subjectTeachers.length === 0 ? (
              <p className="text-slate-500 text-center py-8">{t('student_dashboard_no_subjects')}</p>
            ) : (
              <div className="space-y-4">
                {subjectTeachers.map((subj, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-slate-100">
                      <BookOpenIcon className="w-8 h-8 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{subj.subject}</p>
                      <p className="text-xs text-slate-500 truncate">{subj.teacher ? t('student_dashboard_teacher_name', { name: subj.teacher.name }) : t('student_dashboard_teacher_not_assigned')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>

          {/* Section Incharge */}
          <InfoCard title={t('student_dashboard_section_incharge')}>
            {loadingInfo ? (
              <LoadingSpinner/>
            ) : inchargeInfo ? (
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-slate-100">
                  <img src={inchargeInfo.photoURL} alt={inchargeInfo.name} className="w-8 h-8 rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{inchargeInfo.name}</p>
                  <p className="text-xs text-slate-500">{inchargeInfo.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">{t('student_dashboard_no_incharge')}</p>
            )}
          </InfoCard>
        </div>
      </div> 
    </div>
    );
}
