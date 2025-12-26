import { create } from 'zustand';
import { User } from '../types';
import { register, login, logout, getCurrentUser, getUserData, loginAnonymously } from '../services/authService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  let initTimeout: NodeJS.Timeout | null = null;
  
  // Helper function to check if user is authenticated (not anonymous)
  const isUserAuthenticated = (userData: User | null): boolean => {
    return !!userData && !!userData.email;
  };
  
  // Set up auth state listener with timeout protection
  initTimeout = setTimeout(() => {
    // If auth initialization takes too long, stop loading state
    console.warn('Firebase-Authentifizierung Timeout - Lade-Status wird auf false gesetzt');
    set({ isLoading: false });
    initTimeout = null;
  }, 5000);

  onAuthStateChanged(auth, async (firebaseUser) => {
    if (initTimeout) {
      clearTimeout(initTimeout);
      initTimeout = null;
    }
    
    if (firebaseUser) {
      try {
        const userData = await getUserData(firebaseUser.uid);
        set({ 
          user: userData, 
          isAuthenticated: isUserAuthenticated(userData),
          isLoading: false 
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    } else {
      // Automatically sign in anonymously if no user is logged in
      try {
        await loginAnonymously();
        // onAuthStateChanged will be triggered again
      } catch (error) {
        console.error('Error signing in anonymously:', error);
        // Don't block the app if anonymous login fails
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    }
  });

  return {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    login: async (email: string, password: string) => {
      try {
        set({ isLoading: true });
        await login(email, password);
        // onAuthStateChanged will be triggered automatically
      } catch (error: any) {
        set({ isLoading: false });
        throw new Error(error.message || 'Login fehlgeschlagen');
      }
    },
    register: async (email: string, password: string, name?: string) => {
      try {
        set({ isLoading: true });
        await register(email, password, name);
        // onAuthStateChanged will be triggered automatically
      } catch (error: any) {
        set({ isLoading: false });
        throw new Error(error.message || 'Registrierung fehlgeschlagen');
      }
    },
    logout: async () => {
      try {
        await logout();
        set({ user: null, isAuthenticated: false });
      } catch (error: any) {
        throw new Error(error.message || 'Logout fehlgeschlagen');
      }
    },
    checkAuth: async () => {
      set({ isLoading: true });
      try {
        const firebaseUser = await getCurrentUser();
        if (firebaseUser) {
          const userData = await getUserData(firebaseUser.uid);
          set({ 
            user: userData, 
            isAuthenticated: isUserAuthenticated(userData),
            isLoading: false 
          });
        } else {
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    },
  };
});

