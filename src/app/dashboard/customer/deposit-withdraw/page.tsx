'use client';

import React, { useState, useEffect } from 'react';
import {
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  submitDepositWithdrawRequest,
  fetchDepositWithdrawRequests,
  DepositWithdrawRequest,
} from '@/redux/slices/transactionSlice';
import { fetchAccounts, BankAccount } from '@/redux/slices/accountSlice';

export default function CustomerDepositWithdrawPage() {
  const dispatch = useAppDispatch();
  const { accounts, activeAccount } = useAppSelector(state => state.accounts);
  const { requests, isSubmitting } = useAppSelector(
    state => state.transactions
  );

  const [activeTab, setActiveTab] = useState<'Deposit' | 'Withdrawal'>('Deposit');
  const [selectedAccount, setSelectedAccount] = useState<string>(
    activeAccount?.accountNumber || (accounts[0]?.accountNumber ?? '')
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchDepositWithdrawRequests(selectedAccount));
  }, [dispatch, selectedAccount]);

  const currentAcc = accounts.find(a => a.accountNumber === selectedAccount) || activeAccount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid amount greater than $0.',
      });
      return;
    }

    if (!selectedAccount) {
      setFeedback({
        type: 'error',
        message: 'Please select a bank account.',
      });
      return;
    }

    if (activeTab === 'Withdrawal' && currentAcc && numAmount > currentAcc.balance) {
      setFeedback({
        type: 'error',
        message: `Insufficient balance for withdrawal. Available: $${currentAcc.balance.toFixed(2)}`,
      });
      return;
    }

    try {
      const result = await dispatch(
        submitDepositWithdrawRequest({
          accountNumber: selectedAccount,
          type: activeTab,
          amount: numAmount,
          description: description.trim() || `${activeTab} Request`,
        })
      ).unwrap();

      setFeedback({
        type: 'success',
        message: result.message || `${activeTab} processed successfully.`,
      });

      setAmount('');
      setDescription('');
      dispatch(fetchAccounts());
      dispatch(fetchDepositWithdrawRequests(selectedAccount));
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message:
          typeof err === 'string'
            ? err
            : `Failed to submit ${activeTab.toLowerCase()} request.`,
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
            <Banknote className="h-3.5 w-3.5" />
            Cashier & Settlements
          </span>
          <span className="text-xs text-slate-400">Simulated Gateway</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Deposit & Withdrawal Requests
        </h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Submit electronic deposit or cash withdrawal requests directly linked to your bank accounts.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="leading-relaxed">
          <strong>Fintech Simulation Notice:</strong> In this evaluation environment, deposits and withdrawals are processed via an automated bank clearing engine with instant balance synchronization.
        </div>
      </div>

      {/* Form & Tab Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        {/* Tab Switcher */}
        <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl bg-[#f1f5f9] p-1.5 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => {
              setActiveTab('Deposit');
              setFeedback(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
              activeTab === 'Deposit'
                ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>Deposit Funds</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('Withdrawal');
              setFeedback(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
              activeTab === 'Withdrawal'
                ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-800 dark:text-rose-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Withdraw Cash</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-6 flex items-center gap-2.5 rounded-2xl p-4 text-xs font-medium ${
              feedback.type === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bank Account Selection */}
          <div>
            <label
              htmlFor="dw-account"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Select Account
            </label>
            <select
              id="dw-account"
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="w-full rounded-2xl border border-transparent bg-[#f1f5f9] p-3.5 text-xs font-semibold text-slate-900 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:text-white"
            >
              {accounts.map((acc: BankAccount) => (
                <option key={acc.accountNumber} value={acc.accountNumber}>
                  {acc.accountType} — {acc.accountNumber} (Balance: $
                  {acc.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                  )
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="dw-amount"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              {activeTab} Amount ($)
            </label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-4 text-base font-extrabold text-slate-400">
                $
              </span>
              <input
                id="dw-amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border border-transparent bg-[#f1f5f9] py-3.5 pl-9 pr-4 font-mono text-xl font-bold text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="dw-desc"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Method / Note (Optional)
            </label>
            <input
              id="dw-desc"
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={
                activeTab === 'Deposit'
                  ? 'e.g. Wire transfer, cash deposit at counter, cheque'
                  : 'e.g. Branch counter withdrawal, urgent personal cash'
              }
              className="w-full rounded-2xl border border-transparent bg-[#f1f5f9] p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-sm transition disabled:opacity-60 ${
                activeTab === 'Deposit'
                  ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400'
                  : 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing {activeTab}...</span>
                </>
              ) : (
                <span>Confirm {activeTab} Request</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Requests History Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Requests & Settlements History
        </h3>
        <p className="text-xs text-slate-400">
          Track all electronic deposit and withdrawal requests submitted for your accounts.
        </p>

        {requests.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No requests submitted yet for this account.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="pb-3 pl-2">Request ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Account</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {requests.map((req: DepositWithdrawRequest) => (
                  <tr key={req._id}>
                    <td className="py-3 pl-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {req.requestId}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          req.type === 'Deposit'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {req.type}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-600 dark:text-slate-300">
                      {req.accountNumber}
                    </td>
                    <td className="py-3 max-w-[200px] truncate text-slate-600 dark:text-slate-400">
                      {req.description}
                    </td>
                    <td className="py-3 font-mono text-slate-500">
                      {new Date(req.requestDate).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : req.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ${req.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
