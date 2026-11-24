'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Receipt,
  Search,
  ShieldAlert,
  RotateCcw,
  CheckCircle,
  Filter,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  getAdminTransactionsAction,
  reviewSuspiciousTransactionAction,
} from '@/actions/admin';

export default function AdminTransactionsPage() {
  const [isPending, startTransition] = useTransition();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal
  const [reviewTxn, setReviewTxn] = useState<any | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchTransactions = async (pageNum = page) => {
    setIsLoading(true);
    try {
      const res = await getAdminTransactionsAction({
        search,
        type: typeFilter,
        status: statusFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        flaggedOnly,
        page: pageNum,
        limit: 20,
      });
      setTransactions(res.transactions);
      setTotal(res.total);
      setPage(res.page);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [typeFilter, statusFilter, flaggedOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions(1);
  };

  const handleReviewAction = (action: 'Dismiss' | 'Reverse') => {
    if (!reviewTxn) return;
    startTransition(async () => {
      try {
        const res = await reviewSuspiciousTransactionAction(
          reviewTxn.transactionId,
          action,
          reviewNote.trim()
        );
        setFeedback(res.message);
        setTimeout(() => setFeedback(null), 4000);
        setReviewTxn(null);
        setReviewNote('');
        await fetchTransactions();
      } catch (err: any) {
        alert(err.message || 'Failed to review transaction.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Transactions & Security Audit
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Real-time forensic auditing, date filtering, and suspicious AML review controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Audited Records: {total}
          </span>
        </div>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
          {feedback}
        </div>
      )}

      {/* Advanced Filter Panel */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by txn ID, account, description, client name..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 pl-10 pr-4 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="All">All Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Transfer">Transfer</option>
              <option value="Loan Disbursement">Loan Disbursement</option>
              <option value="Loan Repayment">Loan Repayment</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-2 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Apply Filters</span>
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-600 dark:text-amber-400">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={e => setFlaggedOnly(e.target.checked)}
              className="h-4 w-4 rounded-md accent-rose-600"
            />
            <ShieldAlert className="h-4 w-4" />
            <span>Show Flagged Suspicious Only</span>
          </label>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-xs text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
            <span className="mt-2">Auditing records...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No transactions found matching audit filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                  <th className="py-3.5 pl-6">Transaction ID</th>
                  <th className="py-3.5">Type</th>
                  <th className="py-3.5">Sender</th>
                  <th className="py-3.5">Recipient</th>
                  <th className="py-3.5">Date</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5">Amount</th>
                  <th className="py-3.5 pr-6 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {transactions.map(txn => (
                  <tr
                    key={txn.transactionId}
                    className={`transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                      txn.isSuspicious ? 'bg-amber-50/30 dark:bg-amber-950/15' : ''
                    }`}
                  >
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-2">
                        {txn.isSuspicious && (
                          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
                        )}
                        <div>
                          <p className="font-mono font-bold text-slate-900 dark:text-white">
                            {txn.transactionId}
                          </p>
                          <p className="text-[10px] text-slate-400">{txn.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{txn.senderName}</p>
                      <p className="font-mono text-[10px] text-slate-400">{txn.senderAccount}</p>
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{txn.receiverName}</p>
                      <p className="font-mono text-[10px] text-slate-400">{txn.receiverAccount}</p>
                    </td>
                    <td className="py-4 font-mono text-slate-500 text-[11px]">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          txn.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : txn.status === 'Reversed'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-4 font-mono font-bold text-slate-900 dark:text-white">
                      ${txn.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      {txn.isSuspicious ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewTxn(txn);
                            setReviewNote(txn.adminReviewNote || '');
                          }}
                          className="flex items-center gap-1 ml-auto rounded-xl bg-amber-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-xs transition hover:bg-amber-600"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>Review Flag</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Audited</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suspicious Transaction Review Modal */}
      {reviewTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Suspicious Transaction Audit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewTxn(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/50 dark:bg-amber-950/40">
                <span className="font-bold text-amber-900 dark:text-amber-300">Flagged Reason:</span>
                <p className="mt-1 text-slate-700 dark:text-slate-300">
                  {reviewTxn.flaggedReason || 'High-value transaction or unusual velocity threshold exceeded.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400">TRANSACTION ID</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">{reviewTxn.transactionId}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400">AMOUNT</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">
                    ${reviewTxn.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Audit Review Note
                </label>
                <textarea
                  rows={2}
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  placeholder="Record justification for clearing or reversing..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReviewAction('Reverse')}
                  className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 disabled:opacity-50"
                >
                  Reverse & Freeze
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReviewAction('Dismiss')}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  Clear Flag (Normal)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
