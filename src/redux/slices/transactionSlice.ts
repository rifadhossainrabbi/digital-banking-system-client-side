import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Transaction {
  _id: string;
  transactionId: string;
  senderAccount: string;
  senderName: string;
  senderEmail: string;
  receiverAccount: string;
  receiverName: string;
  receiverEmail: string;
  type:
    | 'Transfer'
    | 'Deposit'
    | 'Withdrawal'
    | 'Loan Disbursement'
    | 'Loan Repayment';
  amount: number;
  fee: number;
  status: 'Completed' | 'Pending' | 'Failed' | 'Reversed';
  description: string;
  createdAt: string;
}

export interface DepositWithdrawRequest {
  _id: string;
  requestId: string;
  accountNumber: string;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  description: string;
  requestDate: string;
  reviewedAt?: string;
  notes?: string;
}

interface TransactionState {
  transactions: Transaction[];
  requests: DepositWithdrawRequest[];
  totalTransactions: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastTransferSuccess: Transaction | null;
}

const initialState: TransactionState = {
  transactions: [],
  requests: [],
  totalTransactions: 0,
  isLoading: false,
  isSubmitting: false,
  error: null,
  lastTransferSuccess: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (
    params:
      | {
          accountNumber?: string;
          type?: string;
          search?: string;
          page?: number;
          limit?: number;
        }
      | undefined,
    { rejectWithValue }
  ) => {
    try {
      const query = new URLSearchParams();
      if (params?.accountNumber) query.set('account', params.accountNumber);
      if (params?.type && params.type !== 'All') query.set('type', params.type);
      if (params?.search) query.set('search', params.search);
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());

      const res = await fetch(`/api/customer/transactions?${query.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to fetch transactions');
      }
      return await res.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const executeFundTransfer = createAsyncThunk(
  'transactions/executeFundTransfer',
  async (
    payload: {
      senderAccount: string;
      recipientAccount: string;
      amount: number;
      description: string;
      transactionPin: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/customer/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || 'Transfer failed');
      }
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const fetchDepositWithdrawRequests = createAsyncThunk(
  'transactions/fetchRequests',
  async (accountNumber: string | undefined, { rejectWithValue }) => {
    try {
      const query = accountNumber ? `?account=${accountNumber}` : '';
      const res = await fetch(`/api/customer/deposit-withdraw${query}`);
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to fetch requests');
      }
      const data = await res.json();
      return data.requests as DepositWithdrawRequest[];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const submitDepositWithdrawRequest = createAsyncThunk(
  'transactions/submitRequest',
  async (
    payload: {
      accountNumber: string;
      type: 'Deposit' | 'Withdrawal';
      amount: number;
      description: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/customer/deposit-withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || 'Failed to submit request');
      }
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearLastTransfer: state => {
      state.lastTransferSuccess = null;
    },
    clearTransactionError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.totalTransactions = action.payload.total;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Transfer
      .addCase(executeFundTransfer.pending, state => {
        state.isSubmitting = true;
        state.error = null;
        state.lastTransferSuccess = null;
      })
      .addCase(executeFundTransfer.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.lastTransferSuccess = action.payload.transaction;
        state.transactions.unshift(action.payload.transaction);
      })
      .addCase(executeFundTransfer.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Fetch Requests
      .addCase(fetchDepositWithdrawRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      // Submit Request
      .addCase(submitDepositWithdrawRequest.pending, state => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitDepositWithdrawRequest.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload.request) {
          state.requests.unshift(action.payload.request);
        }
      })
      .addCase(submitDepositWithdrawRequest.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLastTransfer, clearTransactionError } =
  transactionSlice.actions;
export default transactionSlice.reducer;
