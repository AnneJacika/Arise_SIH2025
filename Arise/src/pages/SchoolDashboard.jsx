
import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
const LeaderboardPage = lazy(() => import('./LeaderboardPage'));
import { useAuth } from '../contexts/AuthContext';
import SwitchRole from '../components/SwitchRole';
import {
  addSchoolGrade,
  addGradeSection,
  addSectionSubject,
  getSchoolGrades,
  getGradeSections,
  getSchoolUsers,
  setSectionIncharge,
  addSchoolUser
} from '../services/school.service';

// --- Helper Icon Components ---
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v6m-6-3h12" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>;


// Custom leaderboard UI for school dashboard (top-level, after imports)
function SchoolLeaderboardUI() {
    const { userProfile, currentUser } = useAuth();
    const [allLeaderboards, setAllLeaderboards] = useState({});
    const [gradeNames, setGradeNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                const grades = await getSchoolGrades(userProfile.schoolId);
                const gradeNameMap = {};
                grades.forEach(g => { gradeNameMap[g.id] = g.name || g.id; });
                setGradeNames(gradeNameMap);
                const users = await getSchoolUsers(userProfile.schoolId);
                const byGrade = {};
                users.forEach(u => {
                    if (u.roleId === 'student' && u.gradeId) {
                        if (!byGrade[u.gradeId]) byGrade[u.gradeId] = [];
                        byGrade[u.gradeId].push(u);
                    }
                });
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

    if (loading) return <div className="text-center py-8 text-lg text-slate-500">Loading leaderboard...</div>;
    if (error) return <div className="text-center py-8 text-lg text-red-500">{error}</div>;
    if (Object.keys(allLeaderboards).length === 0) return <div className="text-center py-8 text-lg text-slate-400">No students found.</div>;

    return (
        <>
        {/* DEBUG: Show current schoolId and user info */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-2 mb-4 text-sm">
            <strong>Debug:</strong> schoolId: <span className="font-mono">{userProfile?.schoolId || 'none'}</span> | user: <span className="font-mono">{currentUser?.email || 'none'}</span>
        </div>
        <div className="space-y-12">
            {Object.keys(allLeaderboards).sort().map(gradeId => (
                <div key={gradeId} className="mb-8">
                    <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center drop-shadow">{getGradeLabel(gradeId)}</h2>
                    <div className="overflow-x-auto rounded-xl shadow border border-slate-100 bg-slate-50">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allLeaderboards[gradeId].map((student, idx) => (
                                    <tr key={student.id} className={student.id === userProfile.id ? 'bg-yellow-100 font-bold' : idx < 3 ? 'bg-indigo-50' : ''}>
                                        <td className="px-6 py-2">{idx + 1}</td>
                                        <td className="px-6 py-2">{student.name || student.displayName || student.firstName || 'Student'}</td>
                                        <td className="px-6 py-2">{student.points ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
        </>
    );
}

const Card = ({ title, icon, children, className }) => (
    <div className={`bg-white/60 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6 ${className}`}>
        <div className="flex items-center mb-4 text-xl font-bold text-slate-700">
            <div className="mr-3 text-indigo-500">{icon}</div>
            <h2>{title}</h2>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

function SchoolDashboard({ isOnline: propIsOnline }) {
    // ...existing code...
    // Place inchargeName logic after selectedGradeId/selectedSectionId declarations
    const { t } = useTranslation();
    const [newUser, setNewUser] = useState({
        email: '',
        name: '',
        photoURL: '',
        class: '',
        subject: '',
        schoolAddress: '',
        schoolId: '',
        uid: '',
        roles: ['staff'],
        userType: 'staff',
        approved: false
    });
    const [userAddLoading, setUserAddLoading] = useState(false);
    const [userAddError, setUserAddError] = useState('');
    const [activeSection, setActiveSection] = useState('requests');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [grades, setGrades] = useState([]);
    const [sections, setSections] = useState({});
    const [users, setUsers] = useState([]);
    const [newGrade, setNewGrade] = useState('');
    // Map gradeId to section name input
    const [newSection, setNewSection] = useState({});
    const [subjectInputs, setSubjectInputs] = useState({});
    const [inchargeInputs, setInchargeInputs] = useState({});
    const [selectedGradeId, setSelectedGradeId] = useState(null);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const { userProfile } = useAuth();
    const schoolId = userProfile?.schoolId;
    const isOnline = typeof propIsOnline === 'boolean' ? propIsOnline : useOnlineStatus();
    // Incharge name logic (must be after selectedGradeId/selectedSectionId)
    const inchargeId = selectedGradeId && selectedSectionId
        ? (sections[selectedGradeId]?.find(s => s.id === selectedSectionId)?.incharge)
        : null;
    const [inchargeName, setInchargeName] = useState('');
    useEffect(() => {
        async function fetchInchargeName() {
            if (!inchargeId || !schoolId) {
                setInchargeName('');
                return;
            }
            try {
                const { getFirestore, doc, getDoc } = await import('firebase/firestore');
                const db = getFirestore();
                const roleRef = doc(db, 'schools', schoolId, 'users', inchargeId, 'roles', 'staff');
                const roleSnap = await getDoc(roleRef);
                if (roleSnap.exists()) {
                    const roleData = roleSnap.data();
                    setInchargeName(roleData.name || '');
                } else {
                    setInchargeName('');
                }
            } catch (err) {
                setInchargeName('');
            }
        }
        fetchInchargeName();
    }, [inchargeId, schoolId]);

    // --- Caching helpers ---
    function cacheSchoolMeta(schoolId, meta) {
        if (!schoolId) return;
        try {
            localStorage.setItem(`arise-school-meta-${schoolId}`, JSON.stringify(meta));
        } catch {}
    }

    function getCachedSchoolMeta(schoolId) {
        if (!schoolId) return null;
        try {
            const data = localStorage.getItem(`arise-school-meta-${schoolId}`);
            if (data) return JSON.parse(data);
        } catch {}
        return null;
    }

    async function refreshData() {
        if (!schoolId) return;
        setLoading(true);
        const gradesList = await getSchoolGrades(schoolId);
        setGrades(gradesList);
        const allSections = {};
        for (const grade of gradesList) {
            allSections[grade.id] = await getGradeSections(schoolId, grade.id);
        }
        setSections(allSections);
        const userList = await getSchoolUsers(schoolId);
        setUsers(userList);
        // Cache for offline use
        cacheSchoolMeta(schoolId, {
            grades: gradesList,
            sections: allSections,
            users: userList
        });
        setLoading(false);
    }
    
    useEffect(() => {
        if (!schoolId) return;
        if (!isOnline) {
            // Use cached meta if offline
            const cached = getCachedSchoolMeta(schoolId);
            if (cached) {
                setGrades(cached.grades || []);
                setSections(cached.sections || {});
                setUsers(cached.users || []);
                setLoading(false);
                return;
            }
        }
        refreshData();
    }, [schoolId, isOnline]);

    async function handleLogout() {
        try {
        } catch (err) {
            // Optionally log error
            console.error('Logout error:', err);
        }
        navigate('/login');
    }

    async function handleAddUser(e) {
        e.preventDefault();
        setUserAddError('');
        // Require all fields except photoURL, class, subject, schoolAddress, uid (optional)
        if (!newUser.email || !newUser.name || !newUser.schoolId || !Array.isArray(newUser.roles) || !newUser.userType) {
            setUserAddError('Please fill all required fields.');
            return;
        }
        setUserAddLoading(true);
        const userId = newUser.email.replace(/[^a-zA-Z0-9]/g, '_');
        // Check for duplicate email (pending or approved)
        const duplicate = users.find(u => u.email === newUser.email);
        if (duplicate) {
            setUserAddError('A user with this email already exists.');
            setUserAddLoading(false);
            return;
        }
        // Save all staff attributes
        const userData = {
            ...newUser,
            approved: false,
            roles: Array.isArray(newUser.roles) ? newUser.roles : [newUser.roles],
            userType: newUser.userType || 'staff',
            schoolId: newUser.schoolId || schoolId,
        };
        await addSchoolUser(schoolId, userId, userData);
        setNewUser({
            email: '',
            name: '',
            photoURL: '',
            class: '',
            subject: '',
            schoolAddress: '',
            schoolId: '',
            uid: '',
            roles: ['staff'],
            userType: 'staff',
            approved: false
        });
        await refreshData();
        setUserAddLoading(false);
    }

    async function handleAddGrade(e) {
        console.log("Adding grade:", newGrade);
        e.preventDefault();
        if (!newGrade.trim()) return;
        setLoading(true);
        await addSchoolGrade(schoolId, { name: newGrade });
        setNewGrade('');
        await refreshData();
        setLoading(false);
    }

    async function handleAddSection(gradeId) {
        const sectionName = newSection[gradeId];
        if (!sectionName || !sectionName.trim()) return;
        setLoading(true);
        await addGradeSection(schoolId, gradeId, { name: sectionName });
        setNewSection(ns => ({ ...ns, [gradeId]: '' }));
        await refreshData();
        setLoading(false);
    }

    async function handleAddSubject(gradeId, sectionId) {
        const { subject, teacherEmail } = subjectInputs[sectionId] || {};
        if (!subject || !teacherEmail) return;
        setLoading(true);
        // Prevent duplicate subject names in this section
        const sectionSubjects = (sections[gradeId]?.find(s => s.id === sectionId)?.subjects) || [];
        if (sectionSubjects.some(subj => subj.name?.trim().toLowerCase() === subject.trim().toLowerCase())) {
            alert('Subject already exists in this section.');
            setLoading(false);
            return;
        }
        // Find teacherId from staffUsers by email
        const teacher = staffUsers.find(u => u.email === teacherEmail);
        const teacherId = teacher ? teacher.id : null;
        // Get teacher name from roles collection
        let teacherName = teacher ? teacher.name : '';
        if (teacherId && schoolId) {
            try {
                const { getFirestore, doc, getDoc } = await import('firebase/firestore');
                const db = getFirestore();
                const roleRef = doc(db, 'schools', schoolId, 'users', teacherId, 'roles', 'staff');
                const roleSnap = await getDoc(roleRef);
                if (roleSnap.exists()) {
                    const roleData = roleSnap.data();
                    if (roleData.name) teacherName = roleData.name;
                }
            } catch (err) {
                // fallback to teacher.name
            }
        }
        await addSectionSubject(schoolId, gradeId, sectionId, { name: subject, teacherEmail, teacherId, teacherName });
        setSubjectInputs(inputs => ({ ...inputs, [sectionId]: { subject: '', teacherEmail: '' } }));
        await refreshData();
        setLoading(false);
    }

    async function handleSetIncharge(gradeId, sectionId) {
        const userId = inchargeInputs[sectionId];
        if (!userId) return;
        setLoading(true);
        await setSectionIncharge(schoolId, gradeId, sectionId, userId);
        setInchargeInputs(inputs => ({ ...inputs, [sectionId]: '' }));
        await refreshData();
        setLoading(false);
    }
    
    // Only show staff who are explicitly approved in their roles collection (never at user doc level)
    const staffUsers = users.filter(u => {
        console.log(u);
        // Only consider role objects with approved true
        return u.userType === 'staff' && u.approved === true;
    });

    // Pending teacher requests: directly use userType and approved at user doc level
    const pendingTeachers = users.filter(u => {
        return (u.userType === 'staff' || u.userType === 'teacher') && u.approved !== true;
    });

    // Approve teacher request
    async function handleApproveTeacher(userId) {
        setLoading(true);
        console.log("users:", users);
        // Find the user and their roleId (from the flat user-role array)
        const userRole = users.find(u => u.id === userId && u.roleId == 'staff');
        console.log("Approving user:", userId, userRole);
        const { updateDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const { doc } = await import('firebase/firestore');
        if (userRole && userRole.roleId) {
            // Update the approved field inside the user's role document
            const { roleId } = userRole;
            const roleRef = doc(db, 'schools', schoolId, 'users', userId, 'roles', roleId);
            await updateDoc(roleRef, { approved: true });
        } else {
            // No roleId, update the user doc directly
            await updateDoc(doc(db, 'schools', schoolId, 'users', userId), { approved: true });
        }
        await refreshData();
        setLoading(false);
    }
    
    // Sidebar nav items
    const navItems = [
        { key: 'staff', label: t('school_dashboard_staff'), icon: <UserGroupIcon /> },
        { key: 'academics', label: t('school_dashboard_academics'), icon: <AcademicCapIcon /> },
        { key: 'requests', label: t('school_dashboard_requests'), icon: <UserGroupIcon /> },
        { key: 'leaderboard', label: 'Leaderboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4m-6-4a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l1.414-1.414a2 2 0 012.828 0l1.414 1.414A1 1 0 0015.414 5H18a2 2 0 012 2v12a2 2 0 01-2 2H6z" /></svg> },
    ];

    return (
        <div className="relative min-h-screen w-full bg-slate-50 flex">
            {/* Sidebar for desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-white/80 border-r border-slate-200/80 shadow-lg z-20">
                <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-200">
                    <span className="text-2xl font-bold text-indigo-700">{t('school_dashboard_title')}</span>
                </div>
                <nav className="flex-1 py-4">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => setActiveSection(item.key)}
                            className={`flex items-center w-full px-6 py-3 text-lg font-medium rounded-l-2xl transition-all ${activeSection === item.key ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50'}`}
                        >
                            <span className="mr-3">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="px-6 pb-6 mt-auto">
                                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-slate-400 rounded-lg shadow-sm hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                                </svg>
                            <span>{t('back')}</span>
                                        </button>
                </div>
            </aside>

            {/* Top nav for mobile */}
            <div className="lg:hidden fixed top-0 left-0 w-full bg-white/90 border-b border-slate-200 z-30 flex items-center justify-between px-4 py-3 shadow-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-xl bg-slate-400 text-white shadow hover:bg-slate-500 transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2">{t('back')}</span>
                    </button>
                    <span className="text-xl font-bold text-indigo-700">{t('school_dashboard_title')}</span>
                </div>
                <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-lg bg-indigo-100 text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>
            {/* Mobile sidebar drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSidebarOpen(false)}>
                    <aside className="absolute left-0 top-0 h-full w-64 bg-white/90 shadow-xl flex flex-col">
                        <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-200">
                            <span className="text-2xl font-bold text-indigo-700">{t('school_dashboard_title')}</span>
                        </div>
                        <nav className="flex-1 py-4">
                            {navItems.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
                                    className={`flex items-center w-full px-6 py-3 text-lg font-medium rounded-l-2xl transition-all ${activeSection === item.key ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50'}`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}

            {/* Main content area */}
            <div className="flex-1 min-h-screen pt-16 lg:pt-0 px-2 sm:px-4 lg:px-8 pb-8 bg-slate-50 overflow-y-auto">

                {/* Section: Staff */}
                {activeSection === 'staff' && (
                    <Card title={t('school_dashboard_staff_list')} icon={<UserGroupIcon />}>
                        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {staffUsers.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center">{t('school_dashboard_no_staff')}</p>
                            ) : (
                                staffUsers.map(u => (
                                    <li key={u.id} className="flex items-center gap-3">
                                        <UserCircleIcon />
                                        <div>
                                            <p className="font-semibold text-slate-700">{u.name || u.displayName || u.email}</p>
                                            <p className="text-sm text-slate-500">{u.email} - <span className="font-medium capitalize">{Array.isArray(u.roles) ? u.roles.map(r => typeof r === 'object' ? r.name : r).join(', ') : (typeof u.roles === 'object' ? u.roles.name : u.role)}</span></p>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </Card>
                )}

                {/* Section: Academics */}
                {activeSection === 'academics' && (
                    <Card title={t('school_dashboard_academic_management')} icon={<AcademicCapIcon />}>
                        {/* Add Grade */}
                        <form onSubmit={handleAddGrade} className="flex items-center gap-2 mb-6">
                            <input type="text" value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder={t('school_dashboard_new_grade_placeholder')} className="flex-grow bg-white border border-slate-300 rounded-lg px-4 py-2 text-base font-medium focus:ring-2 focus:ring-indigo-300 outline-none transition" disabled={loading} />
                            <button type="submit" className="flex items-center px-4 py-2 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition" disabled={loading}><PlusIcon/> {t('school_dashboard_add_grade')}</button>
                        </form>
                        {/* Drill-down navigation: Grades -> Sections -> Section Details */}
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Grades List */}
                            <div className="md:w-1/3">
                                <h3 className="text-2xl font-extrabold mb-4 text-indigo-700 tracking-wide">{t('school_dashboard_grades')}</h3>
                                <ul className="space-y-3">
                                    {grades.length === 0 && <li className="text-slate-400 text-lg">{t('school_dashboard_no_grades')}</li>}
                                    {grades.map(grade => (
                                        <li key={grade.id}>
                                            <button
                                                className={`w-full text-left px-4 py-2 rounded-lg transition font-semibold text-base border ${selectedGradeId === grade.id ? 'bg-indigo-100 border-indigo-400 text-indigo-800' : 'bg-white border-slate-300 hover:bg-indigo-50 text-slate-700'}`}
                                                onClick={() => { setSelectedGradeId(grade.id); setSelectedSectionId(null); }}
                                            >
                                                {t('grade')} {grade.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                {/* Add Section to selected grade */}
                                {selectedGradeId && (
                                    <form onSubmit={e => { e.preventDefault(); if (!newSection[selectedGradeId] || !newSection[selectedGradeId].trim()) return; handleAddSection(selectedGradeId); }} className="flex gap-2 mt-4">
                                        <input type="text" value={newSection[selectedGradeId] || ''} onChange={e => setNewSection(ns => ({ ...ns, [selectedGradeId]: e.target.value }))} placeholder={t('school_dashboard_new_section_placeholder')} className="flex-grow text-base bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-300 outline-none transition" disabled={loading} />
                                        <button type="submit" className="px-4 py-2 text-base font-semibold text-white bg-sky-600 rounded-lg shadow hover:bg-sky-700 disabled:bg-sky-300 transition" disabled={loading}>{t('school_dashboard_add_section')}</button>
                                    </form>
                                )}
                            </div>
                            {/* Sections List */}
                            <div className="md:w-1/3">
                                {selectedGradeId && (
                                    <>
                                        <h3 className="text-2xl font-extrabold mb-4 text-teal-700 tracking-wide">{t('school_dashboard_sections')}</h3>
                                        <ul className="space-y-3">
                                            {(sections[selectedGradeId] || []).length === 0 && <li className="text-slate-400 text-lg">{t('school_dashboard_no_sections')}</li>}
                                            {(sections[selectedGradeId] || []).map(section => (
                                                <li key={section.id}>
                                                    <button
                                                        className={`w-full text-left px-4 py-2 rounded-lg transition font-semibold text-base border ${selectedSectionId === section.id ? 'bg-teal-100 border-teal-400 text-teal-800' : 'bg-white border-slate-300 hover:bg-teal-50 text-slate-700'}`}
                                                        onClick={() => setSelectedSectionId(section.id)}
                                                    >
                                                        {t('section')} {section.name}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                            {/* Section Details */}
                            <div className="md:w-1/3">
                                {selectedGradeId && selectedSectionId && (
                                    <div className="bg-white rounded-xl shadow border border-slate-200 p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto min-w-0">
                                        <h3 className="text-xl font-bold text-slate-700">{t('school_dashboard_section_details')}</h3>
                                        {/* In-charge */}
                                        <div className="flex flex-col gap-2 pb-4 border-b border-slate-200">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-700">{t('incharge')}:</span>
                                                <span className="text-slate-800">
                                                    {(() => {
                                                        if (!inchargeId) return <span className="italic text-slate-400">{t('school_dashboard_not_assigned')}</span>;
                                                        if (inchargeName) return inchargeName;
                                                        const user = users.find(u => u.id === inchargeId);
                                                        return user ? (user.name || user.displayName || user.email) : inchargeId;
                                                    })()}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <select value={inchargeInputs[selectedSectionId] || ''} onChange={e => setInchargeInputs(inputs => ({ ...inputs, [selectedSectionId]: e.target.value }))} className="flex-grow text-base bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-300 outline-none transition" disabled={loading}>
                                                    <option value="">{t('school_dashboard_assign_incharge')}</option>
                                                    {staffUsers.map(u => <option key={u.id} value={u.id}>{u.displayName || u.email}</option>)}
                                                </select>
                                                <button onClick={() => handleSetIncharge(selectedGradeId, selectedSectionId)} className="px-4 py-2 text-base font-semibold text-white bg-purple-600 rounded-lg shadow hover:bg-purple-700 disabled:bg-purple-300 transition" disabled={loading || !inchargeInputs[selectedSectionId]}>{t('school_dashboard_set_incharge')}</button>
                                            </div>
                                        </div>
                                        {/* Subjects */}
                                        <div className="flex flex-col gap-2 pt-2 pb-4 border-b border-slate-200">
                                            <h5 className="font-semibold text-slate-700 text-base mb-1">{t('subjects')}</h5>
                                            <ul className="space-y-3 mb-2 break-words">
                                                {(sections[selectedGradeId]?.find(s => s.id === selectedSectionId)?.subjects || []).map((subj, idx) => {
                                                    // Prefer teacherName from subject object (from roles collection)
                                                    const teacherName = subj.teacherName || subj.teacherEmail;
                                                    return (
                                                        <li key={idx} className="flex flex-wrap items-center gap-3 bg-slate-50 rounded px-3 py-2 border border-slate-100 min-w-0">
                                                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded font-semibold break-words max-w-[10rem]">{subj.name}</span>
                                                            <span className="italic text-slate-500 break-words max-w-[12rem]">{teacherName}</span>
                                                        </li>
                                                    );
                                                })}
                                                {(sections[selectedGradeId]?.find(s => s.id === selectedSectionId)?.subjects || []).length === 0 && <li className="text-slate-400 text-base pl-2 italic">{t('school_dashboard_no_subjects')}</li>}
                                            </ul>
                                        </div>
                                        {/* Add Subject Form */}
                                        <div className="flex flex-col gap-2 pt-2">
                                            <span className="font-semibold text-slate-700 text-base mb-1">{t('school_dashboard_add_subject')}</span>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <input type="text" placeholder={t('school_dashboard_subject_name_placeholder')} value={subjectInputs[selectedSectionId]?.subject || ''} onChange={e => setSubjectInputs(inputs => ({ ...inputs, [selectedSectionId]: { ...inputs[selectedSectionId], subject: e.target.value } }))} className="flex-grow text-base bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 outline-none transition" disabled={loading} />
                                                <select value={subjectInputs[selectedSectionId]?.teacherEmail || ''} onChange={e => setSubjectInputs(inputs => ({ ...inputs, [selectedSectionId]: { ...inputs[selectedSectionId], teacherEmail: e.target.value } }))} className="flex-grow text-base bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 outline-none transition" disabled={loading}>
                                                    <option value="">{t('school_dashboard_assign_teacher')}</option>
                                                    {staffUsers.map(u => (
                                                        <option key={u.id} value={u.email}>
                                                            {(u.displayName || u.email)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button onClick={() => handleAddSubject(selectedGradeId, selectedSectionId)} className="px-4 py-2 text-base font-semibold text-white bg-green-600 rounded-lg shadow hover:bg-green-700 disabled:bg-green-300 transition" disabled={loading}>{t('school_dashboard_add_subject')}</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Section: Requests */}
                {activeSection === 'requests' && (
                    <Card title={t('school_dashboard_pending_teacher_requests')} icon={<UserGroupIcon />}>
                        {pendingTeachers.length === 0 ? (
                            <p className="text-slate-500 text-center">{t('school_dashboard_no_pending_requests')}</p>
                        ) : (
                            <ul className="space-y-3">
                                {pendingTeachers.map(u => (
                                    <li key={u.id} className="flex items-center gap-3 justify-between">
                                        <div className="flex items-center gap-3">
                                            <UserCircleIcon />
                                            <div>
                                                <p className="font-semibold text-slate-700">{u.displayName || u.email}</p>
                                                <p className="text-sm text-slate-500">{u.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleApproveTeacher(u.id)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 transition" disabled={loading}>{t('school_dashboard_approve')}</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                )}
                        </div>

                        {/* Section: Leaderboard */}
                                    {activeSection === 'leaderboard' && (
                                            <div className="w-full flex flex-col items-center justify-center py-8 px-2 sm:px-6">
                                                <div className="w-full max-w-7xl bg-white/95 rounded-3xl shadow-xl border border-slate-200 p-8">
                                                    <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-8 tracking-tight drop-shadow-lg">School Leaderboard</h1>
                                                    <Suspense fallback={<div className='text-center py-8 text-lg text-slate-500'>Loading leaderboard...</div>}>
                                                        <SchoolLeaderboardUI />
                                                    </Suspense>
                                                </div>
                                            </div>
                                    )}
                </div>
        );
}

export default SchoolDashboard;

