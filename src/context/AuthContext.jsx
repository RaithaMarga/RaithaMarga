import { useState, useEffect, useCallback, useRef } from 'react';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { apiRequest } from '../lib/api';
import { auth } from '../lib/firebase';
import { AuthContext } from './auth-context';

function normalizeRole(role) {
  return role?.toLowerCase() || null;
}

function getErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'An account already exists for this email. Sign in instead.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/network-request-failed': 'Could not reach Firebase. Check your internet connection and try again.',
    'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase Authentication.',
    'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account was found for this email.',
    'auth/wrong-password': 'Email or password is incorrect.',
  };

  return messages[error?.code] || error?.message || 'Authentication failed. Please try again.';
}

function roleFromProfile(data) {
  return normalizeRole(data?.role || data?.profile?.role);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const userRef = useRef(null);

  const updateUser = useCallback((nextUser) => {
    const resolvedUser = typeof nextUser === 'function' ? nextUser(userRef.current) : nextUser;
    userRef.current = resolvedUser;
    setUser(resolvedUser);
    return resolvedUser;
  }, []);

  useEffect(() => onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      updateUser(null);
      setAuthError('');
      setLoading(false);
      return;
    }

    try {
      const account = await apiRequest('/me');
      setAuthError('');
      updateUser((current) => {
        const role = roleFromProfile(account);
        if (current?.uid === firebaseUser.uid && current.role && !role) {
          return current;
        }
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: account.name || firebaseUser.displayName || '',
          role,
          profile: account.profile || null,
        };
      });
    } catch (error) {
      console.error('Could not load the signed-in account from the backend:', error);
      const currentUser = updateUser((current) => {
        if (current?.uid === firebaseUser.uid && current.role) {
          return current;
        }
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || '',
          role: null,
          profile: null,
        };
      });
      if (!currentUser?.role) {
        setAuthError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }), [updateUser]);

  const login = useCallback(async ({ email, password, rememberMe = true }) => {
    setAuthError('');
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const account = await apiRequest('/me');
      const role = roleFromProfile(account);
      if (!role) {
        throw new Error('This Firebase account has no farmer or buyer profile yet. Register to finish setting up your account.');
      }
      const userData = {
        uid: credential.user.uid,
        email: credential.user.email,
        name: account.name || credential.user.displayName || '',
        role,
        profile: account.profile || null,
      };
      updateUser(userData);
      return userData;
    } catch (error) {
      throw new Error(getErrorMessage(error), { cause: error });
    }
  }, [updateUser]);

  const register = useCallback(async ({ email, password, role, displayName, profile }) => {
    setAuthError('');
    try {
      let firebaseUser = auth.currentUser;
      if (!firebaseUser || firebaseUser.email?.toLowerCase() !== email.trim().toLowerCase()) {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        firebaseUser = credential.user;
      }

      if (displayName && firebaseUser.displayName !== displayName) {
        await updateProfile(firebaseUser, { displayName });
      }

      const endpoint = role === 'farmer' ? '/farmers/profile' : '/buyers/profile';
      const savedProfile = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(profile),
      });
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: displayName,
        role,
        profile: savedProfile,
      };
      updateUser(userData);
      return userData;
    } catch (error) {
      throw new Error(getErrorMessage(error), { cause: error });
    }
  }, [updateUser]);

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      throw new Error(getErrorMessage(error), { cause: error });
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    updateUser(null);
  }, [updateUser]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      role: user?.role,
      authError,
      login,
      register,
      resetPassword,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
