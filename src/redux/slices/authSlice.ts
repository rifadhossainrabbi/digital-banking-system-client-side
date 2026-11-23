import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Bank Staff' | 'Customer';
  status: string;
  image?: string | null;
  phone?: string;
  accountType?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAuth: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setUser, setAuthLoading, setAuthError, clearAuth } =
  authSlice.actions;
export default authSlice.reducer;
