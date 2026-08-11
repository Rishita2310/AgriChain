import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  isProfileLoading: true,
  
  setAuth: (token, user) => {
    localStorage.setItem('agrichain_token', token);
    set({ isAuthenticated: true, user, token, isProfileLoading: false });
  },
  
  logout: () => {
    localStorage.removeItem('agrichain_token');
    set({ isAuthenticated: false, user: null, token: null, isProfileLoading: false });
  },

  initAuth: (token, user) => {
    set({ isAuthenticated: true, token, user, isProfileLoading: false });
  },
  
  setProfileLoading: (isLoading) => {
    set({ isProfileLoading: isLoading });
  },

  updateCompletion: (percentage, status) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user };
      if (!newUser.farmer_details) {
        newUser.farmer_details = {};
      }
      newUser.farmer_details.profile_completion_percentage = percentage;
      newUser.farmer_details.profile_status = status;
      return { user: newUser };
    });
  }
}));