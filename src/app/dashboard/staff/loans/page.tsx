'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Loader2,
  X,
  Send,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  getStaffLoansAction,
  addLoanStaffNoteAction,
  forwardLoanApplicationAction,
} from '@/actions/staff';
import { useSession } from 'next-auth/react';

export default function StaffLoansPage() {
  const { data: session } = useSession();
  const staffEmail = session?.user?.email || '';

  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selected Loan for Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  // Note State
  const [newNote, setNewNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  // Forward State
  const [recommendation, setRecommendation] = useState('');
  const [forwardSubmitting, setForwardSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadLoans = async () => {
    setLoading(true);
    try {
      const res = await getStaffLoansAction({
        status,
        page,
        limit: 15,
      });
      setLoans(res.loans || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [status, page]);

  const handleOpenReview = (loan: any) => {
    setSelectedLoan(loan);
    setNewNote('');
    setRecommendation(
      loan.staffRecommendation ||
        'Verified applicant monthly income and employment documentation. Recommended for Admin loan approval.'
    );
    setActionError('');
    setActionSuccess('');
    setReviewModalOpen(true);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || !newNote.trim()) return;
    setNoteSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await addLoanStaffNoteAction(selectedLoan.loanId, newNote.trim());
      if (res.success) {
        setActionSuccess('Internal note added.');
        // Update local selectedLoan notes
        const updatedNotes = [
          ...(selectedLoan.staffNotes || []),
          {
            note: newNote.trim(),
            addedBy: staffEmail,
            addedAt: new Date(),
          },
        ];
        setSelectedLoan({ ...selectedLoan, staffNotes: updatedNotes });
        setNewNote('');
        loadLoans();
      } else {
        setActionError(res.error || 'Failed to add note.');
      }
    } catch (err: any) {
      setActionError(err.message || 'An unexpected error occurred.');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleForwardForApproval = async () => {
    if (!selectedLoan) return;

    // Security check: Staff cannot process own loan applications
    if (selectedLoan.userEmail?.toLowerCase() === staffEmail.toLowerCase()) {
      setActionError(
        'Conflict of Interest Violation: Bank Staff cannot forward or review their own loan applications.'
      );
      return;
    }

    setForwardSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await forwardLoanApplicationAction(
        selectedLoan.loanId,
        recommendation
      );
      if (res.success) {
        setActionSuccess(res.message || 'Loan application forwarded successfully.');
        loadLoans();
        setTimeout(() => setReviewModalOpen(false), 2000);
      } else {
        setActionError(res.error || 'Failed to forward application.');
      }
    } catch (err: any) {
      setActionError(err.message || 'An unexpected error occurred.');
    } finally {
      setForwardSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              Loan Assistance
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Loan Applications Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review applicant information, attach internal verification notes, and forward eligible applications to Admin for approval.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <span className="px-2 text-xs font-semibold text-slate-400">
          Filter Status:
        </span>
        {['All', 'Pending', 'Under Review', 'Approved', 'Rejected', 'Active', 'Completed'].map(
          (s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                status === s
                  ? 'bg-amber-500 text-white shadow-xs dark:bg-amber-600'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {s} {s === 'All' ? `(${total})` : ''}
            </button>
          )
        )}
      </div>

      {/* Loans Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Loan ID & Type</th>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Financial Profile</th>
                <th className="px-6 py-4">Requested</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Application Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-500" />
                    <span className="mt-2 block text-xs">Loading loan applications...</span>
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="mx-auto h-8 w-8 text-slate-300" />
                    <span className="mt-2 block text-xs font-medium">No loan applications found</span>
                  </td>
                </tr>
              ) : (
                loans.map((l) => (
                  <tr
                    key={l.loanId}
                    className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {l.loanId}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {l.loanType}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {l.userName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {l.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        Income: ${(l.monthlyIncome || 0).toLocaleString()}/mo
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Emp: {l.employmentStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        ${(l.amount || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {l.durationMonths} months • {l.interestRate || 5}% APR
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          l.status === 'Approved' || l.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : l.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : l.status === 'Under Review'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenReview(l)}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Assist & Notes
                      </button>
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
              Page {page} of {totalPages} ({total} applications)
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

      {/* ─── MODAL: Loan Review, Internal Notes & Forward to Admin ──────────── */}
      {reviewModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setReviewModalOpen(false)}
          />
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Loan Assistance: {selectedLoan.loanId}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Applicant: {selectedLoan.userName} ({selectedLoan.userEmail})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error / Success Feedback */}
            {actionError && (
              <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                {actionSuccess}
              </div>
            )}

            {/* Conflict of Interest Warning if loan belongs to this staff */}
            {selectedLoan.userEmail?.toLowerCase() === staffEmail.toLowerCase() && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold">Self-Review Restriction:</span> Per banking regulatory compliance, Staff members are strictly prohibited from reviewing, forwarding, or approving their own loan applications.
                </div>
              </div>
            )}

            <div className="mt-5 space-y-5 text-xs">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/40 sm:grid-cols-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400">Requested Amount</span>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    ${(selectedLoan.amount || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400">Duration</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {selectedLoan.durationMonths} Months
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400">Monthly Income</span>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ${(selectedLoan.monthlyIncome || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400">Employment</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {selectedLoan.employmentStatus}
                  </div>
                </div>
              </div>

              {/* Purpose / Description */}
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500">Application Reason:</span>
                <p className="mt-1 text-slate-700 dark:text-slate-300">
                  {selectedLoan.description || 'No detailed reason provided.'}
                </p>
              </div>

              {/* Existing Internal Notes History */}
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <MessageSquare className="h-4 w-4" />
                  Internal Staff Notes & Audit Trail
                </h4>
                <div className="mt-2 space-y-2">
                  {(!selectedLoan.staffNotes || selectedLoan.staffNotes.length === 0) ? (
                    <p className="rounded-xl border border-dashed border-slate-200 p-3 text-slate-400 dark:border-slate-800">
                      No internal notes recorded yet.
                    </p>
                  ) : (
                    selectedLoan.staffNotes.map((n: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40"
                      >
                        <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Added by: {n.addedBy}</span>
                          <span>•</span>
                          <span>{new Date(n.addedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Add an internal observation, salary verification note, etc..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={noteSubmitting || !newNote.trim()}
                    className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-900 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    {noteSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Post Note'
                    )}
                  </button>
                </form>
              </div>

              {/* Forward for Admin Approval Box */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Forward Application for Admin Approval
                    </h4>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                      Staff reviews customer suitability and submits formal recommendation for final disbursement approval.
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Staff Recommendation Note for Admin
                  </label>
                  <textarea
                    rows={2}
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    placeholder="Enter recommendation summary for the loan committee..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="mt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleForwardForApproval}
                    disabled={
                      forwardSubmitting ||
                      selectedLoan.userEmail?.toLowerCase() === staffEmail.toLowerCase() ||
                      selectedLoan.status === 'Approved'
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
                  >
                    {forwardSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <Send className="h-3.5 w-3.5" />
                    Forward to Admin Queue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
