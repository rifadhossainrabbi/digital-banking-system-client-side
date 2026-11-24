import React from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  PlusCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Briefcase,
} from 'lucide-react';
import { getStaffDashboardDataAction } from '@/actions/staff';

export const instant = false;

export default async function StaffOverviewPage() {
  const data = await getStaffDashboardDataAction();
  const { metrics, recentTransactions, pendingLoansList, staffMember } = data;

  const statCards = [
    {
      title: 'Total Customers',
      value: metrics.totalCustomers,
      subtitle: `${metrics.unverifiedCustomers} unverified KYC`,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200/60 dark:border-blue-900/40',
      href: '/dashboard/staff/customers',
    },
    {
      title: 'Active Bank Accounts',
      value: metrics.totalAccounts,
      subtitle: 'Managed across branch',
      icon: CreditCard,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200/60 dark:border-emerald-900/40',
      href: '/dashboard/staff/customers',
    },
    {
      title: 'Pending Loans Review',
      value: metrics.pendingLoans,
      subtitle: 'Awaiting staff assistance',
      icon: FileSpreadsheet,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200/60 dark:border-amber-900/40',
      href: '/dashboard/staff/loans',
    },
    {
      title: 'Flagged Suspicious',
      value: metrics.flaggedTransactions,
      subtitle: 'Compliance attention',
      icon: ShieldAlert,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200/60 dark:border-rose-900/40',
      href: '/dashboard/staff/transactions?flagged=true',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
                <Briefcase className="h-3.5 w-3.5" />
                Branch Operations Desk
              </span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Branch: {staffMember.branchCode} ({staffMember.branchName})
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Welcome back, {staffMember.name || 'Bank Staff'}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Serve branch customers, verify KYC records, monitor transactions, and forward loan applications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/staff/customers"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
            >
              <PlusCircle className="h-4 w-4" />
              Onboard Customer
            </Link>
            <Link
              href="/dashboard/staff/transactions"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Receipt className="h-4 w-4" />
              Audit Transactions
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`group rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md dark:bg-slate-900 ${card.border}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`rounded-xl p-2.5 ${card.bg} ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {card.value.toLocaleString()}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{card.subtitle}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Pending Loans & Recent Transactions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Pending Loans Awaiting Staff Forwarding */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Loan Assistance Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Applications awaiting staff verification and forwarding to Admin
              </p>
            </div>
            <Link
              href="/dashboard/staff/loans"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              View All ({metrics.pendingLoans})
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {pendingLoansList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                <CheckCircle2 className="h-10 w-10 text-emerald-500/60" />
                <p className="mt-2 text-sm font-medium">Queue Clear</p>
                <p className="text-xs">No pending loan applications requiring review.</p>
              </div>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              pendingLoansList.map((loan: any) => (
                <div
                  key={loan.loanId}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-100/60 dark:border-slate-800/60 dark:bg-slate-900/50 dark:hover:bg-slate-800/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {loan.loanId}
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {loan.status}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      {loan.userName || loan.userEmail} •{' '}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ${(loan.amount || 0).toLocaleString()}
                      </span>{' '}
                      ({loan.durationMonths} mos)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Income: ${loan.monthlyIncome?.toLocaleString() || 'N/A'}/mo • {loan.employmentStatus}
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/staff/loans?id=${loan.loanId}`}
                    className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
                  >
                    Assist
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Branch Transactions */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Transactions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest customer deposits, transfers, and disbursements
              </p>
            </div>
            <Link
              href="/dashboard/staff/transactions"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              Full Ledger
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                <Receipt className="h-10 w-10 text-slate-300" />
                <p className="mt-2 text-sm font-medium">No Recent Transactions</p>
              </div>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              recentTransactions.map((txn: any) => {
                const isFlagged = txn.isSuspicious;
                return (
                  <div
                    key={txn.transactionId}
                    className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                      isFlagged
                        ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20'
                        : 'border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {txn.transactionId}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            txn.type === 'Deposit'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : txn.type === 'Withdrawal'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {txn.type}
                        </span>
                        {isFlagged && (
                          <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            Flagged
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        {txn.senderName || txn.senderAccount} → {txn.receiverName || txn.receiverAccount}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(txn.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ${(txn.amount || 0).toLocaleString()}
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          txn.status === 'Completed'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
