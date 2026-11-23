import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';

export const instant = false;

import {
  Users,
  CreditCard,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  Clock,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  if (session.user.role !== 'Admin') {
    redirect('/dashboard');
  }

  const stats = [
    {
      title: 'Total Customers',
      value: '1,420',
      change: '+12% this month',
      icon: Users,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400',
    },
    {
      title: 'Total Bank Accounts',
      value: '2,845',
      change: '+8% this month',
      icon: CreditCard,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400',
    },
    {
      title: 'Total Bank Balance',
      value: '$48,250,900',
      change: '+18.4% YoY',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    {
      title: 'Total Deposits',
      value: '$3,410,200',
      change: 'Past 30 days',
      icon: ArrowDownLeft,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 dark:text-teal-400',
    },
    {
      title: 'Total Withdrawals',
      value: '$1,890,450',
      change: 'Past 30 days',
      icon: ArrowUpRight,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400',
    },
    {
      title: 'Pending Loan Apps',
      value: '18',
      change: 'Requires review',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">System Control Center</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome, {session.user.name || 'Administrator'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enterprise overview of digital banking operations, customers, and accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.title}
                </span>
                <div className={`rounded-xl p-2.5 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Sections */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Administrative Management
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Direct controls for banking operations and staff approvals.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                Customer Management
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                View, freeze, or unfreeze accounts
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                Loan Applications
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Approve, reject, and disburse loans
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Security & Auditing
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            System status and real-time security monitor.
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/30">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                NextAuth Authentication Engine
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                Online & Secure
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-xs dark:border-blue-900/40 dark:bg-blue-950/30">
              <span className="font-semibold text-blue-800 dark:text-blue-300">
                MongoDB Atlas Database
              </span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-950">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Role-Based Access Control (RBAC)
              </span>
              <span className="rounded-full bg-slate-200 px-2.5 py-0.5 font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                Enforced (Admin)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
