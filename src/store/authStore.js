// src/store/authStore.js
import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode';
import { api } from '../services/api'
import { toast } from 'react-toastify';

// Helper to get user data from token
const setUserFromToken = (token) => {
  if (!token) {
    return { user: null, isAuthenticated: false };
  }
  try {
    const decodedUser = jwtDecode(token);
    console.log(decodedUser)
    // Check if token is expired
    if (decodedUser.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return { user: null, isAuthenticated: false };
    }
    return { user: decodedUser, isAuthenticated: true };
  } catch (error) {
    localStorage.removeItem('token');
    return { user: null, isAuthenticated: false };
  }
};

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Initialize store on app load
  initializeAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      const { user, isAuthenticated } = setUserFromToken(token);
      set({ user, isAuthenticated });
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null })
      const response = await api.post('/auth/login', credentials)
      const { token } = response.data

      localStorage.setItem('token', token)
      const { user, isAuthenticated } = setUserFromToken(token);
      set({ user, isAuthenticated, isLoading: false, error: null });

      toast.success('Logged in successfully')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to login'
      set({ error: message, isLoading: false })
      toast.error(message)
      return false
    }
  },

  completeInvitation: async (invitationData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/complete-invitation', invitationData);
      const { token } = response.data;

      localStorage.setItem('token', token);
      const { user, isAuthenticated } = setUserFromToken(token);
      set({ user, isAuthenticated, isLoading: false, error: null });

      toast.success('Account activated successfully! Welcome.');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to activate account.';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  // Note: Register does not log the user in, so no change needed here.
  register: async (userData) => {
    try {
      set({ isLoading: true, error: null })
      await api.post('/auth/register', userData)

      toast.success('Registration successful! Please login.')
      set({ isLoading: false })
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      set({ error: message, isLoading: false })
      toast.error(message)
      return false
    }
  },

  // Note: fetchUser is now less critical, but we keep it for potential legacy use.
  fetchUser: async () => {
    const token = localStorage.getItem('token');
    if (!token || get().isAuthenticated) {
      set({ isLoading: false });
      return;
    }
    // Re-validate and set user from token on reload
    const { user, isAuthenticated } = setUserFromToken(token);
    set({ user, isAuthenticated });
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false })
    toast.success('Logged out successfully')
  },
  
  // --- THE NEW PERMISSION CHECKER ---
  hasPermission: (requiredPermission) => {
    const { user } = get();
    if (!user || !Array.isArray(user.permissions)) {
      return false;
    }
    // If no specific permission is required, grant access (for public links).
    if (!requiredPermission) {
      return true;
    }
    return user.permissions.includes(requiredPermission);
  },
  // --- END PERMISSION CHECKER ---

  hasRole: (roles) => {
    const { user } = get()
    if (!user) return false
    if (!roles || roles.length === 0) return true
    return roles.includes(user.role)
  }
}));

// Initialize auth state on first load
useAuthStore.getState().initializeAuth();