'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Download,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setActiveAccount,
  createNewAccount,
  BankAccount,
} from '@/redux/slices/accountSlice';

export default function CustomerAccountsPage() {
  const dispatch = useAppDispatch();
  const { accounts, activeAccount, isCreating } = useAppSelector(
    state => state.accounts
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<
    'Savings Account' | 'Current Account' | 'Business Account'
  >('Current Account');
  const [openingDeposit, setOpeningDeposit] = useState('500');
  const [formError, setFormError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleOpenAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessNotice(null);

    const depositNum = Number(openingDeposit);
    if (isNaN(depositNum) || depositNum < 50) {
      setFormError('Opening deposit must be at least $50.00.');
      return;
    }

    try {
      const result = await dispatch(
        createNewAccount({
          accountType: selectedType,
          initialDeposit: depositNum,
        })
      ).unwrap();

      setSuccessNotice(
        `Your new ${result.accountType} (${result.accountNumber}) has been provisioned successfully!`
      );
      setIsModalOpen(false);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: unknown) {
      setFormError(
        typeof err === 'string' ? err : 'Failed to create account.'
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CreditCard className="h-3.5 w-3.5" />
              Account Management
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            My Bank Accounts
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Switch between your active bank accounts, open additional accounts, and export statements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`/api/customer/statement?account=${activeAccount?.accountNumber || ''}`}
            download
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Statement</span>
          </a>

          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            <span>Open New Account</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successNotice && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Accounts List Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((acc: BankAccount) => {
          const isActive =
            activeAccount?.accountNumber === acc.accountNumber;

          return (
            <div
              key={acc.accountNumber}
              className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all ${
                isActive
                  ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20 dark:border-emerald-500/80 dark:bg-slate-900'
                  : 'border-slate-200/80 bg-white shadow-xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      acc.accountType === 'Business Account'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : acc.accountType === 'Current Account'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {acc.accountType}
                  </span>

                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {acc.status}
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-[11px] font-medium text-slate-400">
                    Available Balance
                  </p>
                  <p className="mt-1 font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
                    ${acc.balance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="mt-6 space-y-2 rounded-2xl bg-[#f8fafc] p-3.5 text-xs dark:bg-slate-950">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Number</span>
                    <span className="font-mono font-bold tracking-wider text-slate-900 dark:text-slate-200">
                      {acc.accountNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Daily Transfer Limit</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      ${(acc.dailyLimit || 5000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Min. Reserve</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      ${(acc.minBalance || 50).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-2">
                {isActive ? (
                  <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Primary Active Account</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => dispatch(setActiveAccount(acc))}
                    className="flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span>Switch to this Account</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Open New Account */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Open a New Bank Account
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Add a Current or Business account to expand your banking portfolio.
            </p>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleOpenAccount} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    ['Savings Account', 'Current Account', 'Business Account'] as const
                  ).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition ${
                        selectedType === type
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      {type.replace(' Account', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="opening-deposit"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Opening Deposit ($)
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3.5 text-sm font-bold text-slate-400">
                    $
                  </span>
                  <input
                    id="opening-deposit"
                    type="number"
                    min="50"
                    step="10"
                    value={openingDeposit}
                    onChange={e => setOpeningDeposit(e.target.value)}
                    className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-8 pr-4 text-sm font-mono text-slate-900 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Minimum required opening deposit: $50.00
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
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
