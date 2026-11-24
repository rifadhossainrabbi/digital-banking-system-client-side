'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  X,
  Phone,
  Mail,
  Building,
  KeyRound,
} from 'lucide-react';
import {
  getStaffCustomersAction,
  getStaffCustomerDetailsAction,
  registerCustomerAction,
  verifyCustomerKYCAction,
  createCustomerAccountAction,
} from '@/actions/staff';

export default function StaffCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Selected customer for account opening or details
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Forms state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    transactionPin: '',
  });
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const [accountForm, setAccountForm] = useState({
    userEmail: '',
    accountType: 'Savings Account' as 'Savings Account' | 'Current Account' | 'Business Account',
    initialDeposit: 100,
  });
  const [accountSubmitting, setAccountSubmitting] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  const [kycNotes, setKycNotes] = useState('');
  const [kycUpdating, setKycUpdating] = useState(false);

  // Fetch customers
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await getStaffCustomersAction({
        search,
        kycFilter,
        page,
        limit: 15,
      });
      setCustomers(res.customers || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, kycFilter, page]);

  // Open Details Modal
  const handleViewDetails = async (email: string) => {
    setDetailsModalOpen(true);
    setDetailsLoading(true);
    try {
      const res = await getStaffCustomerDetailsAction(email);
      if (res.success) {
        setCustomerDetails(res);
        setKycNotes(res.customer?.verificationNotes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Open Create Account Modal
  const handleOpenAccountModal = (cust: any) => {
    setSelectedCustomer(cust);
    setAccountForm({
      userEmail: cust.email,
      accountType: 'Savings Account',
      initialDeposit: 100,
    });
    setAccountError('');
    setAccountSuccess('');
    setAccountModalOpen(true);
  };

  // Submit Register Customer
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterSubmitting(true);
    setRegisterError('');
    setRegisterSuccess('');

    try {
      const res = await registerCustomerAction(registerForm);
      if (res.success) {
        setRegisterSuccess('Customer registered successfully!');
        setRegisterForm({ name: '', email: '', phone: '', password: '', transactionPin: '' });
        loadCustomers();
        setTimeout(() => setRegisterModalOpen(false), 1500);
      } else {
        setRegisterError(res.error || 'Failed to register customer.');
      }
    } catch (err: any) {
      setRegisterError(err.message || 'An unexpected error occurred.');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  // Submit Create Customer Bank Account
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSubmitting(true);
    setAccountError('');
    setAccountSuccess('');

    try {
      const res = await createCustomerAccountAction(accountForm);
      if (res.success) {
        setAccountSuccess(res.message || 'Bank account created successfully.');
        loadCustomers();
        setTimeout(() => setAccountModalOpen(false), 2000);
      } else {
        setAccountError(res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setAccountError(err.message || 'An unexpected error occurred.');
    } finally {
      setAccountSubmitting(false);
    }
  };

  // Handle KYC Verification Toggle
  const handleKYCToggle = async (verified: boolean) => {
    if (!customerDetails?.customer) return;
    setKycUpdating(true);
    try {
      const res = await verifyCustomerKYCAction(
        customerDetails.customer.email,
        verified,
        kycNotes
      );
      if (res.success) {
        await handleViewDetails(customerDetails.customer.email);
        loadCustomers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setKycUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              Customer Operations
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Customer Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Register new customers, provision bank accounts, and verify KYC documentation.
          </p>
        </div>

        <button
          onClick={() => {
            setRegisterError('');
            setRegisterSuccess('');
            setRegisterModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          <PlusCircle className="h-4 w-4" />
          Onboard New Customer
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by customer name, email, or phone number..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs text-slate-900 transition focus:border-amber-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            KYC Status:
          </span>
          <select
            value={kycFilter}
            onChange={(e) => {
              setKycFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 transition focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200"
          >
            <option value="All">All Customers ({total})</option>
            <option value="Verified">Verified KYC Only</option>
            <option value="Unverified">Unverified KYC Only</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">KYC Status</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-500" />
                    <span className="mt-2 block text-xs">Loading customer directory...</span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto h-8 w-8 text-slate-300" />
                    <span className="mt-2 block text-xs font-medium">No customers found matching criteria</span>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.email}
                    className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Role: {c.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 dark:text-slate-300">
                        {c.email}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {c.phone || 'No phone recorded'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.kycVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          <ShieldAlert className="h-3 w-3" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(c.email)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          title="View customer portfolio & verify KYC"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          Details
                        </button>
                        <button
                          onClick={() => handleOpenAccountModal(c)}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
                          title="Provision Bank Account"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Open Account
                        </button>
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
              Page {page} of {totalPages}
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

      {/* ─── MODAL 1: Register Customer ────────────────────────────────────────── */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setRegisterModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Register Customer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Onboard customer into branch banking records
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5">
              {registerError && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                  {registerError}
                </div>
              )}
              {registerSuccess && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  {registerSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jonathan Doe"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="customer@domain.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    placeholder="Defaults Customer@1234"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Transaction PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Defaults 1234"
                    value={registerForm.transactionPin}
                    onChange={(e) => setRegisterForm({ ...registerForm, transactionPin: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
                >
                  {registerSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Create Bank Account for Customer ────────────────────────── */}
      {accountModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setAccountModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Open Bank Account
                  </h3>
                  <p className="text-xs text-slate-500">
                    For {selectedCustomer.name} ({selectedCustomer.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAccountModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAccountSubmit} className="mt-4 space-y-4">
              {accountError && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                  {accountError}
                </div>
              )}
              {accountSuccess && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  {accountSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Account Type *
                </label>
                <select
                  value={accountForm.accountType}
                  onChange={(e) =>
                    setAccountForm({
                      ...accountForm,
                      accountType: e.target.value as any,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
                >
                  <option value="Savings Account">Savings Account (Daily Limit: $5,000)</option>
                  <option value="Current Account">Current Account (Daily Limit: $15,000)</option>
                  <option value="Business Account">Business Account (Daily Limit: $50,000)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Initial Deposit Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={accountForm.initialDeposit}
                  onChange={(e) =>
                    setAccountForm({
                      ...accountForm,
                      initialDeposit: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Credited immediately via Vaultly Central Reserve Deposit transaction.
                </p>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={accountSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
                >
                  {accountSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Open Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: View Customer Details & KYC Verification ──────────────── */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setDetailsModalOpen(false)}
          />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Customer Details & KYC
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive banking profile & account portfolio
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailsLoading || !customerDetails ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-500" />
                <span className="mt-2 block text-xs">Loading customer portfolio...</span>
              </div>
            ) : (
              <div className="mt-4 space-y-5">
                {/* Profile Overview */}
                <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/40">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400">Full Name</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {customerDetails.customer.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400">Email Address</div>
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      {customerDetails.customer.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400">Phone</div>
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      {customerDetails.customer.phone || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400">Status</div>
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {customerDetails.customer.status}
                    </div>
                  </div>
                </div>

                {/* KYC Verification Section */}
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        KYC Compliance Status
                      </h4>
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                        {customerDetails.customer.kycVerified
                          ? `Verified by ${customerDetails.customer.verifiedBy || 'Staff'} on ${
                              customerDetails.customer.verifiedAt
                                ? new Date(customerDetails.customer.verifiedAt).toLocaleDateString()
                                : 'Recorded'
                            }`
                          : 'Customer document verification is currently pending.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleKYCToggle(true)}
                        disabled={kycUpdating || customerDetails.customer.kycVerified}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40"
                      >
                        Verify KYC
                      </button>
                      <button
                        onClick={() => handleKYCToggle(false)}
                        disabled={kycUpdating || !customerDetails.customer.kycVerified}
                        className="rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-400"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Verification Notes
                    </label>
                    <textarea
                      rows={2}
                      value={kycNotes}
                      onChange={(e) => setKycNotes(e.target.value)}
                      placeholder="Add compliance or identity document notes (e.g. National ID / Passport verified)..."
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                {/* Bank Accounts List */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Associated Bank Accounts ({customerDetails.accounts?.length || 0})
                  </h4>
                  <div className="mt-2 space-y-2">
                    {customerDetails.accounts?.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        No bank accounts registered for this customer yet.
                      </p>
                    ) : (
                      customerDetails.accounts.map((acc: any) => (
                        <div
                          key={acc.accountNumber}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                #{acc.accountNumber}
                              </span>
                              <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {acc.accountType}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Status: {acc.status} • Daily Limit: ${acc.dailyLimit?.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                              ${(acc.balance || 0).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400">Available Balance</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
