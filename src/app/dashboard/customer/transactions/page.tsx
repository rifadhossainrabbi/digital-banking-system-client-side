'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchTransactions,
  Transaction,
} from '@/redux/slices/transactionSlice';
import TransactionReceiptModal from '@/components/customer/TransactionReceiptModal';

export default function CustomerTransactionsPage() {
  const dispatch = useAppDispatch();
  const { transactions, totalTransactions, isLoading } = useAppSelector(
    state => state.transactions
  );
  const { activeAccount } = useAppSelector(state => state.accounts);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    dispatch(
      fetchTransactions({
        search: searchTerm,
        type: selectedType,
        page,
        limit: 10,
      })
    );
  }, [dispatch, searchTerm, selectedType, page]);

  const totalPages = Math.ceil(totalTransactions / 10) || 1;

  const transactionTypes = [
    'All',
    'Transfer',
    'Deposit',
    'Withdrawal',
    'Loan Disbursement',
    'Loan Repayment',
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Receipt className="h-3.5 w-3.5" />
              Ledger & Statements
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Transaction History
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Search, filter, and inspect detailed digital receipts for all your banking activities.
          </p>
        </div>

        <div>
          <a
            href={`/api/customer/statement?account=${activeAccount?.accountNumber || ''}`}
            download
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV Statement</span>
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Transaction ID, recipient, or description..."
            className="w-full rounded-2xl border border-transparent bg-[#f1f5f9] py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-slate-400 sm:hidden" />
          {transactionTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setSelectedType(type);
                setPage(1);
              }}
              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                selectedType === type
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Results: {totalTransactions}
          </span>
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Loading transaction records...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No transactions matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="pb-3.5 pl-2">Reference ID</th>
                  <th className="pb-3.5">Category</th>
                  <th className="pb-3.5">From / To</th>
                  <th className="pb-3.5">Description</th>
                  <th className="pb-3.5">Date</th>
                  <th className="pb-3.5">Status</th>
                  <th className="pb-3.5 pr-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {transactions.map(txn => {
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
                          {isCredit
                            ? `From: ${txn.senderAccount}`
                            : `To: ${txn.receiverAccount}`}
                        </p>
                      </td>
                      <td className="py-3.5 max-w-[180px] truncate text-slate-600 dark:text-slate-300">
                        {txn.description}
                      </td>
                      <td className="py-3.5 font-mono text-slate-500">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <span className="font-medium text-slate-500">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
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
