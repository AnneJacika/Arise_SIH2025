    // ...existing code...
    // Add Leaderboard Action Card at the top of the dashboard
    // Place after the main header or at the top of the main grid
        // ...existing code...
        // Insert Leaderboard Card/Button in the main dashboard UI
        // Find the main grid or card area and add the following:
        // Example: place after a main header or before other cards
        // (You may adjust placement as needed for your UI)

import React, { useState, useEffect, useMemo } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SwitchRole from '../components/SwitchRole';
import OnlineQuizTeacher from '../components/OnlineQuizTeacher';
import { ClipboardListIcon } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { logOut } from '../firebase';
import { getSchoolGrades, getGradeSections, addSectionStudent, getSchoolUsers, getSectionStudents } from '../services/school.service';

// --- Enhanced Icon Components ---
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

// Enhanced Card Component with glassmorphism and modern styling
const Card = ({ title, icon, children, className = "", variant = "default" }) => {
    const variantStyles = {
        default: "bg-white/90 border border-slate-200",
        primary: "bg-slate-50 border border-slate-200",
        success: "bg-slate-50 border border-slate-200",
        warning: "bg-slate-50 border border-slate-200",
        feature: "bg-slate-100 border border-slate-200"
    };

  return (
    <div className={`
      ${variantStyles[variant]}
      backdrop-blur-xl rounded-2xl shadow-xl border transition-all duration-300 
      hover:scale-[1.02] hover:shadow-2xl p-6 group ${className}
    `}>
      {title && (
        <div className="flex items-center mb-6 text-xl font-bold text-slate-800 group-hover:text-slate-900">
          <div className="mr-3 text-indigo-600 group-hover:text-indigo-700 transition-colors duration-300 transform group-hover:scale-110">
            {icon}
          </div>
          <h2 className="text-slate-800">{title}</h2>
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Enhanced SectionStudentList Component
function SectionStudentList({ schoolId, gradeId, section, canManage }) {
    const { t } = useTranslation();
    const [studentDetails, setStudentDetails] = React.useState([]);
    const [moveTarget, setMoveTarget] = React.useState({});
    const [otherSections, setOtherSections] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const isOnline = useOnlineStatus();
    const userProfile = useAuth().userProfile;

    React.useEffect(() => {
        // If offline, use cached section students (support both sectionStudents and sections[gradeId][].students)
        if (!isOnline && userProfile) {
            try {
                const cached = localStorage.getItem(`arise-staff-meta-${userProfile.id}`);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    let sectionStudentIds = parsed.sectionStudents?.[section.id];
                    // Fallback: look for students in sections[gradeId][].students
                    if (!sectionStudentIds) {
                        const gradeSections = parsed.sections?.[gradeId] || [];
                        const foundSection = gradeSections.find(sec => sec.id === section.id);
                        sectionStudentIds = foundSection?.students || [];
                    }
                    const allUsers = parsed.users || [];
                    const details = allUsers.filter(u => sectionStudentIds.includes(u.id) && (u.approved === true || u.approved === undefined) && (u.userType === 'student'));
                    setStudentDetails(details);
                    setLoading(false);
                    return;
                }
            } catch {}
        }
        setLoading(true);
        // Fetch student IDs in this section
        getSectionStudents(schoolId, gradeId, section.id).then(async (studentIds) => {
            if (!studentIds.length) {
                setStudentDetails([]);
                setLoading(false);
                return;
            }
            // Fetch user details for each student ID
            const usersSnap = await import('../services/school.service');
            const { getSchoolUsers } = usersSnap;
            const allUsers = await getSchoolUsers(schoolId);
            // Filter only those in this section
            const details = allUsers.filter(u => studentIds.includes(u.id) && (u.approved === true || u.approved === undefined) && (u.userType === 'student'));
            setStudentDetails(details);
            setLoading(false);
        });
        if (canManage) {
            getGradeSections(schoolId, gradeId).then(secs => {
                setOtherSections(secs.filter(sec => sec.id !== section.id));
            });
        }
    }, [schoolId, gradeId, section.id, canManage, isOnline, userProfile]);

    // Only incharge can move students
    async function handleMoveStudent(student, targetSectionId) {
        if (!canManage || !targetSectionId) return;
        setLoading(true);
        try {
            await addSectionStudent(schoolId, gradeId, targetSectionId, student.id);
            // Refresh this section's students after move
            getSectionStudents(schoolId, gradeId, section.id).then(async (studentIds) => {
                const usersSnap = await import('../services/school.service');
                const { getSchoolUsers } = usersSnap;
                const allUsers = await getSchoolUsers(schoolId);
                const details = allUsers.filter(u => studentIds.includes(u.id));
                setStudentDetails(details);
                setLoading(false);
            });
        } catch (error) {
            console.error('Error moving student:', error);
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-blue-700 font-medium">Loading students...</span>
                </div>
            </div>
        );
    }

    if (!studentDetails.length) {
        return (
            <div className="text-center py-12 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                <div className="mx-auto w-16 h-16 bg-slate-300 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                </div>
                <h4 className="text-lg font-semibold text-slate-600 mb-2">No Students Found</h4>
                <p className="text-slate-500">{t('no_students_in_section')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4">
                {studentDetails.map((student, idx) => (
                    <div 
                        key={student.id + '-' + (section?.id || '') + '-' + idx} 
                        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                    >
                        <div className="flex items-center justify-between">
                            <div 
                                className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                                onClick={() => alert(`${t('name')}: ${student.name || student.displayName || 'N/A'}\n${t('email')}: ${student.email || 'N/A'}\nID: ${student.id}`)}
                            >
                                <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                        <span className="text-white font-bold text-xl">
                                            {(student.name || student.displayName || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors duration-200">
                                        {student.name || student.displayName || 'Unknown Student'}
                                    </h4>
                                    <p className="text-sm text-slate-600">{student.email || student.id}</p>
                                    <div className="flex items-center mt-2 space-x-3">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-xs text-green-600 font-medium">Active</span>
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                            <span className="text-xs text-blue-600 font-medium">Enrolled</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {canManage && otherSections.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                        <span className="text-sm text-slate-600 font-medium">Move to:</span>
                                    </div>
                                    <select
                                        className="bg-white border-2 border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 hover:border-slate-400"
                                        value={moveTarget[student.id] || ''}
                                        onChange={e => { 
                                            setMoveTarget(mt => ({ ...mt, [student.id]: e.target.value })); 
                                            handleMoveStudent(student, e.target.value); 
                                        }}
                                        disabled={loading}
                                    >
                                        <option value="">{t('move_to_section')}</option>
                                        {otherSections.map(sec => (
                                            <option key={sec.id} value={sec.id}>{sec.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Summary Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 font-semibold text-sm">Total Students</p>
                            <p className="text-2xl font-bold text-blue-800">{studentDetails.length}</p>
                        </div>
                        <div className="p-3 bg-slate-200 rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 font-semibold text-sm">Active Students</p>
                            <p className="text-2xl font-bold text-green-800">{studentDetails.length}</p>
                        </div>
                        <div className="p-3 bg-slate-200 rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-600 font-semibold text-sm">Engagement</p>
                            <p className="text-2xl font-bold text-purple-800">98%</p>
                        </div>
                        <div className="p-3 bg-slate-200 rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StaffDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const isOnline = useOnlineStatus();
    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState({});
    const [studentInputs, setStudentInputs] = useState({});
    const [loading, setLoading] = useState(false);
    const [pendingStudents, setPendingStudents] = useState([]);
    const { users, setUsers } = useUserContext();
    const schoolId = userProfile?.schoolId;
    const userId = userProfile?.id;
    const [roleApproved, setRoleApproved] = useState(undefined);
    const isApproved = roleApproved !== false;
    const [quizResults, setQuizResults] = useState([]);
    const [quizResultsLoading, setQuizResultsLoading] = useState(false);

    // --- Caching helpers ---
    function cacheStaffMeta(uid, meta) {
        if (!uid) return;
        try {
            localStorage.setItem(`arise-staff-meta-${uid}`, JSON.stringify(meta));
        } catch {}
    }

    function getCachedStaffMeta(uid) {
        if (!uid) return null;
        try {
            const data = localStorage.getItem(`arise-staff-meta-${uid}`);
            if (data) return JSON.parse(data);
        } catch {}
        return null;
    }

    // Fetch approval status from roles/staff subcollection
    useEffect(() => {
        async function fetchStaffApproval() {
            if (!schoolId || !userId) {
                setRoleApproved(undefined);
                return;
            }
            try {
                const { getFirestore, doc, getDoc } = await import('firebase/firestore');
                const db = getFirestore();
                const roleRef = doc(db, 'schools', schoolId, 'users', userId, 'roles', 'staff');
                const roleSnap = await getDoc(roleRef);
                if (roleSnap.exists()) {
                    const roleData = roleSnap.data();
                    setRoleApproved(typeof roleData.approved !== 'undefined' ? roleData.approved : undefined);
                } else {
                    setRoleApproved(undefined);
                }
            } catch (err) {
                setRoleApproved(undefined);
            }
        }
        fetchStaffApproval();
    }, [schoolId, userId]);

    // Memoize mySections to avoid infinite useEffect loops
    const mySections = useMemo(() => {
        if (!isApproved) return [];
        const result = [];
        grades.forEach(grade => {
            (sections[grade.id] || []).forEach(section => {
                console.log("Section: ", section);
                let isIncharge = String(section.incharge) === String(userId);
                let isSubjectFaculty = Array.isArray(section.subjects) && section.subjects.some(subj => String(subj.teacherId) === String(userId) || subj.teacherEmail === userProfile?.email);
                if (isIncharge || isSubjectFaculty) {
                    result.push({ grade, section, isIncharge, isSubjectFaculty });
                }
            });
        });
        console.log("My Sections: ", result);
        return result;
    }, [isApproved, grades, sections, userId, userProfile?.email]);

    const [selectedSectionId, setSelectedSectionId] = React.useState(null);
    const [selectedRole, setSelectedRole] = React.useState(null);

    // Fetch quiz results for the selected section
    // IMPORTANT: Backend must write quiz metadata/results to Firestore at:
    //   schools/{schoolId}/grades/{gradeId}/sections/{selectedSectionId}/quizzes
    // with fields: scheduledAt, startedAt, endedAt, participants, results
    // This is required for results to show up here.
    //
    // To force refresh after quiz creation/end, listen for a custom event:
    const auth = useAuth();
    const onlineStatus = useOnlineStatus();

    useEffect(() => {
        function handleQuizChanged() {
            fetchQuizResults(auth.userProfile, onlineStatus);
        }
        window.addEventListener('quiz-changed', handleQuizChanged);
        return () => window.removeEventListener('quiz-changed', handleQuizChanged);
    }, [schoolId, selectedSectionId, isApproved, sections, mySections, auth.userProfile, onlineStatus]);

    async function fetchQuizResults(userProfile, isOnline) {
        if (!schoolId || !selectedSectionId || !isApproved) {
            setQuizResults([]);
            return;
        }
        // If offline, use cached quiz analytics (support both sectionQuizAnalytics and sections[gradeId][].quizzes)
        if (!isOnline && userProfile) {
            try {
                const cached = localStorage.getItem(`arise-staff-meta-${userProfile.id}`);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    let quizResults = parsed.sectionQuizAnalytics?.[selectedSectionId];
                    // Fallback: look for quizzes in sections[gradeId][].quizzes
                    if (!quizResults) {
                        // Find the gradeId for this section
                        let gradeId = null;
                        for (const gid in parsed.sections) {
                            const foundSection = (parsed.sections[gid] || []).find(sec => sec.id === selectedSectionId);
                            if (foundSection) {
                                gradeId = gid;
                                quizResults = foundSection.quizzes || [];
                                break;
                            }
                        }
                    }
                    setQuizResults(quizResults || []);
                    setQuizResultsLoading(false);
                    return;
                }
            } catch {}
        }
        setQuizResultsLoading(true);
        try {
            const { getFirestore, collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
            const db = getFirestore();
            const sectionObj = Object.values(sections).flat().find(sec => sec.id === selectedSectionId);
            const gradeId = sectionObj?.gradeId || (mySections.find(s => s.section.id === selectedSectionId)?.grade.id);
            if (!gradeId) {
                setQuizResults([]);
                setQuizResultsLoading(false);
                return;
            }
            const quizzesRef = collection(db, 'schools', schoolId, 'grades', gradeId, 'sections', selectedSectionId, 'quizzes');
            const q = query(quizzesRef, orderBy('scheduledAt', 'desc'));
            const snap = await getDocs(q);
            const results = [];
            snap.forEach(docSnap => {
                results.push({ id: docSnap.id, ...docSnap.data() });
            });
            console.log('[DEBUG] Quiz Results fetched from Firestore:', results);
            setQuizResults(results);
            // --- Cache quiz results in localStorage for offline use ---
            if (userProfile && userProfile.id) {
                try {
                    const cacheKey = `arise-staff-meta-${userProfile.id}`;
                    let cached = localStorage.getItem(cacheKey);
                    let parsed;
                    if (cached) {
                        try {
                            parsed = JSON.parse(cached);
                        } catch (e) {
                            console.error('[DEBUG] Failed to parse cached staff meta, resetting:', e);
                            parsed = {};
                        }
                    } else {
                        parsed = {};
                    }
                    // Ensure all required structure exists
                    if (!parsed.sectionQuizAnalytics || typeof parsed.sectionQuizAnalytics !== 'object') parsed.sectionQuizAnalytics = {};
                    if (!parsed.sections || typeof parsed.sections !== 'object') parsed.sections = {};
                    if (!parsed.grades || !Array.isArray(parsed.grades)) parsed.grades = [];
                    if (!parsed.users || !Array.isArray(parsed.users)) parsed.users = [];
                    parsed.sectionQuizAnalytics[selectedSectionId] = results;
                    localStorage.setItem(cacheKey, JSON.stringify(parsed));
                    console.log('[DEBUG] Quiz Results cached to localStorage:', parsed.sectionQuizAnalytics[selectedSectionId]);
                    console.log('[DEBUG] Full cached staff meta after quiz update:', parsed);
                } catch (e) {
                    console.error('[DEBUG] Failed to cache quiz results to localStorage:', e);
                }
            }
        } catch (err) {
            console.error('Failed to fetch quiz results:', err);
            setQuizResults([]);
        } finally {
            setQuizResultsLoading(false);
        }
    }
    // Initial fetch
    useEffect(() => {
        fetchQuizResults(auth.userProfile, onlineStatus);
    }, [schoolId, selectedSectionId, isApproved, sections, mySections, auth.userProfile, onlineStatus]);

    async function handleLogout() {
        try {
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    // Fetch grades, sections, and users on mount
    useEffect(() => {
        if (!schoolId || !isApproved) return;
        // If offline, use cached meta
        if (!isOnline) {
            const cached = getCachedStaffMeta(userId);
            if (cached) {
                setGrades(cached.grades || []);
                setSections(cached.sections || {});
                setUsers(cached.users || []);
                setLoading(false);
                return;
            } else {
                setLoading(false);
                return;
            }
        }
        setLoading(true);
        getSchoolGrades(schoolId).then(async gradesList => {
            setGrades(gradesList);
            const allSections = {};
            for (const grade of gradesList) {
                allSections[grade.id] = await getGradeSections(schoolId, grade.id);
            }
            setSections(allSections);
            // Also fetch all users for staff context
            const allUsers = await getSchoolUsers(schoolId);
            setUsers(allUsers);
            // Cache all meta for offline use
            cacheStaffMeta(userId, {
                grades: gradesList,
                sections: allSections,
                users: allUsers
            });
        }).finally(() => setLoading(false));
    }, [schoolId, isApproved, isOnline, userId, setUsers]);

    // When mySections changes, reset selection
    React.useEffect(() => {
        if (mySections.length > 0) {
            setSelectedSectionId(mySections[0].section.id);
            setSelectedRole(mySections[0].isIncharge ? 'incharge' : 'subject');
        } else {
            setSelectedSectionId(null);
            setSelectedRole(null);
        }
    }, [mySections.length]);

    // Pending students for teacher's sections
    useEffect(() => {
        if (!isApproved || !users.length || !mySections.length) return;
        const inchargeOnlySections = mySections.filter(s => s.isIncharge);
        async function fetchPendingStudents() {
            const pending = [];
            for (const u of users) {
                if (!(u.roles?.includes('student') || u.role === 'student' || u.userType === 'student')) continue;
                if (u.approved === true) continue;
                let roleGradeId = u.gradeId;
                let roleApproved = u.approved;
                try {
                    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
                    const db = getFirestore();
                    const roleRef = doc(db, 'schools', schoolId, 'users', u.id, 'roles', 'student');
                    const roleSnap = await getDoc(roleRef);
                    if (roleSnap.exists()) {
                        const roleData = roleSnap.data();
                        if (roleData.gradeId) roleGradeId = roleData.gradeId;
                        if (typeof roleData.approved !== 'undefined') roleApproved = roleData.approved;
                    }
                } catch (err) {
                    // Ignore Firestore errors, fallback to root doc
                }
                if (roleApproved === false || typeof roleApproved === 'undefined') {
                    if (inchargeOnlySections.some(({ grade }) => grade.id === roleGradeId)) {
                        pending.push({ ...u, gradeId: roleGradeId, approved: roleApproved });
                    }
                }
            }
            setPendingStudents(pending);
        }
        fetchPendingStudents();
    }, [isApproved, users, mySections, schoolId]);

    // Assign a pending student to a section and approve them
    async function handleAssignStudentToSection(student, section) {
        setLoading(true);
        try {
            const addResult = await addSectionStudent(schoolId, section.gradeId, section.id, student.id);
            const { db } = await import('../firebase');
            const { doc, updateDoc, setDoc, getDoc } = await import('firebase/firestore');
            const studentRef = doc(db, 'schools', schoolId, 'users', student.id);
            await updateDoc(studentRef, { sectionId: section.id, gradeId: section.gradeId, approved: true });
            const roleRef = doc(db, 'schools', schoolId, 'users', student.id, 'roles', 'student');
            const roleSnap = await getDoc(roleRef);
            if (roleSnap.exists()) {
                await updateDoc(roleRef, { approved: true, sectionId: section.id, gradeId: section.gradeId });
            } else {
                await setDoc(roleRef, { approved: true, sectionId: section.id, gradeId: section.gradeId }, { merge: true });
            }
            await Promise.all([
                getSchoolUsers(schoolId).then(u => { 
                    setUsers(u); 
                }),
                getSchoolGrades(schoolId).then(async gradesList => {
                    setGrades(gradesList);
                    const allSections = {};
                    for (const grade of gradesList) {
                        allSections[grade.id] = await getGradeSections(schoolId, grade.id);
                    }
                    setSections(allSections);
                })
            ]);
        } catch (error) {
            console.error('Failed to assign student to section:', error);
            alert('Failed to assign student to section: ' + (error?.message || error));
        } finally {
            setLoading(false);
        }
    }

    if (!isApproved) {
        return (
            <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-400/10 to-orange-500/10 rounded-full blur-3xl animate-ping"></div>
                
                <div className="relative z-10 max-w-lg w-full bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col items-center">
                    <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl">
                        <InfoIcon />
                    </div>
                    <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text mb-4 text-center">
                        {t('staff_dashboard_title')}
                    </h1>
                    <p className="text-slate-300 mb-8 text-lg text-center">
                        {t('welcome')}, <span className="font-semibold text-cyan-300">{userProfile?.displayName || ''}</span>!
                    </p>
                    <div className="flex flex-col items-center gap-6 w-full">
                        <div className="flex items-center gap-3 text-amber-300 bg-amber-500/20 px-6 py-3 rounded-full border border-amber-500/30 backdrop-blur-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-lg">{t('pending_approval_by_admin')}</span>
                        </div>
                        <p className="text-slate-400 text-center max-w-md leading-relaxed">
                            {t('access_dashboard_once_approved')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <div className="flex-1">
                                <SwitchRole />
                            </div>
                            <button 
                                onClick={() => navigate(-1)} 
                                className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                {t('back')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {/* Enhanced animated background */}
            <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-teal-500/10 rounded-full blur-3xl animate-bounce slow"></div>

            {/* Enhanced Header */}
            <header className="relative z-10 flex flex-col sm:flex-row justify-between items-center mb-8 p-6 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                        <ClipboardListIcon className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            {t('staff_dashboard_title')}
                        </h1>
                        <p className="text-slate-600 mt-1 font-medium">
                            {t('welcome')}, <span className="text-indigo-600">{userProfile?.displayName || ''}</span>! 🎓
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    {!isOnline && (
                        <div className="flex items-center gap-2 text-amber-700 bg-amber-100/80 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-300/50 shadow-sm">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">{t('offline_mode')}</span>
                        </div>
                    )}
                    <SwitchRole />
                    <button 
                        onClick={() => navigate(-1)} 
                        className="px-5 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    >
                        ← {t('back')}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                <Card
                    title="Leaderboard"
                    icon={<ClipboardListIcon />}
                    variant="feature"
                    className="cursor-pointer hover:shadow-lg"
                >
                    <div className="flex flex-col gap-2">
                        <div className="text-slate-700">See the top students in every grade.</div>
                        <button
                            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition"
                            onClick={() => navigate('/dashboard/leaderboard')}
                        >
                            View Leaderboard
                        </button>
                    </div>
                </Card>
            </div>

            {/* My Sections & Role Switcher - Enhanced */}
            <Card title={t('your_section_roles')} icon={<ClipboardListIcon />} variant="primary" className="mb-8">
                {mySections.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <p className="text-slate-600 text-lg">{t('not_assigned_to_sections')}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {mySections.map(({ grade, section, isIncharge, isSubjectFaculty }) => {
                            const roles = [];
                            if (isIncharge) roles.push(t('incharge'));
                            if (isSubjectFaculty) roles.push(t('subject_teacher'));
                            const isSelected = selectedSectionId === section.id;
                            return (
                                <div key={section.id} className={`
                                    rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-[1.02]
                                    ${isSelected 
                                        ? 'border-indigo-400 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 shadow-lg' 
                                        : 'border-slate-200 bg-white/70 hover:bg-white/90 hover:shadow-md'
                                    }
                                    backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4
                                `}>
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-3 rounded-xl shadow-sm ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-lg">
                                                {t('grade')} {grade.name} - {t('section')} {section.name}
                                            </div>
                                            <div className="text-sm text-slate-600 mt-1">
                                                {t('roles')}: <span className="font-semibold text-indigo-600">{roles.join(', ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        {isIncharge && (
                                            <button
                                                className={`
                                                    px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-300 hover:scale-105
                                                    ${isSelected && selectedRole === 'incharge' 
                                                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg' 
                                                        : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
                                                    }
                                                `}
                                                onClick={() => { 
                                                    setSelectedSectionId(section.id); 
                                                    setSelectedRole('incharge'); 
                                                }}
                                            >
                                                👨‍💼 {t('incharge')}
                                            </button>
                                        )}
                                        {isSubjectFaculty && (
                                            <button
                                                className={`
                                                    px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-300 hover:scale-105
                                                    ${isSelected && selectedRole === 'subject' 
                                                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                                                        : 'bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50'
                                                    }
                                                `}
                                                onClick={() => { 
                                                    setSelectedSectionId(section.id); 
                                                    setSelectedRole('subject'); 
                                                }}
                                            >
                                                👩‍🏫 {t('subject_teacher')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Online Quiz Action Card - Enhanced */}
            <Card title="🎮 Online Quiz Center" icon={<ClipboardListIcon />} variant="feature" className="mb-8">
                <div className="text-center p-8">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Create Engaging Quizzes</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Design interactive quizzes with gamification elements to boost student engagement and learning outcomes.
                    </p>
                    <button
                        className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
                        onClick={() => navigate('/dashboard/staff/online-quiz')}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="relative flex items-center justify-center gap-3">
                            🚀 Launch Quiz Controls
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                </div>
            </Card>

            {/* Quiz Results Table - Enhanced */}
            {selectedSectionId && (
                <Card title="📊 Quiz Analytics & Results" icon={<ClipboardListIcon />} variant="success" className="mb-8">
                    {quizResultsLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center px-6 py-3 bg-blue-100 rounded-full">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-blue-700 font-medium">Loading quiz results...</span>
                            </div>
                        </div>
                    ) : quizResults.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Quiz Data Yet</h3>
                            <p className="text-slate-500">Create your first quiz to see analytics and results here!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-600 font-semibold">Total Quizzes</p>
                                            <p className="text-2xl font-bold text-blue-800">{quizResults.length}</p>
                                        </div>
                                        <div className="p-3 bg-blue-500 rounded-xl">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-600 font-semibold">Active Participants</p>
                                            <p className="text-2xl font-bold text-emerald-800">
                                                {quizResults.reduce((sum, qz) => sum + (Array.isArray(qz.participants) ? qz.participants.length : 0), 0)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-emerald-500 rounded-xl">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-600 font-semibold">Avg. Engagement</p>
                                            <p className="text-2xl font-bold text-purple-800">92%</p>
                                        </div>
                                        <div className="p-3 bg-purple-500 rounded-xl">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Quiz ID</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Scheduled</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Started</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Ended</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Participants</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Results</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {quizResults.map((qz, index) => (
                                                <tr key={qz.id} className={`hover:bg-slate-50/70 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/40'}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                </svg>
                                                            </div>
                                                            <span className="font-mono text-sm font-medium text-slate-700">{qz.id.substring(0, 8)}...</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                        {qz.scheduledAt ? (
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                {new Date(qz.scheduledAt).toLocaleDateString()}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                        {qz.startedAt ? (
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                                {new Date(qz.startedAt).toLocaleTimeString()}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                        {qz.endedAt ? (
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                                                                {new Date(qz.endedAt).toLocaleTimeString()}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {Array.isArray(qz.participants) && qz.participants.length > 0 ? (
                                                            <div className="flex items-center">
                                                                <div className="flex -space-x-2 mr-3">
                                                                    {qz.participants.slice(0, 3).map((_, i) => (
                                                                        <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                            <span className="text-xs text-white font-semibold">{i + 1}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm font-semibold text-slate-700">
                                                                    {qz.participants.length} student{qz.participants.length !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 text-sm">No participants</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {Array.isArray(qz.results) && qz.results.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {qz.results.slice(0, 3).map((r, i) => (
                                                                    <div key={i} className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-lg border border-green-200">
                                                                        <span className="text-sm font-medium text-slate-700">{r.name}</span>
                                                                        <div className="flex items-center">
                                                                            <span className="text-lg font-bold text-green-600 mr-2">{r.score}</span>
                                                                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {qz.results.length > 3 && (
                                                                    <div className="text-xs text-slate-500 text-center">
                                                                        +{qz.results.length - 3} more results
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <svg className="mx-auto w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                </svg>
                                                                <span className="text-slate-400 text-sm">No results yet</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Contextual Features Panel - Enhanced */}
            {selectedSectionId && selectedRole && (
                <div className="space-y-8">
                    {selectedRole === 'incharge' ? (
                        <Card title="👨‍💼 Class Management Center" icon={<ClipboardListIcon />} variant="warning">
                            {/* Enhanced Pending Student Requests */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                        <div className="p-2 bg-amber-100 rounded-lg mr-3">
                                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        {t('pending_student_requests', { grade: mySections.find(s => s.section.id === selectedSectionId)?.grade.name })}
                                    </h3>
                                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        {pendingStudents.filter(s => s.gradeId === mySections.find(sec => sec.section.id === selectedSectionId)?.grade.id).length} pending
                                    </div>
                                </div>
                                
                                {pendingStudents.filter(s => s.gradeId === mySections.find(sec => sec.section.id === selectedSectionId)?.grade.id).length === 0 ? (
                                    <div className="text-center py-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                                        <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h4 className="text-lg font-semibold text-green-800 mb-2">All Caught Up!</h4>
                                        <p className="text-green-600">{t('no_pending_student_requests')}</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {pendingStudents.filter(s => s.gradeId === mySections.find(sec => sec.section.id === selectedSectionId)?.grade.id).map(student => (
                                            <div key={student.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                                            <span className="text-white font-bold text-lg">
                                                                {student.displayName ? student.displayName.charAt(0).toUpperCase() : '?'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 text-lg">{student.displayName}</h4>
                                                            <p className="text-sm text-slate-600">{student.email}</p>
                                                            <div className="flex items-center mt-1">
                                                                <svg className="w-4 h-4 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="text-xs text-amber-600 font-medium">Awaiting approval</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span className="text-sm text-slate-600 font-medium">{t('assign_to_section')}</span>
                                                        </div>
                                                        <select
                                                            className="bg-white border-2 border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                            onChange={e => {
                                                                const sec = (sections[student.gradeId] || []).find(sec => sec.id === e.target.value);
                                                                if (sec) {
                                                                    handleAssignStudentToSection(student, { ...sec, gradeId: student.gradeId });
                                                                }
                                                            }}
                                                            defaultValue=""
                                                            disabled={loading}
                                                        >
                                                            <option value="" disabled>{t('select_section')}</option>
                                                            {(sections[student.gradeId] || []).map(sec => (
                                                                <option key={sec.id} value={sec.id}>{sec.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Enhanced Section Student List */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                        </div>
                                        {t('students_in_section')}
                                    </h3>
                                </div>
                                <SectionStudentList 
 
                                    schoolId={schoolId} 
                                    gradeId={mySections.find(s => s.section.id === selectedSectionId)?.grade.id} 
                                    section={mySections.find(s => s.section.id === selectedSectionId)?.section} 
                                    canManage={true} 
                                />
                            </div>
                        </Card>
                    ) : (
                        <Card title="👩‍🏫 Subject Teacher Dashboard" icon={<ClipboardListIcon />} variant="success">
                            {/* Enhanced Subject Display */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                                    <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    {t('subjects_you_teach')}
                                </h3>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {mySections.find(s => s.section.id === selectedSectionId)?.section.subjects?.filter(subj => String(subj.teacherId) === String(userId) || subj.teacherEmail === userProfile?.email).map((subj, idx) => (
                                        <div key={idx} className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-emerald-800 text-lg">{subj.name || subj.subjectName || t('subject')}</h4>
                                                    <p className="text-sm text-emerald-600">Active Subject</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Enhanced Student List (Read-only) */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                        </div>
                                        {t('students_in_section')}
                                    </h3>
                                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        Read-only View
                                    </div>
                                </div>
                                <SectionStudentList 
                                    schoolId={schoolId} 
                                    gradeId={mySections.find(s => s.section.id === selectedSectionId)?.grade.id} 
                                    section={mySections.find(s => s.section.id === selectedSectionId)?.section} 
                                    canManage={false} 
                                />
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Custom CSS Styles */}
            <style jsx>{`
                @keyframes blob {
                  0% {
                    transform: translate(0px, 0px) scale(1);
                  }
                  33% {
                    transform: translate(30px, -50px) scale(1.1);
                  }
                  66% {
                    transform: translate(-20px, 20px) scale(0.9);
                  }
                  100% {
                    transform: translate(0px, 0px) scale(1);
                  }
                }

                @keyframes float {
                  0%, 100% {
                    transform: translateY(0px);
                  }
                  50% {
                    transform: translateY(-10px);
                  }
                }

                @keyframes pulse-glow {
                  0%, 100% {
                    box-shadow: 0 0 20px rgba(79, 70, 229, 0.4);
                  }
                  50% {
                    box-shadow: 0 0 40px rgba(79, 70, 229, 0.8);
                  }
                }

                .animate-blob {
                  animation: blob 7s infinite;
                }

                .animate-float {
                  animation: float 3s ease-in-out infinite;
                }

                .animate-pulse-glow {
                  animation: pulse-glow 2s ease-in-out infinite;
                }

                .animation-delay-2000 {
                  animation-delay: 2s;
                }

                .animation-delay-4000 {
                  animation-delay: 4s;
                }

                .group:hover .group-hover\\:scale-110 {
                  transform: scale(1.1);
                }

                .group:hover .group-hover\\:translate-x-1 {
                  transform: translateX(0.25rem);
                }

                /* Enhanced card hover effects */
                .card-hover {
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .card-hover:hover {
                  transform: translateY(-4px) scale(1.02);
                  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }

                /* Interactive button effects */
                .btn-interactive {
                  position: relative;
                  overflow: hidden;
                  transition: all 0.3s ease;
                }

                .btn-interactive::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.2),
                    transparent
                  );
                  transition: left 0.5s;
                }

                .btn-interactive:hover::before {
                  left: 100%;
                }

                .btn-interactive:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }

                /* Responsive enhancements */
                @media (max-width: 768px) {
                  .mobile-stack {
                    flex-direction: column;
                    gap: 1rem;
                  }
                  
                  .mobile-full {
                    width: 100%;
                  }
                  
                  .mobile-text-center {
                    text-align: center;
                  }
                }

                /* Accessibility enhancements */
                .focus-visible:focus {
                  outline: 2px solid rgb(99, 102, 241);
                  outline-offset: 2px;
                }

                /* Reduced motion */
                @media (prefers-reduced-motion: reduce) {
                  * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                  }
                }
            `}</style>
        </div>
    );
}