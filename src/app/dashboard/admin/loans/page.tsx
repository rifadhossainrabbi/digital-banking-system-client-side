'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  FileSpreadsheet,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  Loader2,
  Calendar,
  User,
} from 'lucide-react';
import { getAdminLoansAction, reviewLoanAction } from '@/actions/admin';

export default function AdminLoansPage() {
  const [isPending, startTransition] = useTransition();
  const [loans, setLoans] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchLoans = async (searchQuery = search, status = statusFilter, pageNum = page) => {
    setIsLoading(true);
    try {
      const res = await getAdminLoansAction(searchQuery, status, pageNum, 20);
      setLoans(res.loans);
      setTotal(res.total);
      setPage(res.page);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLoans(search, statusFilter, 1);
  };

  const handleReviewSubmit = (decision: 'Approved' | 'Rejected') => {
    if (!selectedLoan) return;
    startTransition(async () => {
      try {
        const res = await reviewLoanAction(selectedLoan.loanId, decision, adminNote.trim());
        setFeedback(res.message);
        setTimeout(() => setFeedback(null), 4000);
        setSelectedLoan(null);
        setAdminNote('');
        await fetchLoans();
      } catch (err: any) {
        alert(err.message || 'Failed to review loan application.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Loan Management & Disbursement
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Review credit applications, evaluate debt ratios, and execute atomic fund disbursement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Applications: {total}
          </span>
        </div>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
          {feedback}
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by loan ID, customer name, email, or account number..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Pending', 'Under Review', 'Active', 'Approved', 'Rejected', 'Completed'].map(tab => (
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

      {/* Loans Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-xs text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
            <span className="mt-2">Loading loan applications...</span>
          </div>
        ) : loans.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No loan applications found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                  <th className="py-3.5 pl-6">Loan Reference</th>
                  <th className="py-3.5">Client & Account</th>
                  <th className="py-3.5">Requested Amount</th>
                  <th className="py-3.5">Term / EMI</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5">Date</th>
                  <th className="py-3.5 pr-6 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {loans.map(loan => (
                  <tr
                    key={loan.loanId}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-4 pl-6">
                      <p className="font-mono font-bold text-slate-900 dark:text-white">
                        {loan.loanId}
                      </p>
                      <p className="text-[10px] text-slate-400">{loan.loanType}</p>
                    </td>
                    <td className="py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{loan.userName}</p>
                      <p className="font-mono text-[10px] text-slate-400">
                        {loan.accountNumber} ({loan.userEmail})
                      </p>
                    </td>
                    <td className="py-4 font-mono font-extrabold text-slate-900 dark:text-white">
                      ${loan.requestedAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {loan.durationMonths} mos • ${loan.monthlyInstallment?.toFixed(2)}/mo
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          loan.status === 'Active' || loan.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : loan.status === 'Pending' || loan.status === 'Under Review'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : loan.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-500 text-[11px]">
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setAdminNote(loan.adminNote || '');
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {loan.status === 'Pending' || loan.status === 'Under Review'
                          ? 'Review & Decide'
                          : 'View Record'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Credit Application Evaluation
                </h3>
                <p className="font-mono text-xs text-slate-400">Reference: {selectedLoan.loanId}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLoan(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400">APPLICANT</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedLoan.userName}</p>
                  <p className="font-mono text-[10px] text-slate-400">{selectedLoan.userEmail}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400">CREDIT ACCOUNT</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedLoan.accountNumber}</p>
                  <p className="font-mono text-[10px] text-slate-400">Fixed Rate: {selectedLoan.interestRate || 5.5}%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400">AMOUNT</span>
                  <p className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                    ${selectedLoan.requestedAmount?.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400">MONTHLY INCOME</span>
                  <p className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                    ${selectedLoan.monthlyIncome?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-[10px] text-slate-400">MONTHLY EMI</span>
                  <p className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${selectedLoan.monthlyInstallment?.toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedLoan.description && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Purpose of Loan</span>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-300">{selectedLoan.description}</p>
                </div>
              )}

              {selectedLoan.staffNotes && selectedLoan.staffNotes.length > 0 && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 text-xs dark:border-blue-900/30 dark:bg-blue-950/20">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                    Bank Staff Internal Notes
                  </span>
                  {selectedLoan.staffNotes.map((n: any, idx: number) => (
                    <p key={idx} className="mt-1 text-slate-700 dark:text-slate-300 text-[11px]">
                      • {n.note} <span className="text-slate-400 font-mono">({n.addedBy})</span>
                    </p>
                  ))}
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Executive Admin Decision Note
                </label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Optional rationale for approval or rejection reason..."
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {(selectedLoan.status === 'Pending' || selectedLoan.status === 'Under Review') ? (
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleReviewSubmit('Rejected')}
                    className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 disabled:opacity-50"
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleReviewSubmit('Approved')}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isPending ? 'Executing Disbursement...' : 'Approve & Disburse Funds'}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  Loan Status: <span className="font-bold">{selectedLoan.status}</span> • Paid: ${selectedLoan.paidAmount || 0} • Remaining: ${selectedLoan.remainingBalance || 0}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
