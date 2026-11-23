'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  CheckSquare,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import {
  getAdminRequestsAction,
  reviewDepositWithdrawRequestAction,
} from '@/actions/admin';

export default function AdminRequestsPage() {
  const [isPending, startTransition] = useTransition();
  const [requests, setRequests] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchRequests = async (status = statusFilter, pageNum = page) => {
    setIsLoading(true);
    try {
      const res = await getAdminRequestsAction(status, pageNum, 20);
      setRequests(res.requests);
      setTotal(res.total);
      setPage(res.page);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(statusFilter, 1);
  }, [statusFilter]);

  const handleReview = (requestId: string, status: 'Approved' | 'Rejected') => {
    startTransition(async () => {
      try {
        const res = await reviewDepositWithdrawRequestAction(requestId, status);
        setFeedback(res.message);
        setTimeout(() => setFeedback(null), 3500);
        await fetchRequests();
      } catch (err: any) {
        alert(err.message || 'Failed to update clearance request.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Deposit & Withdrawal Clearance
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Administrative queue for approving large deposits, cash requests, and wire transfers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Queue Count: {total}
          </span>
        </div>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
          {feedback}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-3xl border border-slate-200/80 bg-white p-2.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {['Pending', 'Approved', 'Rejected', 'All'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`rounded-2xl px-4 py-2 text-xs font-semibold transition ${
              statusFilter === tab
                ? 'bg-rose-600 text-white shadow-xs dark:bg-rose-500 dark:text-slate-950'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {tab} Requests
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-xs text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
            <span className="mt-2">Loading clearance queue...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No {statusFilter.toLowerCase()} clearance requests currently pending.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                  <th className="py-3.5 pl-6">Request ID</th>
                  <th className="py-3.5">Type</th>
                  <th className="py-3.5">Account & Client</th>
                  <th className="py-3.5">Description</th>
                  <th className="py-3.5">Date</th>
                  <th className="py-3.5">Amount</th>
                  <th className="py-3.5 pr-6 text-right">Approval Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {requests.map(req => {
                  const isDeposit = req.type === 'Deposit';
                  return (
                    <tr
                      key={req.requestId}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-4 pl-6 font-mono font-bold text-slate-900 dark:text-white">
                        {req.requestId}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            isDeposit
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {isDeposit ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          {req.type}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="font-mono font-bold text-slate-900 dark:text-white">
                          {req.accountNumber}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">{req.userEmail}</p>
                      </td>
                      <td className="py-4 text-slate-600 dark:text-slate-300">
                        {req.description || 'Standard transaction'}
                      </td>
                      <td className="py-4 font-mono text-slate-500 text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 font-mono font-bold text-slate-900 dark:text-white">
                        ${req.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 pr-6 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleReview(req.requestId, 'Approved')}
                              className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleReview(req.requestId, 'Rejected')}
                              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              req.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
