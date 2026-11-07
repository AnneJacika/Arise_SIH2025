// src/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// Log out the current user
export async function logOut() {
  await signOut(auth);
}

import { getFirestore, doc, getDoc, setDoc, getDocs, collection, initializeFirestore, persistentLocalCache, memoryLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCuMsPe44bdghEH7zGUEP0H-0v9HX7lS24",
  authDomain: "arise-69e14.firebaseapp.com",
  databaseURL: "https://arise-69e14-default-rtdb.firebaseio.com",
  projectId: "arise-69e14",
  storageBucket: "arise-69e14.firebasestorage.app",
  messagingSenderId: "274996913513",
  appId: "1:274996913513:web:61466104239654258c09f8",
  measurementId: "G-8RMFB3BBSY"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  // Use persistent cache for offline support
  localCache: persistentLocalCache({
    // Default is 40 MB. You can adjust this value.
    cacheSizeBytes: 104857600, // 100 MB
  }),
});

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  return {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

// Check if user exists in any school's users subcollection
export async function checkUserExists(uid) {
  const schoolsSnap = await getDocs(collection(db, 'schools'));
  for (const schoolDoc of schoolsSnap.docs) {
    const userRef = doc(db, 'schools', schoolDoc.id, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      // Fetch all roles for this user
      const rolesSnap = await getDocs(collection(db, 'schools', schoolDoc.id, 'users', uid, 'roles'));
      const roles = {};
      for (const roleDoc of rolesSnap.docs) {
        roles[roleDoc.id] = roleDoc.data();
      }
      return { ...userSnap.data(), schoolId: schoolDoc.id, roles };
    }
  }
  return null;
}

// Create user in the correct school's users subcollection
export async function createUserInFirestore(uid, userData) {
  if (!userData.schoolId) throw new Error('schoolId is required to create user');
  const userRef = doc(db, 'schools', userData.schoolId, 'users', uid);
  await setDoc(userRef, userData);
}

// Get all schools (id and name)
export async function getSchools() {
  const schoolsSnap = await getDocs(collection(db, 'schools'));
  return schoolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
