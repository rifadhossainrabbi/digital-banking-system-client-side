'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Percent,
  Calendar,
  History,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  applyForLoan,
  repayLoanInstallment,
  Loan,
} from '@/redux/slices/loanSlice';
import { fetchAccounts, BankAccount } from '@/redux/slices/accountSlice';
import { bankingApi } from '@/redux/api/bankingApi';
import toast from 'react-hot-toast';

interface ScheduleRow {
  installmentNo: number;
  dueDate: string;
  emi: number;
  principalPart: number;
  interestPart: number;
  endingBalance: number;
  status: 'Paid' | 'Upcoming';
}

export default function CustomerLoansPage() {
  const dispatch = useAppDispatch();
  const { loans, isLoading, isApplying, isRepaying, successMessage } =
    useAppSelector(state => state.loans);
  const { accounts, activeAccount } = useAppSelector(state => state.accounts);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [loanType, setLoanType] = useState('Personal Loan');
  const [requestedAmount, setRequestedAmount] = useState('10000');
  const [durationMonths, setDurationMonths] = useState(24);
  const [monthlyIncome, setMonthlyIncome] = useState('5000');
  const [employmentStatus, setEmploymentStatus] = useState('Employed');
  const [description, setDescription] = useState('');
  const [selectedDisburseAccount, setSelectedDisburseAccount] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);

  // Repay Modal state
  const [repayModalLoan, setRepayModalLoan] = useState<Loan | null>(null);
  const [repayAccount, setRepayAccount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [repayError, setRepayError] = useState<string | null>(null);

  // Schedule & History Modal state
  const [detailsLoan, setDetailsLoan] = useState<Loan | null>(null);
  const [detailsTab, setDetailsTab] = useState<'schedule' | 'history'>(
    'schedule',
  );

  const effectiveDisburseAccount =
    selectedDisburseAccount ||
    activeAccount?.accountNumber ||
    accounts[0]?.accountNumber ||
    '';
  const effectiveRepayAccount =
    repayAccount ||
    activeAccount?.accountNumber ||
    accounts[0]?.accountNumber ||
    '';

  const principal = Number(requestedAmount) || 0;
  const annualRate = 0.055;
  const monthlyRate = annualRate / 12;
  const calculatedEmi =
    principal > 0 && durationMonths > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
        (Math.pow(1 + monthlyRate, durationMonths) - 1)
      : 0;

  const totalRemaining = loans
    .filter(l => l.status === 'Active' || l.status === 'Approved')
    .reduce((acc, l) => acc + (l.remainingBalance || 0), 0);

  const totalPaid = loans.reduce((acc, l) => acc + (l.paidAmount || 0), 0);
  const activeCount = loans.filter(
    l => l.status === 'Active' || l.status === 'Approved',
  ).length;

  // Build Amortization Schedule for detailsLoan
  const repaymentSchedule = useMemo<ScheduleRow[]>(() => {
    if (!detailsLoan) return [];
    const rows: ScheduleRow[] = [];
    const P = Number(detailsLoan.requestedAmount) || 0;
    const months = Number(detailsLoan.durationMonths) || 12;
    const rate = (Number(detailsLoan.interestRate) || 5.5) / 100 / 12;
    const emi = Number(detailsLoan.monthlyInstallment) || P / months;
    const baseDate = new Date(detailsLoan.disbursedAt || detailsLoan.createdAt);

    let balance = P;
    const paidInstallmentsCount = Math.floor(
      (detailsLoan.paidAmount || 0) / (emi || 1),
    );

    for (let i = 1; i <= months; i++) {
      const interestPart = balance * rate;
      let principalPart = emi - interestPart;
      if (i === months || principalPart > balance) {
        principalPart = balance;
      }
      balance = Math.max(0, balance - principalPart);

      const due = new Date(baseDate);
      due.setMonth(due.getMonth() + i);

      rows.push({
        installmentNo: i,
        dueDate: due.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        }),
        emi: Math.round((principalPart + interestPart) * 100) / 100,
        principalPart: Math.round(principalPart * 100) / 100,
        interestPart: Math.round(interestPart * 100) / 100,
        endingBalance: Math.round(balance * 100) / 100,
        status:
          detailsLoan.status === 'Completed' || i <= paidInstallmentsCount
            ? 'Paid'
            : 'Upcoming',
      });
    }
    return rows;
  }, [detailsLoan]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);

    if (principal < 500 || principal > 200000) {
      setApplyError('Loan amount must be between $500 and $200,000.');
      return;
    }

    if (!effectiveDisburseAccount) {
      setApplyError('Please select a disbursement bank account.');
      return;
    }

    try {
      await dispatch(
        applyForLoan({
          accountNumber: effectiveDisburseAccount,
          loanType,
          requestedAmount: principal,
          durationMonths,
          monthlyIncome: Number(monthlyIncome) || 0,
          employmentStatus,
          description: description.trim() || `${loanType} Application`,
        }),
      ).unwrap();

      setIsApplyModalOpen(false);
      setDescription('');
      toast.success(
        `Loan application for $${principal.toLocaleString()} submitted for Staff & Admin review!`,
      );
      dispatch(fetchAccounts());
      dispatch(bankingApi.util.invalidateTags(['Notifications', 'Loans']));
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : 'Loan application failed.';
      setApplyError(msg);
      toast.error(msg);
    }
  };

  const handleRepaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepayError(null);

    if (!repayModalLoan) return;

    const payAmt = Number(repayAmount);
    if (isNaN(payAmt) || payAmt <= 0) {
      const msg = 'Please enter a valid repayment amount.';
      setRepayError(msg);
      toast.error(msg);
      return;
    }

    if (!transactionPin || transactionPin.length < 4) {
      const msg =
        'Please enter your 4-6 digit Transaction PIN (Default: 1234).';
      setRepayError(msg);
      toast.error(msg);
      return;
    }

    try {
      await dispatch(
        repayLoanInstallment({
          loanId: repayModalLoan.loanId,
          accountNumber: effectiveRepayAccount,
          amount: payAmt,
          transactionPin,
        }),
      ).unwrap();

      toast.success(
        `Repayment of $${payAmt.toFixed(2)} completed successfully!`,
      );
      setRepayModalLoan(null);
      setRepayAmount('');
      setTransactionPin('');
      dispatch(fetchAccounts());
      dispatch(
        bankingApi.util.invalidateTags([
          'Notifications',
          'Transactions',
          'Loans',
        ]),
      );
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : 'Repayment failed.';
      setRepayError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Percent className="h-3.5 w-3.5" />
              Low Rate Credit Facility (5.5% Fixed APR)
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Loans & Credit Facility
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Apply for loans, inspect your amortization schedule, track repayment
            history, and pay installments.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              setApplyError(null);
              setIsApplyModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            <span>Apply for New Loan</span>
          </button>
        </div>
      </div>

      {/* Global Success Notice */}
      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Loans
          </span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {activeCount}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Total active facilities in good standing
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Remaining Debt Balance
          </span>
          <div className="mt-2 font-mono text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            $
            {totalRemaining.toLocaleString('en-US', {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Principal + amortized balance
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Repaid Amount
          </span>
          <div className="mt-2 font-mono text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Completed installment payments
          </p>
        </div>
      </div>

      {/* Loans List Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          My Loan Applications & Credit Facilities
        </h3>
        <p className="text-xs text-slate-400">
          View application status, repayment schedule, payment history, and
          settle installments.
        </p>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Loading loan facilities...
          </div>
        ) : loans.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            You do not have any loans yet. Click &quot;Apply for New Loan&quot;
            to apply.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {loans.map((loan: Loan) => {
              const isActiveRepayable =
                (loan.status === 'Active' || loan.status === 'Approved') &&
                loan.remainingBalance > 0;
              const isCompleted =
                loan.status === 'Completed' ||
                ((loan.status === 'Active' || loan.status === 'Approved') &&
                  loan.remainingBalance <= 0);

              return (
                <div
                  key={loan.loanId}
                  className="rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-5 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {loan.loanId}
                        </span>
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {loan.loanType}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isCompleted ||
                            loan.status === 'Active' ||
                            loan.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : loan.status === 'Pending' ||
                                  loan.status === 'Under Review'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                          }`}
                        >
                          {isCompleted ? 'Completed' : loan.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {loan.description} • Term: {loan.durationMonths} Months
                        @ {loan.interestRate}% APR
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDetailsLoan(loan);
                          setDetailsTab('schedule');
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Schedule & History</span>
                      </button>

                      {isActiveRepayable && (
                        <button
                          type="button"
                          onClick={() => {
                            setRepayError(null);
                            setRepayAmount(loan.monthlyInstallment.toString());
                            setRepayModalLoan(loan);
                          }}
                          className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950"
                        >
                          Pay Installment
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Financial Progress Bar (for Active / Approved / Completed loans) */}
                  {(loan.status === 'Active' ||
                    loan.status === 'Approved' ||
                    loan.status === 'Completed') && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">
                          Paid: ${(loan.paidAmount || 0).toLocaleString()}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Remaining: $
                          {(loan.remainingBalance || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                ((loan.paidAmount || 0) /
                                  ((loan.paidAmount || 0) +
                                    (loan.remainingBalance || 0) || 1)) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Loan Details Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white p-3 text-xs sm:grid-cols-4 dark:bg-slate-900">
                    <div>
                      <span className="text-[10px] text-slate-400">
                        PRINCIPAL
                      </span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white">
                        ${(loan.requestedAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">
                        MONTHLY EMI
                      </span>
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${(loan.monthlyInstallment || 0).toFixed(2)} / mo
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">
                        TARGET ACCOUNT
                      </span>
                      <p className="font-mono text-slate-700 dark:text-slate-300">
                        {loan.accountNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">
                        APPLIED DATE
                      </span>
                      <p className="font-mono text-slate-700 dark:text-slate-300">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Repayment Schedule & Repayment History */}
      {detailsLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {detailsLoan.loanType} — {detailsLoan.loanId}
                </h3>
                <p className="text-xs text-slate-400">
                  Principal: $
                  {(detailsLoan.requestedAmount || 0).toLocaleString()} •{' '}
                  {detailsLoan.durationMonths} Months @{' '}
                  {detailsLoan.interestRate || 5.5}% APR
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsLoan(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setDetailsTab('schedule')}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                  detailsTab === 'schedule'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Repayment Schedule ({repaymentSchedule.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailsTab('history')}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                  detailsTab === 'history'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>
                  Repayment History ({detailsLoan.repayments?.length || 0})
                </span>
              </button>
            </div>

            {detailsTab === 'schedule' ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                      <th className="py-2.5">#</th>
                      <th className="py-2.5">Due Date</th>
                      <th className="py-2.5">EMI</th>
                      <th className="py-2.5">Principal</th>
                      <th className="py-2.5">Interest</th>
                      <th className="py-2.5">Balance</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {repaymentSchedule.map(row => (
                      <tr key={row.installmentNo}>
                        <td className="py-2.5 font-mono font-bold">
                          {row.installmentNo}
                        </td>
                        <td className="py-2.5 font-mono text-slate-500">
                          {row.dueDate}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                          ${row.emi.toFixed(2)}
                        </td>
                        <td className="py-2.5 font-mono text-slate-600 dark:text-slate-300">
                          ${row.principalPart.toFixed(2)}
                        </td>
                        <td className="py-2.5 font-mono text-slate-500">
                          ${row.interestPart.toFixed(2)}
                        </td>
                        <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300">
                          ${row.endingBalance.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              row.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4">
                {!detailsLoan.repayments ||
                detailsLoan.repayments.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    No installments have been repaid yet for this loan.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {detailsLoan.repayments.map(rep => (
                      <div
                        key={rep.paymentId}
                        className="flex items-center justify-between py-3 text-xs"
                      >
                        <div>
                          <p className="font-mono font-bold text-slate-900 dark:text-white">
                            {rep.paymentId}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Paid from A/C {rep.accountNumber} •{' '}
                            {new Date(rep.paymentDate).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            -${rep.amount.toFixed(2)}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            Rem: ${rep.remainingAfter.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Apply for Loan */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Apply for Credit Facility
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Submit your loan application for Bank Staff & Admin review. Upon
              approval, funds are disbursed directly to your account.
            </p>

            {applyError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <form
              onSubmit={handleApplySubmit}
              className="mt-5 space-y-4 text-xs"
            >
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Loan Type
                </label>
                <select
                  value={loanType}
                  onChange={e => setLoanType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-semibold text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="Personal Loan">
                    Personal Loan (Quick Cash)
                  </option>
                  <option value="Business Loan">Business Expansion Loan</option>
                  <option value="Home Loan">Home Renovation / Mortgage</option>
                  <option value="Education Loan">
                    Education / Tuition Loan
                  </option>
                  <option value="Vehicle Loan">Auto / Vehicle Loan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Loan Amount ($)
                  </label>
                  <input
                    type="number"
                    min="500"
                    max="200000"
                    step="500"
                    value={requestedAmount}
                    onChange={e => setRequestedAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono font-bold text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Duration (Months)
                  </label>
                  <select
                    value={durationMonths}
                    onChange={e => setDurationMonths(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 font-semibold text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                    <option value={24}>24 Months</option>
                    <option value={36}>36 Months</option>
                    <option value={48}>48 Months</option>
                    <option value={60}>60 Months</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                    Calculated Monthly Installment (EMI)
                  </span>
                  <span className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                    ${calculatedEmi.toFixed(2)} / month
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  Fixed APR: 5.5% • Total Payable: $
                  {(calculatedEmi * durationMonths).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Disbursement Account
                </label>
                <select
                  value={effectiveDisburseAccount}
                  onChange={e => setSelectedDisburseAccount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 font-semibold text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {accounts.map((acc: BankAccount) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountType} — {acc.accountNumber} ($
                      {acc.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Monthly Income ($)
                  </label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={e => setMonthlyIncome(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Employment
                  </label>
                  <select
                    value={employmentStatus}
                    onChange={e => setEmploymentStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="Employed">Full-time Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Freelancer">Freelancer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Purpose / Notes
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Home improvements, business tools"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Loan Application</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Loan Installment */}
      {repayModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Pay Loan Installment
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Facility: {repayModalLoan.loanId} ({repayModalLoan.loanType})
            </p>

            {repayError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{repayError}</span>
              </div>
            )}

            <form
              onSubmit={handleRepaySubmit}
              className="mt-5 space-y-4 text-xs"
            >
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pay From Account
                </label>
                <select
                  value={effectiveRepayAccount}
                  onChange={e => setRepayAccount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-semibold text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {accounts.map((acc: BankAccount) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountType} — {acc.accountNumber} (Balance: $
                      {acc.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Repayment Amount ($)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={repayAmount}
                  onChange={e => setRepayAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono font-bold text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Remaining Debt: ${repayModalLoan.remainingBalance.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Transaction PIN
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    maxLength={6}
                    value={transactionPin}
                    onChange={e =>
                      setTransactionPin(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="Enter 4-6 digit PIN (Default: 1234)"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 font-mono text-sm tracking-widest text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setRepayModalLoan(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRepaying}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                >
                  {isRepaying ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Settle Installment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
