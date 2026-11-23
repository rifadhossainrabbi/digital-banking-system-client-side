import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';

export const instant = false;

import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default async function CustomerDashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Look up customer's bank account from database
  let bankAccount = null;
  try {
    const db = await getDatabase();
    bankAccount = await db
      .collection('bank_accounts')
      .findOne({ userEmail: session.user.email?.toLowerCase() });
  } catch (err) {
    console.error('Error fetching customer account:', err);
  }

  const balance = bankAccount?.balance ?? 1000.0;
  const accountNumber = bankAccount?.accountNumber ?? '1008492041';
  const accountType =
    bankAccount?.accountType || session.user.accountType || 'Savings Account';
  const status = bankAccount?.status || session.user.status || 'Active';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Customer Portal
            </span>
            <span className="text-xs text-slate-400">Personal Banking</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome, {session.user.name || 'Customer'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your accounts, transfer funds, view transactions, and check loans.
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

      {/* Main Account Card & Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Modern Fintech Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071121] via-[#0b1b36] to-[#043320] p-7 text-white shadow-xl dark:ring-1 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {accountType}
              </span>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 backdrop-blur-xs">
              {status}
            </span>
          </div>

          <div className="mt-8">
            <span className="text-xs font-medium text-slate-400">
              Available Balance
            </span>
            <div className="mt-1 font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono text-slate-300">
            <div>
              <p className="text-[10px] text-slate-400">ACCOUNT NUMBER</p>
              <p className="font-semibold tracking-wider">{accountNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">HOLDER</p>
              <p className="font-semibold">{session.user.name || 'Valued Client'}</p>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Quick Financial Actions
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Perform instant fund transfers, deposit requests, or apply for loans.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Send className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                Transfer
              </span>
              <span className="text-[10px] text-slate-400">Instant send</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-teal-300 hover:bg-teal-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                Deposit
              </span>
              <span className="text-[10px] text-slate-400">Submit request</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-rose-300 hover:bg-rose-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-rose-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                Withdraw
              </span>
              <span className="text-[10px] text-slate-400">Cash withdrawal</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                Apply Loan
              </span>
              <span className="text-[10px] text-slate-400">Low interest</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Account Activity
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Your latest banking transactions and transfers.
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" /> Real-time Sync
          </span>
        </div>

        <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Initial Opening Deposit
                </p>
                <p className="text-[11px] text-slate-400">Account Activation</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-400">Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
