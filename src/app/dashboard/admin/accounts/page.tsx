'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Lock,
  Unlock,
  Settings,
  X,
  Loader2,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import {
  getAdminAccountsAction,
  createBankAccountAction,
  updateBankAccountAction,
} from '@/actions/admin';

export default function AdminAccountsPage() {
  const [isPending, startTransition] = useTransition();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Create Form State
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccType, setNewAccType] = useState<'Savings Account' | 'Current Account' | 'Business Account'>('Savings Account');
  const [newAccDeposit, setNewAccDeposit] = useState('500');
  const [newAccDailyLimit, setNewAccDailyLimit] = useState('5000');
  const [newAccMaxSingle, setNewAccMaxSingle] = useState('2000');
  const [newAccMinBalance, setNewAccMinBalance] = useState('50');

  // Edit Form State
  const [editStatus, setEditStatus] = useState<'Active' | 'Frozen' | 'Closed'>('Active');
  const [editDailyLimit, setEditDailyLimit] = useState('');
  const [editMaxSingle, setEditMaxSingle] = useState('');
  const [editMinBalance, setEditMinBalance] = useState('');

  const fetchAccounts = async (searchQuery = search, status = statusFilter, pageNum = page) => {
    setIsLoading(true);
    try {
      const res = await getAdminAccountsAction(searchQuery, status, pageNum, 20);
      setAccounts(res.accounts);
      setTotal(res.total);
      setPage(res.page);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAccounts(search, statusFilter, 1);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await createBankAccountAction({
          userEmail: newAccEmail.trim(),
          accountType: newAccType,
          initialDeposit: Number(newAccDeposit) || 0,
          dailyLimit: Number(newAccDailyLimit) || 5000,
          maxSingleTransaction: Number(newAccMaxSingle) || 2000,
          minBalance: Number(newAccMinBalance) || 50,
        });
        setFeedback(res.message);
        setTimeout(() => setFeedback(null), 3500);
        setCreateModalOpen(false);
        setNewAccEmail('');
        await fetchAccounts();
      } catch (err: any) {
        alert(err.message || 'Failed to create account.');
      }
    });
  };

  const handleOpenEdit = (acc: any) => {
    setEditAccount(acc);
    setEditStatus(acc.status);
    setEditDailyLimit(String(acc.dailyLimit || 5000));
    setEditMaxSingle(String(acc.maxSingleTransaction || 2000));
    setEditMinBalance(String(acc.minBalance || 50));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount) return;
    startTransition(async () => {
      try {
        const res = await updateBankAccountAction(editAccount.accountNumber, {
          status: editStatus,
          dailyLimit: Number(editDailyLimit),
          maxSingleTransaction: Number(editMaxSingle),
          minBalance: Number(editMinBalance),
        });
        setFeedback(res.message);
        setTimeout(() => setFeedback(null), 3500);
        setEditAccount(null);
        await fetchAccounts();
      } catch (err: any) {
        alert(err.message || 'Failed to update account.');
      }
    });
  };

  const handleToggleFreeze = (accountNumber: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Frozen' ? 'Active' : 'Frozen';
    startTransition(async () => {
      try {
        const res = await updateBankAccountAction(accountNumber, { status: newStatus });
        setFeedback(res.message);
        setTimeout(() => setFeedback(null), 3500);
        await fetchAccounts();
      } catch (err: any) {
        alert(err.message || 'Failed to toggle account freeze.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Bank Account Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Provision customer accounts, freeze/unfreeze reserves, and set regulatory limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 dark:bg-rose-500 dark:text-slate-950 dark:hover:bg-rose-400"
        >
          <Plus className="h-4 w-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
          {feedback}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by account number, client name, or email..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Active', 'Frozen', 'Closed'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === tab
                  ? 'bg-rose-600 text-white shadow-xs dark:bg-rose-500 dark:text-slate-950'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-xs text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
            <span className="mt-2">Loading bank accounts...</span>
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No bank accounts found matching filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                  <th className="py-3.5 pl-6">Account Details</th>
                  <th className="py-3.5">Owner Client</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5">Daily Limit</th>
                  <th className="py-3.5">Single Limit</th>
                  <th className="py-3.5">Balance</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {accounts.map(acc => (
                  <tr
                    key={acc.accountNumber}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-slate-900 dark:text-white">
                            {acc.accountNumber}
                          </p>
                          <p className="text-[10px] text-slate-400">{acc.accountType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{acc.userName}</p>
                      <p className="font-mono text-[10px] text-slate-400">{acc.userEmail}</p>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          acc.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : acc.status === 'Frozen'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-600 dark:text-slate-300">
                      ${acc.dailyLimit?.toLocaleString() || '5,000'}
                    </td>
                    <td className="py-4 font-mono text-slate-600 dark:text-slate-300">
                      ${acc.maxSingleTransaction?.toLocaleString() || '2,000'}
                    </td>
                    <td className="py-4 font-mono font-bold text-slate-900 dark:text-white">
                      ${acc.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleFreeze(acc.accountNumber, acc.status)}
                          disabled={isPending}
                          className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-bold transition ${
                            acc.status === 'Frozen'
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {acc.status === 'Frozen' ? (
                            <>
                              <Unlock className="h-3 w-3" />
                              <span>Unfreeze</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              <span>Freeze</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(acc)}
                          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        >
                          <Settings className="h-3 w-3" />
                          <span>Limits</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Provision New Account */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Provision Customer Bank Account
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Target Customer Email
                </label>
                <input
                  type="email"
                  required
                  value={newAccEmail}
                  onChange={e => setNewAccEmail(e.target.value)}
                  placeholder="e.g. customer@vaultly.bank"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Account Type
                </label>
                <select
                  value={newAccType}
                  onChange={e => setNewAccType(e.target.value as any)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Savings Account">Savings Account (Standard)</option>
                  <option value="Current Account">Current Account (Checking)</option>
                  <option value="Business Account">Business Account (Commercial)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Opening Deposit ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newAccDeposit}
                    onChange={e => setNewAccDeposit(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Min Balance ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newAccMinBalance}
                    onChange={e => setNewAccMinBalance(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Daily Transfer Limit ($)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={newAccDailyLimit}
                    onChange={e => setNewAccDailyLimit(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Max Single Txn ($)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={newAccMaxSingle}
                    onChange={e => setNewAccMaxSingle(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {isPending ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Account Limits & Status */}
      {editAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Update Account Settings
                </h3>
                <p className="font-mono text-xs text-slate-400">
                  {editAccount.accountNumber} ({editAccount.userName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditAccount(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Active">Active (Normal Operations)</option>
                  <option value="Frozen">Frozen (Transactions Blocked)</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Daily Transfer Limit ($)
                </label>
                <input
                  type="number"
                  required
                  value={editDailyLimit}
                  onChange={e => setEditDailyLimit(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Maximum Single Transaction ($)
                </label>
                <input
                  type="number"
                  required
                  value={editMaxSingle}
                  onChange={e => setEditMaxSingle(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Minimum Required Balance ($)
                </label>
                <input
                  type="number"
                  required
                  value={editMinBalance}
                  onChange={e => setEditMinBalance(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditAccount(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
