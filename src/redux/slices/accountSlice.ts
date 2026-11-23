import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface BankAccount {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  accountNumber: string;
  accountType: 'Savings Account' | 'Current Account' | 'Business Account';
  balance: number;
  status: 'Active' | 'Frozen' | 'Closed';
  dailyLimit: number;
  maxSingleTransaction: number;
  minBalance: number;
  createdAt: string;
}

interface AccountState {
  accounts: BankAccount[];
  activeAccount: BankAccount | null;
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
}

const initialState: AccountState = {
  accounts: [],
  activeAccount: null,
  isLoading: false,
  error: null,
  isCreating: false,
};

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/customer/accounts');
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to fetch bank accounts');
      }
      const data = await res.json();
      return data.accounts as BankAccount[];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const createNewAccount = createAsyncThunk(
  'accounts/createNewAccount',
  async (
    payload: {
      accountType: 'Savings Account' | 'Current Account' | 'Business Account';
      initialDeposit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/customer/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || 'Failed to create new account');
      }
      return data.account as BankAccount;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setActiveAccount: (state, action: PayloadAction<BankAccount | null>) => {
      state.activeAccount = action.payload;
    },
    updateAccountBalance: (
      state,
      action: PayloadAction<{ accountNumber: string; newBalance: number }>
    ) => {
      const idx = state.accounts.findIndex(
        a => a.accountNumber === action.payload.accountNumber
      );
      if (idx !== -1) {
        state.accounts[idx].balance = action.payload.newBalance;
        if (state.activeAccount?.accountNumber === action.payload.accountNumber) {
          state.activeAccount.balance = action.payload.newBalance;
        }
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAccounts.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
        if (action.payload.length > 0 && !state.activeAccount) {
          state.activeAccount = action.payload[0];
        } else if (state.activeAccount) {
          const match = action.payload.find(
            a => a.accountNumber === state.activeAccount?.accountNumber
          );
          if (match) state.activeAccount = match;
        }
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createNewAccount.pending, state => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createNewAccount.fulfilled, (state, action) => {
        state.isCreating = false;
        state.accounts.push(action.payload);
        state.activeAccount = action.payload;
      })
      .addCase(createNewAccount.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveAccount, updateAccountBalance } = accountSlice.actions;
export default accountSlice.reducer;
