'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  X,
  Loader2,
} from 'lucide-react';
import { getAdminStaffAction, createStaffMemberAction } from '@/actions/admin';

export default function AdminStaffPage() {
  const [isPending, startTransition] = useTransition();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Staff@1234');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [branchCode, setBranchCode] = useState('VLT-NYC-01');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminStaffAction();
      setStaffList(res.staff);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await createStaffMemberAction({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          employeeId: employeeId.trim() || undefined,
          branchCode: branchCode.trim() || undefined,
        });
        setFeedback(res.message);
        setTimeout(() => setFeedback(null), 3500);
        setOnboardModalOpen(false);
        setName('');
        setEmail('');
        setPhone('');
        setEmployeeId('');
        await fetchStaff();
      } catch (err: any) {
        alert(err.message || 'Failed to onboard staff.');
      }
    });
  };

  const filteredStaff = staffList.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.employeeId?.toLowerCase().includes(q) ||
      s.branchCode?.toLowerCase().includes(q)
    );
  });

  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Bank Staff Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Provision branch officer credentials, assign branch locations, and oversee personnel.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOnboardModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 dark:bg-rose-500 dark:text-slate-950 dark:hover:bg-rose-400"
        >
          <Plus className="h-4 w-4" />
          <span>Onboard New Staff</span>
        </button>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
          {feedback}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative rounded-3xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter staff by name, email, employee ID, or branch code..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        />
      </div>

      {/* Staff Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-xs text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          <span className="mt-2">Loading officer roster...</span>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="py-20 text-center text-xs text-slate-400">
          No bank staff members found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map(staff => (
            <div
              key={staff._id}
              className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-800 font-mono text-xs font-bold text-white shadow-xs">
                    {getInitials(staff.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{staff.name}</h3>
                    <p className="font-mono text-[10px] text-slate-400">{staff.employeeId || 'STAFF'}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {staff.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono text-[11px] truncate">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono text-[11px]">{staff.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Branch: {staff.branchCode || 'Main Office'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-mono dark:border-slate-800">
                <span>Role: Bank Staff</span>
                <span>Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard Staff Modal */}
      {onboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Onboard Bank Staff Officer
              </h3>
              <button
                type="button"
                onClick={() => setOnboardModalOpen(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Officer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Marcus Brody"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Staff Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. officer@vaultly.bank"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    placeholder="e.g. EMP-9901"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={e => setBranchCode(e.target.value)}
                    placeholder="e.g. VLT-NYC-01"
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Temporary Password
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOnboardModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {isPending ? 'Onboarding...' : 'Onboard Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
