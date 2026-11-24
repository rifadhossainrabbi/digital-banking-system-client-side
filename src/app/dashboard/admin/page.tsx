import React, { Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Users,
  CreditCard,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  CheckSquare,
  ShieldAlert,
  ChevronRight,
  Send,
  UserCheck,
} from 'lucide-react';
import { getAdminDashboardDataAction } from '@/actions/admin';

// Lazy load heavy analytics charts for performance optimization
const AdminCharts = dynamic(() => import('@/components/admin/AdminCharts'), {
  loading: () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="h-[380px] animate-pulse rounded-3xl bg-slate-100 p-6 lg:col-span-2 dark:bg-slate-900" />
      <div className="h-[380px] animate-pulse rounded-3xl bg-slate-100 p-6 dark:bg-slate-900" />
    </div>
  ),
});

export const instant = false;

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardDataAction();
  const { metrics, charts, latestTransactions } = data;

  const statCards = [
    {
      title: 'Total Customers',
      value: metrics.totalCustomers.toLocaleString(),
      change: 'Active banking clients',
      icon: Users,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400',
      href: '/dashboard/admin/customers',
    },
    {
      title: 'Total Bank Accounts',
      value: metrics.totalAccounts.toLocaleString(),
      change: 'Active & provisioned',
      icon: CreditCard,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400',
      href: '/dashboard/admin/accounts',
    },
    {
      title: 'Total Bank Balance',
      value: `$${metrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: 'System-wide reserves',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
      href: '/dashboard/admin/accounts',
    },
    {
      title: 'Total Deposits',
      value: `$${metrics.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: 'Settled inflow',
      icon: ArrowDownLeft,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 dark:text-teal-400',
      href: '/dashboard/admin/transactions',
    },
    {
      title: 'Total Withdrawals',
      value: `$${metrics.totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: 'Settled outflow',
      icon: ArrowUpRight,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400',
      href: '/dashboard/admin/transactions',
    },
    {
      title: 'Total Transactions',
      value: metrics.totalTransactions.toLocaleString(),
      change: 'Audited records',
      icon: Send,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400',
      href: '/dashboard/admin/transactions',
    },
    {
      title: 'Pending Loans',
      value: metrics.pendingLoans.toLocaleString(),
      change: metrics.pendingLoans > 0 ? 'Requires decision' : 'All loans cleared',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
      href: '/dashboard/admin/loans',
    },
    {
      title: 'Pending Clearances',
      value: metrics.pendingRequests.toLocaleString(),
      change: metrics.pendingRequests > 0 ? 'Awaiting action' : 'Queue cleared',
      icon: CheckSquare,
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 dark:text-cyan-400',
      href: '/dashboard/admin/requests',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Central Bank Administration
            </span>
            {metrics.flaggedTxns > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
                <ShieldAlert className="h-3.5 w-3.5" />
                {metrics.flaggedTxns} Flagged Suspicious
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Executive Banking Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Real-time analytics, liquidity overview, and governance controls across all bank branches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/admin/accounts"
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 dark:bg-rose-500 dark:text-slate-950 dark:hover:bg-rose-400"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Provision Account</span>
          </Link>
          <Link
            href="/dashboard/admin/loans"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Review Loans ({metrics.pendingLoans})
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-rose-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {stat.title}
                </span>
                <div className={`rounded-2xl p-2.5 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{stat.change}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 opacity-0 transition group-hover:opacity-100" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recharts Analytics Section */}
      <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />}>
        <AdminCharts
          monthlyActivity={charts.monthlyActivity}
          accountDistribution={charts.accountDistribution}
          loanStats={charts.loanStats}
        />
      </Suspense>

      {/* Quick Administrative Operations Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Executive Operations
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <Link
            href="/dashboard/admin/customers"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Users className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              Customer Control
            </span>
            <span className="text-[10px] text-slate-400">Block / Unblock</span>
          </Link>

          <Link
            href="/dashboard/admin/accounts"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              Bank Accounts
            </span>
            <span className="text-[10px] text-slate-400">Limits & Freeze</span>
          </Link>

          <Link
            href="/dashboard/admin/loans"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-amber-300 hover:bg-amber-50/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-amber-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Clock className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              Loan Approvals
            </span>
            <span className="text-[10px] text-slate-400">Disburse Funds</span>
          </Link>

          <Link
            href="/dashboard/admin/requests"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <CheckSquare className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              Deposit Clearances
            </span>
            <span className="text-[10px] text-slate-400">Approve Wire/Cash</span>
          </Link>

          <Link
            href="/dashboard/admin/staff"
            className="col-span-2 flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-rose-300 hover:bg-rose-50/50 sm:col-span-1 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-rose-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <UserCheck className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              Staff Management
            </span>
            <span className="text-[10px] text-slate-400">Onboard Officers</span>
          </Link>
        </div>
      </div>

      {/* Recent Central Bank Transactions */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              System Financial Audit Trail
            </h3>
            <p className="text-xs text-slate-400">
              Real-time feed of inter-account transfers, deposits, and loan disbursements
            </p>
          </div>
          <Link
            href="/dashboard/admin/transactions"
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline dark:text-rose-400"
          >
            <span>Audit All Transactions</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {latestTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No transactions found in system logs.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="pb-3 pl-2">Transaction ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Sender</th>
                  <th className="pb-3">Recipient</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {latestTransactions.map((txn: any) => (
                  <tr
                    key={txn._id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3.5 pl-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {txn.transactionId}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-slate-900 dark:text-white">{txn.senderName}</p>
                      <p className="font-mono text-[10px] text-slate-400">{txn.senderAccount}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-slate-900 dark:text-white">{txn.receiverName}</p>
                      <p className="font-mono text-[10px] text-slate-400">{txn.receiverAccount}</p>
                    </td>
                    <td className="py-3.5 font-mono text-slate-500">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          txn.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : txn.status === 'Reversed'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ${txn.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
