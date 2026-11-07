const SchoolIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

import { useState, useEffect } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { signInWithGoogle, checkUserExists, createUserInFirestore } from '../firebase';
import { addSchoolUser } from '../services/school.service';
import { createSchool } from '../services/school.service';
import CompleteProfile from './CompleteProfile';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

import { useAuth } from '../contexts/AuthContext';
import SchoolGradeLeaderboard from './SchoolGradeLeaderboard';

const StaffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const StudentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" />
    </svg>
);

const Login = () => {
  const { users, setUsers } = useUserContext();
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || localStorage.getItem('arise-lang') || 'en');
  const handleTranslate = () => {
    const nextLang = lang === 'en' ? 'od' : 'en';
    setLang(nextLang);
    i18n.changeLanguage(nextLang);
    localStorage.setItem('arise-lang', nextLang);
  };

  const { currentUser, userProfile, loading, setUserProfile } = useAuth();
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const location = useLocation();

  useEffect(() => {
    // Restore pendingUser from currentUser if missing (for registration after reload)
    if (!pendingUser && currentUser) {
      setPendingUser({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      });
    }
    // Initialize all users in UserContext after login
    async function fetchAllUsers() {
      try {
        const { getSchoolUsers } = await import('../services/school.service');
        // Try to get schoolId from userProfile or pendingUser
        const schoolId = userProfile?.schoolId || pendingUser?.schoolId;
        if (schoolId) {
          const allUsers = await getSchoolUsers(schoolId);
          setUsers(allUsers);
        }
      } catch (err) {
        // Ignore errors
      }
    }
    if ((currentUser || userProfile) && (users.length === 0)) {
      fetchAllUsers();
    }
    // Do not auto-redirect after login. Always show role selection so user can register for new roles.
    // If offline, do not auto-redirect; let user choose role or login
  }, [loading, isOnline, currentUser, userProfile, location.pathname, navigate, pendingUser, users.length, setUsers]);

  function redirectToDashboard(role) {
    if (role === 'school') navigate('/dashboard/school');
    else if (role === 'staff' || role === 'teacher') navigate('/dashboard/staff');
    else if (role === 'student') navigate('/dashboard/student');
    else navigate('/dashboard');
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      const user = await signInWithGoogle();
      if (!user) return;
      // Fetch all schools and check for user roles in each
      const { getFirestore, collection, getDocs, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const schoolsSnap = await getDocs(collection(db, 'schools'));
      let foundRoles = [];
      let foundSchoolId = null;
      for (const schoolDoc of schoolsSnap.docs) {
        const userDocRef = doc(db, 'schools', schoolDoc.id, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const rolesSnap = await getDocs(collection(db, 'schools', schoolDoc.id, 'users', user.uid, 'roles'));
          foundRoles = rolesSnap.docs.map(doc => doc.id);
          foundSchoolId = schoolDoc.id;
          break;
        }
      }
      setPendingUser({ ...user, schoolId: foundSchoolId });
      setUserRoles(foundRoles);
      if (foundRoles.length === 0) {
        setShowCompleteProfile(true);
      } else {
        setShowCompleteProfile(false);
        setShowLoginSuccess(true);
        setTimeout(() => setShowLoginSuccess(false), 2000);
      }
    } catch (error) {
      setError('Failed to sign in with Google');
      console.error(error);
    }
  }

  // Helper to cache and retrieve user roles/schoolId
  function cacheUserRolesAndSchoolId(uid, roles, schoolId) {
    if (!uid || !Array.isArray(roles) || roles.length === 0) return;
    try {
      localStorage.setItem(`arise-roles-${uid}`, JSON.stringify({ roles, schoolId }));
    } catch {}
  }

  function getCachedUserRolesAndSchoolId(uid) {
    if (!uid) return { roles: [], schoolId: null };
    try {
      const data = localStorage.getItem(`arise-roles-${uid}`);
      if (data) return JSON.parse(data);
    } catch {}
    return { roles: [], schoolId: null };
  }

  async function handleRoleSelect(role) {
    setSelectedRole(role);
    if (!pendingUser) return;
    // If offline, use cached roles/schoolId
    if (!isOnline) {
      const { roles: cachedRoles, schoolId: cachedSchoolId } = getCachedUserRolesAndSchoolId(pendingUser.uid);
      setUserRoles(cachedRoles);
      if (cachedRoles.includes(role)) {
        redirectToDashboard(role);
        setShowCompleteProfile(false);
      } else {
        setError('Role not available offline. Please connect to the internet to register or update roles.');
      }
      return;
    }
    // Online: fetch latest roles from Firestore, then cache
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      let foundRoles = [];
      let foundSchoolId = pendingUser.schoolId;
      if (foundSchoolId) {
        const rolesSnap = await getDocs(collection(db, 'schools', foundSchoolId, 'users', pendingUser.uid, 'roles'));
        foundRoles = rolesSnap.docs.map(doc => doc.id);
      } else {
        const schoolsSnap = await getDocs(collection(db, 'schools'));
        for (const schoolDoc of schoolsSnap.docs) {
          const rolesSnap = await getDocs(collection(db, 'schools', schoolDoc.id, 'users', pendingUser.uid, 'roles'));
          if (!rolesSnap.empty) {
            foundRoles = rolesSnap.docs.map(doc => doc.id);
            foundSchoolId = schoolDoc.id;
            break;
          }
        }
      }
      setUserRoles(foundRoles);
      cacheUserRolesAndSchoolId(pendingUser.uid, foundRoles, foundSchoolId);
      const hasRole = foundRoles.includes(role);
      if (hasRole) {
        redirectToDashboard(role);
        setShowCompleteProfile(false);
      } else {
        if (role === 'school') navigate('/register/school');
        else if (role === 'staff' || role === 'teacher') navigate('/register/staff');
        else if (role === 'student') navigate('/register/student');
      }
    } catch (err) {
      setError('Failed to check user roles. Please try again.');
      console.error('[DEBUG] Error checking user roles', err);
    }
  }

  async function handleCompleteProfile(formData) {
    if (!pendingUser) {
      return;
    }
    // Write role-specific data to users/{uid}/roles/{role}
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const userId = pendingUser.uid || pendingUser.id;
    let schoolId = formData.schoolId;
    if (formData.userType === 'school') {
      // School admin registration
      schoolId = await createSchool({
        name: formData.name,
        address: formData.schoolAddress,
        adminEmail: pendingUser.email
      });
      await addSchoolUser(schoolId, userId, {
        id: userId,
      });
      const roleDocRef = doc(db, 'schools', schoolId, 'users', userId, 'roles', 'school');
      await setDoc(roleDocRef, {
        email: pendingUser.email,
        id: userId,
        name: formData.name,
        schoolAddress: formData.schoolAddress,
        schoolId: schoolId,
        userType: 'school',
        approved: false
      });
    } else if (formData.userType === 'staff') {
      // Staff registration
      if (!schoolId) {
        alert('School selection required for staff');
        return;
      }
      await addSchoolUser(schoolId, userId, {
        id: userId,
      });
      const roleDocRef = doc(db, 'schools', schoolId, 'users', userId, 'roles', 'staff');
      let staffDoc = {
        email: pendingUser.email,
        id: userId,
        name: formData.name,
        schoolId: schoolId,
        userType: 'staff',
        approved: false
      };
      if (formData.subject) staffDoc.subject = formData.subject;
      if (formData.gradeId) staffDoc.gradeId = formData.gradeId;
      if (formData.sectionId) staffDoc.sectionId = formData.sectionId;
      await setDoc(roleDocRef, staffDoc);
    } else if (formData.userType === 'student') {
      // Student registration
      await addSchoolUser(schoolId, userId, {
       id: userId,
      });
      const roleDocRef = doc(db, 'schools', schoolId, 'users', userId, 'roles', 'student');
      let studentDoc = {
        email: pendingUser.email,
        id: userId,
        name: formData.name,
        schoolId: schoolId,
        userType: 'student',
        approved: false
      };
      if (formData.gradeId) studentDoc.gradeId = formData.gradeId;
      if (formData.sectionId) studentDoc.sectionId = formData.sectionId;
      await setDoc(roleDocRef, studentDoc);
    }
    // Fetch the latest roles from subcollection and update context
    const { collection, getDocs } = await import('firebase/firestore');
    const rolesSnap = await getDocs(collection(db, 'schools', schoolId, 'users', userId, 'roles'));
    const roles = rolesSnap.docs.map(doc => doc.id);
    setUserRoles(roles);
    setShowCompleteProfile(false);
    setShowLoginSuccess(true);
    setTimeout(() => setShowLoginSuccess(false), 2000);
    if (isOnline) {
      redirectToDashboard(formData.userType);
    }
  }

  const handleLogout = async () => {
    try {
      const { getAuth, signOut } = await import('firebase/auth');
      const auth = getAuth();
      await signOut(auth);
      window.location.reload();
    } catch (err) {
      alert('Failed to logout. Please try again.');
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
            {children}
        </div>
    </div>
  );

  // Always show role selection page on /select-role, even if not signed in
  const isSelectRoleRoute = location.pathname === '/select-role';
  const isRegisterRoute = location.pathname.startsWith('/register/');
  if (isSelectRoleRoute || (pendingUser && !isRegisterRoute)) {
    const allRoles = [
      { key: 'student', name: t('role_student'), icon: <StudentIcon />, description: t('role_student_desc') },
      { key: 'staff', name: t('role_staff'), icon: <StaffIcon />, description: t('role_staff_desc') },
      { key: 'school', name: t('role_school'), icon: <SchoolIcon />, description: t('role_school_desc') },
    ];
    // If not signed in, clicking a role triggers Google login first
    const handleRoleClick = async (role) => {
      if (!pendingUser) {
        await handleGoogleSignIn();
        // handleGoogleSignIn will set pendingUser and re-render
        return;
      }
      handleRoleSelect(role);
    };
    
    return (
      <PageWrapper>
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-center text-slate-800 flex-1">{t('select_role_title')}</h1>
          <button
            onClick={handleTranslate}
            className="ml-2 px-3 py-1 rounded-lg border border-indigo-300 bg-white text-indigo-700 font-semibold text-sm shadow hover:bg-indigo-50 transition-all"
            aria-label={t('translate')}
          >
            {lang === 'en' ? t('odia') : t('english')}
          </button>
        </div>
        <p className="text-center text-slate-500 pb-4">{t('select_role_subtitle')}</p>
        <button
            onClick={handleLogout}
            className="mt-6 w-full flex items-center justify-center px-6 py-3 text-base font-semibold text-red-700 bg-white rounded-xl shadow border-2 border-red-200 hover:bg-red-50 hover:border-red-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
            {t('logout')}
        </button>
        <div className="flex flex-col gap-4">
          {allRoles.map(role => (
            <button 
              key={role.key} 
              onClick={() => handleRoleClick(role.key)} 
              className="group flex items-center w-full p-4 space-x-4 text-left bg-white/70 rounded-2xl shadow-md border-2 border-transparent hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <div className="flex-shrink-0">{role.icon}</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{role.name}</h2>
                <p className="text-sm text-slate-600">{role.description}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 ml-auto transform group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
        {/* School-wide grade leaderboard below role selection */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center text-indigo-700 mb-2">School Leaderboard</h2>
          <p className="text-center text-slate-500 mb-4 text-sm">Select a grade to view the leaderboard for all students in your school.</p>
          <SchoolGradeLeaderboard schoolId={pendingUser?.schoolId || userProfile?.schoolId} />
        </div>
      </PageWrapper>
  );
  }
  // Registration forms are only shown on /register/role routes
  if (isRegisterRoute) {
    let regRole = location.pathname.split('/').pop();
    if (regRole === 'staff') regRole = 'staff';
    if (regRole === 'school') regRole = 'school';
    if (regRole === 'student') regRole = 'student';
    return (
      <PageWrapper>
        <button
          type="button"
          onClick={() => navigate('/select-role')}
          className="mb-4 text-indigo-600 hover:underline flex items-center"
        >
          <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          {t('back_to_role_selection')}
        </button>
        <h1 className="text-3xl font-bold text-center text-slate-800">
          {t('complete_profile')}
        </h1>
        <p className="text-center text-slate-500 pb-4">{t('few_more_details')}</p>
        <CompleteProfile userType={regRole} onComplete={handleCompleteProfile} />
      </PageWrapper>
    );
  }

  // Default: show Google login page
  return (
    <PageWrapper>
      {showLoginSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center border border-green-200 animate-fade-in">
            <svg className="w-12 h-12 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <div className="text-lg font-semibold text-green-700 mb-1">{t('login_success')}</div>
            <div className="text-sm text-gray-500">{t('welcome_back')}</div>
          </div>
        </div>
      )}
      <div className="flex justify-center mb-4">
        <svg className="w-20 h-20 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
  <h1 className="text-4xl font-bold text-center text-slate-800">{t('arise_platform_title')}</h1>
  <p className="text-center text-slate-500 mt-2">{t('arise_platform_subtitle')}</p>
      {error && (
        <div className="p-3 mt-4 text-sm text-center text-red-800 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}
      <div className="pt-6">
        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-slate-700 bg-white rounded-xl shadow-md border-2 border-transparent hover:shadow-lg hover:border-indigo-500 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform"
        >
          <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>{loading ? t('signing_in') : t('continue_with_google')}</span>
        </button>
      </div>
    </PageWrapper>
  );
};

export default Login;