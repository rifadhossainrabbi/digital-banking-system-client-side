import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface LoanRepayment {
  paymentId: string;
  amount: number;
  paymentDate: string;
  accountNumber: string;
  remainingAfter: number;
}

export interface Loan {
  _id: string;
  loanId: string;
  userId: string;
  userEmail: string;
  userName: string;
  accountNumber: string;
  loanType:
    | 'Personal Loan'
    | 'Business Loan'
    | 'Home Loan'
    | 'Education Loan'
    | 'Vehicle Loan';
  requestedAmount: number;
  interestRate: number;
  durationMonths: number;
  monthlyInstallment: number;
  monthlyIncome: number;
  employmentStatus: string;
  description: string;
  status:
    | 'Pending'
    | 'Under Review'
    | 'Approved'
    | 'Active'
    | 'Rejected'
    | 'Completed';
  remainingBalance: number;
  paidAmount: number;
  repayments: LoanRepayment[];
  approvedAt?: string;
  disbursedAt?: string;
  createdAt: string;
}

interface LoanState {
  loans: Loan[];
  isLoading: boolean;
  isApplying: boolean;
  isRepaying: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: LoanState = {
  loans: [],
  isLoading: false,
  isApplying: false,
  isRepaying: false,
  error: null,
  successMessage: null,
};

export const fetchLoans = createAsyncThunk(
  'loans/fetchLoans',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/customer/loans');
      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.error || 'Failed to fetch loans');
      }
      const data = await res.json();
      return data.loans as Loan[];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const applyForLoan = createAsyncThunk(
  'loans/applyForLoan',
  async (
    payload: {
      accountNumber: string;
      loanType: string;
      requestedAmount: number;
      durationMonths: number;
      monthlyIncome: number;
      employmentStatus: string;
      description: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/customer/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || 'Loan application failed');
      }
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const repayLoanInstallment = createAsyncThunk(
  'loans/repayLoan',
  async (
    payload: {
      loanId: string;
      accountNumber: string;
      amount: number;
      transactionPin: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/customer/loans/repay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || 'Loan repayment failed');
      }
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const loanSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    clearLoanMessages: state => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch loans
      .addCase(fetchLoans.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loans = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Apply
      .addCase(applyForLoan.pending, state => {
        state.isApplying = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(applyForLoan.fulfilled, (state, action) => {
        state.isApplying = false;
        state.loans.unshift(action.payload.loan);
        state.successMessage = 'Loan application submitted successfully.';
      })
      .addCase(applyForLoan.rejected, (state, action) => {
        state.isApplying = false;
        state.error = action.payload as string;
      })
      // Repay
      .addCase(repayLoanInstallment.pending, state => {
        state.isRepaying = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(repayLoanInstallment.fulfilled, (state, action) => {
        state.isRepaying = false;
        const idx = state.loans.findIndex(
          l => l.loanId === action.payload.loan.loanId
        );
        if (idx !== -1) {
          state.loans[idx] = action.payload.loan;
        }
        state.successMessage = 'Loan payment processed successfully.';
      })
      .addCase(repayLoanInstallment.rejected, (state, action) => {
        state.isRepaying = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLoanMessages } = loanSlice.actions;
export default loanSlice.reducer;
