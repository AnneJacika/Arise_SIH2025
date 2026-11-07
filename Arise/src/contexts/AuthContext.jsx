import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { checkUserExists } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user) {
          // Wait for the profile to be fetched
          const profile = await checkUserExists(user.uid);
          setUserProfile(profile);
        } else {
          // If there's no user, clear the profile
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        setUserProfile(null); // Ensure profile is null on error
      } finally {
        // CRITICAL: Set loading to false only after all async operations are complete.
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    setUserProfile, // Expose setter for manual updates
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {/* The children won't render until loading is false, thanks to AppRoutes */}
      {children}
    </AuthContext.Provider>
  );
}