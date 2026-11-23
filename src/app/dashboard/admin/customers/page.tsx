'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Ban,
  CheckCircle,
  Eye,
  X,
  CreditCard,
  FileSpreadsheet,
  Receipt,
  Loader2,
} from 'lucide-react';
import {
  getAdminCustomersAction,
  getCustomerDetailsAction,
  updateCustomerStatusAction,
} from '@/actions/admin';

export default function AdminCustomersPage() {
  const [isPending, startTransition] = useTransition();
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Customer Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchCustomers = async (searchQuery = search, pageNum = page) => {
    setIsLoading(true);
    try {
      const res = await getAdminCustomersAction(searchQuery, pageNum, 20);
      setCustomers(res.customers);
      setTotal(res.total);
      setPage(res.page);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search, 1);
  };

  const handleStatusChange = (email: string, newStatus: 'Active' | 'Suspended' | 'Blocked') => {
    startTransition(async () => {
      try {
        const res = await updateCustomerStatusAction(email, newStatus);
        setFeedback(res.message);
        setTimeout(() => setFeedback(null), 3500);
        await fetchCustomers();
        if (selectedCustomer && selectedCustomer.customer.email === email) {
          setSelectedCustomer((prev: any) => ({
            ...prev,
            customer: { ...prev.customer, status: newStatus },
          }));
        }
      } catch (err: any) {
        alert(err.message || 'Failed to update status.');
      }
    });
  };

  const handleOpenDetails = async (email: string) => {
    setDetailLoading(true);
    try {
      const details = await getCustomerDetailsAction(email);
      setSelectedCustomer(details);
    } catch (err: any) {
      alert(err.message || 'Failed to load customer details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'CU';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const filteredCustomers = customers.filter(c => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Customer Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            View, audit, activate, or block banking customer accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Total Registered: {total}
          </span>
        </div>
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
            placeholder="Search by customer name, email, or phone..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Active', 'Suspended', 'Blocked'].map(tab => (
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

      {/* Customers Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-xs text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
            <span className="mt-2">Loading customer records...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No customers found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                  <th className="py-3.5 pl-6">Customer</th>
                  <th className="py-3.5">Contact</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5">KYC Verified</th>
                  <th className="py-3.5">Member Since</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredCustomers.map(cust => (
                  <tr
                    key={cust._id}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-mono text-xs font-bold text-white shadow-xs">
                          {getInitials(cust.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {cust.name}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400">
                            {cust.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {cust.phone || 'N/A'}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          cust.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : cust.status === 'Suspended'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {cust.kycVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 font-mono text-slate-500 text-[11px]">
                      {new Date(cust.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(cust.email)}
                          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Portfolio</span>
                        </button>

                        {cust.status === 'Active' ? (
                          <>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleStatusChange(cust.email, 'Suspended')}
                              className="rounded-xl border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
                            >
                              Suspend
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleStatusChange(cust.email, 'Blocked')}
                              className="rounded-xl border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                            >
                              Block
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleStatusChange(cust.email, 'Active')}
                            className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Portfolio Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-bold text-white font-mono">
                  {getInitials(selectedCustomer.customer.name)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedCustomer.customer.name}
                  </h3>
                  <p className="font-mono text-xs text-slate-400">
                    {selectedCustomer.customer.email} • {selectedCustomer.customer.phone || 'No phone'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Bank Accounts */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                  Associated Bank Accounts ({selectedCustomer.accounts.length})
                </h4>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {selectedCustomer.accounts.length === 0 ? (
                  <p className="text-xs text-slate-400">No accounts provisioned yet.</p>
                ) : (
                  selectedCustomer.accounts.map((acc: any) => (
                    <div
                      key={acc.accountNumber}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {acc.accountType}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {acc.status}
                        </span>
                      </div>
                      <div className="mt-2 font-mono text-lg font-extrabold text-slate-900 dark:text-white">
                        ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-slate-400">
                        A/C: {acc.accountNumber}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Loans */}
            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
                Credit & Loans ({selectedCustomer.loans.length})
              </h4>
              <div className="mt-3 space-y-2">
                {selectedCustomer.loans.length === 0 ? (
                  <p className="text-xs text-slate-400">No active or past loans.</p>
                ) : (
                  selectedCustomer.loans.map((loan: any) => (
                    <div
                      key={loan.loanId}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {loan.loanType} ({loan.loanId})
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Remaining: ${loan.remainingBalance?.toFixed(2)} • Monthly EMI: ${loan.monthlyInstallment?.toFixed(2)}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {loan.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Receipt className="h-4 w-4 text-rose-500" />
                Recent Financial Activity
              </h4>
              <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                {selectedCustomer.transactions.length === 0 ? (
                  <p className="text-xs text-slate-400">No transactions recorded.</p>
                ) : (
                  selectedCustomer.transactions.map((t: any) => (
                    <div key={t.transactionId} className="flex items-center justify-between py-2 text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {t.transactionId}
                        </span>
                        <p className="text-[10px] text-slate-400">{t.type} • {t.description}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
