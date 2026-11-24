'use client';

import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Percent,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  applyForLoan,
  repayLoanInstallment,
  Loan,
} from '@/redux/slices/loanSlice';
import { fetchAccounts, BankAccount } from '@/redux/slices/accountSlice';

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
  const [selectedDisburseAccount, setSelectedDisburseAccount] = useState(
    activeAccount?.accountNumber || (accounts[0]?.accountNumber ?? '')
  );
  const [applyError, setApplyError] = useState<string | null>(null);

  // Repay Modal state
  const [repayModalLoan, setRepayModalLoan] = useState<Loan | null>(null);
  const [repayAccount, setRepayAccount] = useState(
    activeAccount?.accountNumber || (accounts[0]?.accountNumber ?? '')
  );
  const [repayAmount, setRepayAmount] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [repayError, setRepayError] = useState<string | null>(null);

  // Calculate real-time EMI for the apply modal
  const principal = Number(requestedAmount) || 0;
  const annualRate = 0.055;
  const monthlyRate = annualRate / 12;
  const calculatedEmi =
    principal > 0 && durationMonths > 0
      ? (principal *
          monthlyRate *
          Math.pow(1 + monthlyRate, durationMonths)) /
        (Math.pow(1 + monthlyRate, durationMonths) - 1)
      : 0;

  // Overview stats
  const totalRemaining = loans
    .filter(l => l.status === 'Active' || l.status === 'Approved')
    .reduce((acc, l) => acc + (l.remainingBalance || 0), 0);

  const totalPaid = loans.reduce((acc, l) => acc + (l.paidAmount || 0), 0);
  const activeCount = loans.filter(
    l => l.status === 'Active' || l.status === 'Approved'
  ).length;

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);

    if (principal < 500) {
      setApplyError('Minimum loan amount is $500.00.');
      return;
    }

    if (!selectedDisburseAccount) {
      setApplyError('Please select a disbursement bank account.');
      return;
    }

    try {
      await dispatch(
        applyForLoan({
          accountNumber: selectedDisburseAccount,
          loanType,
          requestedAmount: principal,
          durationMonths,
          monthlyIncome: Number(monthlyIncome) || 0,
          employmentStatus,
          description: description.trim() || `${loanType} Application`,
        })
      ).unwrap();

      setIsApplyModalOpen(false);
      dispatch(fetchAccounts());
    } catch (err: unknown) {
      setApplyError(typeof err === 'string' ? err : 'Loan application failed.');
    }
  };

  const handleRepaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepayError(null);

    if (!repayModalLoan) return;

    const payAmt = Number(repayAmount);
    if (isNaN(payAmt) || payAmt <= 0) {
      setRepayError('Please enter a valid repayment amount.');
      return;
    }

    if (!transactionPin || transactionPin.length < 4) {
      setRepayError('Please enter your 4-6 digit Transaction PIN (Default: 1234).');
      return;
    }

    try {
      await dispatch(
        repayLoanInstallment({
          loanId: repayModalLoan.loanId,
          accountNumber: repayAccount,
          amount: payAmt,
          transactionPin,
        })
      ).unwrap();

      setRepayModalLoan(null);
      setRepayAmount('');
      setTransactionPin('');
      dispatch(fetchAccounts());
    } catch (err: unknown) {
      setRepayError(typeof err === 'string' ? err : 'Repayment failed.');
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
            Apply for pre-approved loans, view your repayment schedule, and settle installments.
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

      {/* Global Success / Error Notices */}
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
            ${totalRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Principal + amortized interest
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

      {/* Loans List Table Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Active Loans & Credit Facilities
        </h3>
        <p className="text-xs text-slate-400">
          Detailed schedule, monthly installment, and fast payment actions.
        </p>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Loading loan facilities...
          </div>
        ) : loans.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            You do not have any active loans. Click &quot;Apply for New Loan&quot; to apply.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {loans.map((loan: Loan) => {
              const isFullyPaid = loan.status === 'Completed' || loan.remainingBalance <= 0;

              return (
                <div
                  key={loan.loanId}
                  className="rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-5 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {loan.loanId}
                        </span>
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {loan.loanType}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isFullyPaid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}
                        >
                          {isFullyPaid ? 'Completed' : loan.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {loan.description} • Term: {loan.durationMonths} Months @ {loan.interestRate}% APR
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isFullyPaid && (
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

                  {/* Financial Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">
                        Paid: ${loan.paidAmount.toLocaleString()}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        Remaining: ${loan.remainingBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (loan.paidAmount /
                                (loan.paidAmount + loan.remainingBalance || 1)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Loan Details Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white p-3 text-xs sm:grid-cols-4 dark:bg-slate-900">
                    <div>
                      <span className="text-[10px] text-slate-400">PRINCIPAL</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white">
                        ${loan.requestedAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">MONTHLY EMI</span>
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${loan.monthlyInstallment.toFixed(2)} / mo
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">DISBURSED TO</span>
                      <p className="font-mono text-slate-700 dark:text-slate-300">
                        {loan.accountNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">DISBURSED DATE</span>
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

      {/* Modal: Apply for Loan */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Apply for Credit Facility
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Instant digital loan approval with funds credited directly to your bank account.
            </p>

            {applyError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="mt-5 space-y-4 text-xs">
              {/* Loan Type */}
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Loan Type
                </label>
                <select
                  value={loanType}
                  onChange={e => setLoanType(e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-[#f1f5f9] p-3 text-xs font-semibold text-slate-900 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                >
                  <option value="Personal Loan">Personal Loan (Quick Cash)</option>
                  <option value="Business Loan">Business Expansion Loan</option>
                  <option value="Home Loan">Home Renovation / Mortgage</option>
                  <option value="Education Loan">Education / Tuition Loan</option>
                  <option value="Vehicle Loan">Auto / Vehicle Loan</option>
                </select>
              </div>

              {/* Amount and Duration */}
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
                    className="w-full rounded-xl border border-transparent bg-[#f1f5f9] p-3 font-mono font-bold text-slate-900 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Duration (Months)
                  </label>
                  <select
                    value={durationMonths}
                    onChange={e => setDurationMonths(Number(e.target.value))}
                    className="w-full rounded-xl border border-transparent bg-[#f1f5f9] p-3 font-semibold text-slate-900 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:bg-slate-800 dark:text-white"
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

              {/* Live EMI Preview Box */}
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
                  Fixed APR: 5.5% • Total Payable: ${(calculatedEmi * durationMonths).toFixed(2)}
                </p>
              </div>

              {/* Disbursement Account */}
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Disbursement Account
                </label>
                <select
                  value={selectedDisburseAccount}
                  onChange={e => setSelectedDisburseAccount(e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-[#f1f5f9] p-3 font-semibold text-slate-900 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                >
                  {accounts.map((acc: BankAccount) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountType} — {acc.accountNumber} ($
                      {acc.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Monthly Income & Employment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Monthly Income ($)
                  </label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={e => setMonthlyIncome(e.target.value)}
                    className="w-full rounded-xl border border-transparent bg-[#f1f5f9] p-3 font-mono text-slate-900 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Employment
                  </label>
                  <select
                    value={employmentStatus}
                    onChange={e => setEmploymentStatus(e.target.value)}
                    className="w-full rounded-xl border border-transparent bg-[#f1f5f9] p-3 text-slate-900 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Employed">Full-time Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Freelancer">Freelancer</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Purpose / Notes
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Home improvements, business tools"
                  className="w-full rounded-xl border border-transparent bg-[#f1f5f9] p-3 text-slate-900 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
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
                      <span>Disbursing Funds...</span>
                    </>
                  ) : (
                    <span>Confirm & Disburse</span>
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

            <form onSubmit={handleRepaySubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pay From Account
                </label>
                <select
                  value={repayAccount}
                  onChange={e => setRepayAccount(e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-[#f1f5f9] p-3 text-xs font-semibold text-slate-900 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:bg-slate-800 dark:text-white"
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
                  className="w-full rounded-xl border border-transparent bg-[#f1f5f9] p-3 font-mono font-bold text-slate-900 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:bg-slate-800 dark:text-white"
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
                    className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-10 pr-4 font-mono text-sm tracking-widest text-slate-900 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:bg-slate-800 dark:text-white"
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
