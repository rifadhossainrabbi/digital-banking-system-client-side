import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';

export const instant = false;

import {
  Briefcase,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
} from 'lucide-react';

export default async function StaffDashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  if (session.user.role !== 'Bank Staff' && session.user.role !== 'Admin') {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
              <Briefcase className="h-3.5 w-3.5" />
              Bank Staff Portal
            </span>
            <span className="text-xs text-slate-400">Branch Operations</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome, {session.user.name || 'Bank Staff'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage customer accounts, review transactions, and assist with loan applications.
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

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Assigned Branch
            </span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            VLT-NYC-01
          </div>
          <div className="mt-1 text-xs text-slate-500">New York Metro Branch</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Reviews
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Search className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            14
          </div>
          <div className="mt-1 text-xs text-slate-500">Customer verifications</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Account Status
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            Active / Approved
          </div>
          <div className="mt-1 text-xs text-slate-500">Authorized bank staff</div>
        </div>
      </div>

      {/* Staff Operations Modules */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            Customer Onboarding
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Register new customers, create bank accounts, and verify KYC documentation.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ArrowRightLeft className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            Transaction Oversight
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Search transactions by ID, review flagged activities, and submit notes.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            Loan Assistance
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Review loan applications, add internal staff notes, and forward for Admin approval.
          </p>
        </div>
      </div>
    </div>
  );
}
