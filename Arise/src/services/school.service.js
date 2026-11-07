import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
// Add a student to a section (by incharge faculty)
export async function addSectionStudent(schoolId, gradeId, sectionId, studentId) {
  // Only add the student ID to the section's students array
  console.log('[DEBUG] addSectionStudent called with:', { schoolId, gradeId, sectionId, studentId });
  const sectionRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId);
  const sectionSnap = await getDoc(sectionRef);
  if (!sectionSnap.exists()) {
    console.error('[DEBUG] Section not found:', { schoolId, gradeId, sectionId });
    throw new Error('Section not found');
  }
  const sectionObj = sectionSnap.data();
  console.log('[DEBUG] Section data:', sectionObj);
  let students = sectionObj.students;
  if (!Array.isArray(students)) {
    console.warn('[DEBUG] Section students array was missing or not an array. Initializing to empty array.', { sectionId, students });
    students = [];
  }
  if (!students.includes(studentId)) {
    students.push(studentId);
    console.log('[DEBUG] Updating section with new students array:', students);
    await updateDoc(sectionRef, { students });
    console.log('[DEBUG] Section students array updated successfully.');
  } else {
    console.log('[DEBUG] Student already in section students array:', studentId);
  }
}

// Get all students in a section
export async function getSectionStudents(schoolId, gradeId, sectionId) {
  const sectionRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId);
  const sectionSnap = await getDoc(sectionRef);
  if (!sectionSnap.exists()) return [];
  console.log('[DEBUG] Section data:', sectionSnap.data());
  if (!Array.isArray(sectionSnap.data().students)) {
    console.warn('[DEBUG] Section students is not an array. Returning empty array.', { sectionId, students: sectionSnap.data().students });
    return [];
  }
  return sectionSnap.data().students || [];
}
// Assign an incharge faculty (teacher) to a section
export async function setSectionIncharge(schoolId, gradeId, sectionId, inchargeUserId) {
  const sectionRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId);
  await updateDoc(sectionRef, { incharge: inchargeUserId });
}

// Get incharge faculty info for a section (returns userId)
export async function getSectionIncharge(schoolId, gradeId, sectionId) {
  const sectionRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId);
  const sectionSnap = await getDoc(sectionRef);
  if (!sectionSnap.exists()) return null;
  return sectionSnap.data().incharge || null;
}

// Create a new school
export async function createSchool(schoolData) {
  const schoolRef = await addDoc(collection(db, 'schools'), schoolData);
  return schoolRef.id;
}

// Add a user (admin/teacher) to a school's users subcollection
export async function addSchoolUser(schoolId, userId, userData) {
  const userRef = doc(db, 'schools', schoolId, 'users', userId);
  await setDoc(userRef, userData);
}

// Add a grade (class) to a school's classes subcollection
export async function addSchoolGrade(schoolId, gradeData) {
  const gradeRef = await addDoc(collection(db, 'schools', schoolId, 'grades'), gradeData);
  return gradeRef.id;
}

// Add a section to a grade
export async function addGradeSection(schoolId, gradeId, sectionData) {
  const sectionRef = await addDoc(collection(db, 'schools', schoolId, 'grades', gradeId, 'sections'), sectionData);
  return sectionRef.id;
}

// Add a subject to a section (with teacher mapping)
export async function addSectionSubject(schoolId, gradeId, sectionId, subjectData) {
  const sectionRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId);
  const sectionSnap = await getDoc(sectionRef);
  if (!sectionSnap.exists()) throw new Error('Section not found');
  const sectionObj = sectionSnap.data();
  const subjects = sectionObj.subjects || [];
  subjects.push(subjectData);
  await updateDoc(sectionRef, { subjects });
}

// Get all schools
export async function getAllSchools() {
  const schoolsSnap = await getDocs(collection(db, 'schools'));
  return schoolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all grades for a school
export async function getSchoolGrades(schoolId) {
  const gradesSnap = await getDocs(collection(db, 'schools', schoolId, 'grades'));
  return gradesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all sections for a grade
export async function getGradeSections(schoolId, gradeId) {
  const sectionsSnap = await getDocs(collection(db, 'schools', schoolId, 'grades', gradeId, 'sections'));
  return sectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all users for a school
export async function getSchoolUsers(schoolId) {
  const usersSnap = await getDocs(collection(db, 'schools', schoolId, 'users'));
  // For each user, fetch their roles subcollection (if exists)
  const users = await Promise.all(usersSnap.docs.map(async doc => {
    const baseUser = { id: doc.id, ...doc.data() };
    const rolesSnap = await getDocs(collection(db, 'schools', schoolId, 'users', doc.id, 'roles'));
    if (!rolesSnap.empty) {
      // Return an array of user-role merged objects
      return rolesSnap.docs.map(roleDoc => ({ ...baseUser, ...roleDoc.data(), roleId: roleDoc.id }));
    } else {
      // No roles, just return the user
      return baseUser;
    }
  }));
  // Flatten the array in case of users with multiple roles
  return users.flat();
}
