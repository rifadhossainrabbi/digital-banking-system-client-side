'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  CreditCard,
  Banknote,
  FileSpreadsheet,
  Clock,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import CustomerCharts from '@/components/customer/CustomerCharts';
import TransactionReceiptModal from '@/components/customer/TransactionReceiptModal';
import { Transaction } from '@/redux/slices/transactionSlice';

export default function CustomerDashboardOverview() {
  const { accounts, activeAccount } = useAppSelector(
    state => state.accounts
  );
  const { transactions, isLoading: txnsLoading } = useAppSelector(
    state => state.transactions
  );
  const { loans } = useAppSelector(state => state.loans);

  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [hideBalance, setHideBalance] = useState(false);

  // Active account stats
  const currentAccount = activeAccount || accounts[0];
  const balance = currentAccount?.balance ?? 0;
  const accountNumber = currentAccount?.accountNumber ?? '----------';
  const accountType = currentAccount?.accountType ?? 'Savings Account';
  const accountStatus = currentAccount?.status ?? 'Active';

  const totalDeposits = transactions
    .filter(t => t.type === 'Deposit' || t.type === 'Loan Disbursement')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'Withdrawal')
    .reduce((acc, t) => acc + t.amount, 0);

  const activeLoanCount = loans.filter(
    l => l.status === 'Active' || l.status === 'Approved'
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Banking Session
            </span>
            <span className="text-xs text-slate-400">
              Account Status: {accountStatus}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Hello, {currentAccount?.userName || 'Valued Client'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Real-time digital overview of your bank accounts, cash flow, and financial assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/customer/transfer"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send Money</span>
          </Link>
          <Link
            href="/dashboard/customer/accounts"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Manage Accounts
          </Link>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Account Debit / Credit Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071121] via-[#0b1b36] to-[#043320] p-6 text-white shadow-xl dark:ring-1 dark:ring-slate-800 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xs">
                <Wallet className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {accountType}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHideBalance(prev => !prev)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
                aria-label="Toggle balance privacy"
              >
                {hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-xs">
                {accountStatus}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <span className="text-[11px] font-medium text-slate-400">
              Active Available Balance
            </span>
            <div className="mt-1 font-mono text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              {hideBalance ? (
                '••••••••'
              ) : (
                `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono text-slate-300">
            <div>
              <p className="text-[10px] text-slate-400">ACCOUNT NUMBER</p>
              <p className="font-semibold tracking-wider">{accountNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">DAILY LIMIT</p>
              <p className="font-semibold">
                ${(currentAccount?.dailyLimit || 5000).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Total Inflow / Deposits */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Deposits
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white">
              ${totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              +Recorded Inflow
            </p>
          </div>
          <Link
            href="/dashboard/customer/deposit-withdraw"
            className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-emerald-700 hover:underline dark:border-slate-800 dark:text-emerald-400"
          >
            <span>Request Deposit</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Total Withdrawals */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Outflow
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white">
              ${totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
              -Settled Withdrawals
            </p>
          </div>
          <Link
            href="/dashboard/customer/deposit-withdraw"
            className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-rose-600 hover:underline dark:border-slate-800 dark:text-rose-400"
          >
            <span>Request Withdrawal</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Financial Shortcuts Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Instant Banking Actions
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <Link
            href="/dashboard/customer/transfer"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Send className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              Fund Transfer
            </span>
            <span className="text-[10px] text-slate-400">Send to account</span>
          </Link>

          <Link
            href="/dashboard/customer/deposit-withdraw"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <Banknote className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              Deposit & Withdraw
            </span>
            <span className="text-[10px] text-slate-400">Cash & Wire</span>
          </Link>

          <Link
            href="/dashboard/customer/accounts"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              My Accounts ({accounts.length})
            </span>
            <span className="text-[10px] text-slate-400">Open & Switch</span>
          </Link>

          <Link
            href="/dashboard/customer/loans"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              Loans & EMI ({activeLoanCount})
            </span>
            <span className="text-[10px] text-slate-400">Apply & Repay</span>
          </Link>

          <a
            href={`/api/customer/statement?account=${currentAccount?.accountNumber || ''}`}
            download
            className="col-span-2 flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 text-center transition hover:border-slate-300 hover:bg-slate-100/50 sm:col-span-1 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <Clock className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              Download Statement
            </span>
            <span className="text-[10px] text-slate-400">Export CSV</span>
          </a>
        </div>
      </div>

      {/* Interactive Financial Charts */}
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />}>
        <CustomerCharts transactions={transactions} />
      </Suspense>

      {/* Recent Transactions Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400">
              Click any transaction row to view and print its detailed cryptographic receipt
            </p>
          </div>
          <Link
            href="/dashboard/customer/transactions"
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {txnsLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Loading recent transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No transactions found yet. Initiate a transfer to get started.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="pb-3 pl-2">Transaction ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Parties</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {transactions.slice(0, 6).map(txn => {
                  const isCredit =
                    txn.type === 'Deposit' ||
                    txn.type === 'Loan Disbursement';

                  return (
                    <tr
                      key={txn._id}
                      onClick={() => setSelectedTxn(txn)}
                      className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
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
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {isCredit ? txn.senderName : txn.receiverName}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">
                          {txn.description}
                        </p>
                      </td>
                      <td className="py-3.5 font-mono text-slate-500">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {txn.status}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 pr-2 text-right font-mono font-bold ${
                          isCredit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isCredit ? '+' : '-'}$
                        {txn.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Receipt Modal */}
      {selectedTxn && (
        <TransactionReceiptModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </div>
  );
}
