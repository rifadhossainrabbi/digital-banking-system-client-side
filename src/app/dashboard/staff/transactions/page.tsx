'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Loader2,
  X,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import {
  getStaffTransactionsAction,
  flagSuspiciousTransactionAction,
} from '@/actions/staff';

export default function StaffTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Flag Suspicious Modal
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [flagError, setFlagError] = useState('');
  const [flagSuccess, setFlagSuccess] = useState('');

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState<any>(null);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await getStaffTransactionsAction({
        search,
        type,
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        flaggedOnly,
        page,
        limit: 15,
      });
      setTransactions(res.transactions || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [search, type, status, startDate, endDate, flaggedOnly, page]);

  const handleOpenFlagModal = (txn: any) => {
    setSelectedTxn(txn);
    setFlagReason('');
    setFlagError('');
    setFlagSuccess('');
    setFlagModalOpen(true);
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn) return;
    setFlagSubmitting(true);
    setFlagError('');
    setFlagSuccess('');

    try {
      const res = await flagSuspiciousTransactionAction(
        selectedTxn.transactionId,
        flagReason
      );
      if (res.success) {
        setFlagSuccess(res.message || 'Transaction flagged successfully.');
        loadTransactions();
        setTimeout(() => setFlagModalOpen(false), 1500);
      } else {
        setFlagError(res.error || 'Failed to flag transaction.');
      }
    } catch (err: any) {
      setFlagError(err.message || 'An unexpected error occurred.');
    } finally {
      setFlagSubmitting(false);
    }
  };

  const handleViewReceipt = (txn: any) => {
    setReceiptTxn(txn);
    setReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              Transaction Oversight
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Transaction Ledger & Audit
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search transactions by ID, filter by dates and types, and flag suspicious activities for Admin review.
          </p>
        </div>

        <button
          onClick={() => setFlaggedOnly(!flaggedOnly)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-xs ${
            flaggedOnly
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          {flaggedOnly ? 'Showing Flagged Only' : 'Filter Flagged / Suspicious'}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {/* Search by Txn ID or Party */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Transaction ID (TXN-...), sender or receiver..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-700 focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200"
            >
              <option value="All">All Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Transfer">Fund Transfer</option>
              <option value="Loan Disbursement">Loan Disbursement</option>
              <option value="Loan Repayment">Loan Repayment</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs font-semibold text-slate-700 focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>
        </div>

        {/* Date Range Filtering */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Date Range:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200"
          />

          {(startDate || endDate || search || type !== 'All' || status !== 'All' || flaggedOnly) && (
            <button
              onClick={() => {
                setSearch('');
                setType('All');
                setStatus('All');
                setStartDate('');
                setEndDate('');
                setFlaggedOnly(false);
                setPage(1);
              }}
              className="ml-auto text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Sender & Receiver</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status & Flag</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-500" />
                    <span className="mt-2 block text-xs">Loading transaction records...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Receipt className="mx-auto h-8 w-8 text-slate-300" />
                    <span className="mt-2 block text-xs font-medium">No transactions match current filters</span>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr
                    key={t.transactionId}
                    className={`transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                      t.isSuspicious ? 'bg-rose-50/25 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {t.transactionId}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {t.description || 'System transaction'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        From: {t.senderName || t.senderAccount}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        To: {t.receiverName || t.receiverAccount || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          t.type === 'Deposit'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : t.type === 'Withdrawal'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : t.type === 'Transfer'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        ${(t.amount || 0).toLocaleString()}
                      </div>
                      {t.fee > 0 && (
                        <div className="text-[10px] text-slate-400">
                          Fee: ${t.fee}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            t.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : t.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}
                        >
                          {t.status}
                        </span>
                        {t.isSuspicious && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs"
                            title={t.flaggedReason || 'Suspicious activity'}
                          >
                            <ShieldAlert className="h-3 w-3" />
                            Flagged for Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewReceipt(t)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          title="View receipt"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          Receipt
                        </button>
                        {!t.isSuspicious ? (
                          <button
                            onClick={() => handleOpenFlagModal(t)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                            title="Flag suspicious transaction for Admin review"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Flag
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-rose-500">
                            Under Review
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages} ({total} transactions)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-800 dark:text-slate-300"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-800 dark:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL 1: Flag Suspicious Transaction ────────────────────────────── */}
      {flagModalOpen && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setFlagModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Flag Suspicious Activity
                  </h3>
                  <p className="text-xs text-slate-500">
                    Submit to Central Admin Compliance review queue
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFlagModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFlagSubmit} className="mt-4 space-y-4">
              {flagError && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                  {flagError}
                </div>
              )}
              {flagSuccess && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  {flagSuccess}
                </div>
              )}

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {selectedTxn.transactionId}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Amount: ${(selectedTxn.amount || 0).toLocaleString()} • Type: {selectedTxn.type}
                </div>
                <div className="text-[11px] text-slate-400">
                  Party: {selectedTxn.senderName || selectedTxn.senderAccount} → {selectedTxn.receiverName || selectedTxn.receiverAccount}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Suspicion Reason & Compliance Findings *
                </label>
                <textarea
                  rows={3}
                  required
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Detail why this transaction appears unusual, fraudulent, or requires regulatory hold..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setFlagModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={flagSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
                >
                  {flagSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: View Receipt ────────────────────────────────────────────── */}
      {receiptModalOpen && receiptTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setReceiptModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Official Banking Receipt
                  </h3>
                  <p className="text-xs text-slate-500">
                    Vaultly Branch Electronic Voucher
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                  <span className="text-slate-400">Transaction Ref</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {receiptTxn.transactionId}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Type</span>
                  <span className="font-bold">{receiptTxn.type}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Sender Account</span>
                  <span>{receiptTxn.senderAccount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Receiver Account</span>
                  <span>{receiptTxn.receiverAccount || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${(receiptTxn.amount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Status</span>
                  <span className="font-bold text-emerald-600">
                    {receiptTxn.status}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-800">
                  <span className="text-slate-400">Timestamp</span>
                  <span>{new Date(receiptTxn.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
