'use client';

import React from 'react';
import {
  CheckCircle2,
  X,
  Printer,
  Copy,
  Check,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { Transaction } from '@/redux/slices/transactionSlice';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionReceiptModal({
  transaction,
  onClose,
}: ReceiptModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!transaction) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.transactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isDepositOrDisbursement =
    transaction.type === 'Deposit' ||
    transaction.type === 'Loan Disbursement';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl transition-all sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Printable Receipt Container */}
        <div id="printable-receipt" className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transaction Receipt
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vaultly Digital Banking Management System
            </p>
          </div>

          {/* Amount Badge */}
          <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] py-4 text-center dark:border-slate-800 dark:bg-slate-950">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Amount
            </span>
            <div
              className={`mt-1 font-mono text-3xl font-extrabold ${
                isDepositOrDisbursement
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {isDepositOrDisbursement ? '+' : '-'}$
              {transaction.amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <span>Status:</span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                {transaction.status}
              </span>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="space-y-3 divide-y divide-slate-100 rounded-2xl border border-slate-200/70 p-4 text-xs dark:divide-slate-800 dark:border-slate-800">
            {/* Transaction Reference ID */}
            <div className="flex items-center justify-between pb-2">
              <span className="text-slate-500 dark:text-slate-400">
                Transaction ID
              </span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white">
                <span>{transaction.transactionId}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  aria-label="Copy ID"
                  className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">
                Transaction Type
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {transaction.type}
              </span>
            </div>

            {/* Sender Account */}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">From</span>
              <div className="text-right">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {transaction.senderName}
                </p>
                <p className="font-mono text-[11px] text-slate-400">
                  Acc: {transaction.senderAccount}
                </p>
              </div>
            </div>

            {/* Recipient Account */}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">To</span>
              <div className="text-right">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {transaction.receiverName}
                </p>
                <p className="font-mono text-[11px] text-slate-400">
                  Acc: {transaction.receiverAccount}
                </p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Date</span>
              <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {new Date(transaction.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Transaction Fee */}
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">
                Service Fee
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                ${(transaction.fee || 0).toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-500 dark:text-slate-400">
                Description
              </span>
              <span className="max-w-[200px] truncate text-right text-slate-700 dark:text-slate-300">
                {transaction.description || 'Standard Banking Transfer'}
              </span>
            </div>
          </div>

          {/* Footer Security Watermark */}
          <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Cryptographically sealed & logged in Vaultly Core Ledger</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-[#0b162c] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#152342] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
