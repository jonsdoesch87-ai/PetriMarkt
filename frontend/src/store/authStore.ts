import { create } from 'zustand';
import { User } from '../types';
import { register, login, logout, getCurrentUser, getUserData } from '../services/authService';
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
  // Auth State Listener einrichten
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userData = await getUserData(firebaseUser.uid);
      set({ 
        user: userData, 
        isAuthenticated: !!userData,
        isLoading: false 
      });
    } else {
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
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
        // onAuthStateChanged wird automatisch ausgelöst
      } catch (error: any) {
        set({ isLoading: false });
        throw new Error(error.message || 'Login fehlgeschlagen');
      }
    },
    register: async (email: string, password: string, name?: string) => {
      try {
        set({ isLoading: true });
        await register(email, password, name);
        // onAuthStateChanged wird automatisch ausgelöst
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
      const firebaseUser = await getCurrentUser();
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser.uid);
        set({ 
          user: userData, 
          isAuthenticated: !!userData,
          isLoading: false 
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    },
  };
});


