import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import accountReducer from './slices/accountSlice';
import transactionReducer from './slices/transactionSlice';
import loanReducer from './slices/loanSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountReducer,
    transactions: transactionReducer,
    loans: loanReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
