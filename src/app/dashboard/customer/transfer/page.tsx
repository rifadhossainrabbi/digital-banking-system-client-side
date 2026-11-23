'use client';

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Send,
  KeyRound,
  AlertCircle,
  Loader2,
  Wallet,
  UserCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { executeFundTransfer, Transaction } from '@/redux/slices/transactionSlice';
import { fetchAccounts, BankAccount } from '@/redux/slices/accountSlice';
import TransactionReceiptModal from '@/components/customer/TransactionReceiptModal';

export default function CustomerTransferPage() {
  const dispatch = useAppDispatch();
  const { accounts, activeAccount } = useAppSelector(state => state.accounts);
  const { isSubmitting } = useAppSelector(state => state.transactions);

  const [transferMode, setTransferMode] = useState<'external' | 'internal'>(
    'external'
  );
  const [senderAccount, setSenderAccount] = useState<string>('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionPin, setTransactionPin] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [completedTxn, setCompletedTxn] = useState<Transaction | null>(null);

  const effectiveSender =
    senderAccount || activeAccount?.accountNumber || accounts[0]?.accountNumber || '';

  const selectedSender =
    accounts.find(a => a.accountNumber === effectiveSender) ||
    activeAccount ||
    accounts[0];

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const transferAmt = Number(amount);
    if (isNaN(transferAmt) || transferAmt <= 0) {
      setError('Please enter a valid transfer amount greater than $0.');
      return;
    }

    if (!recipientAccount.trim()) {
      setError('Please enter the recipient bank account number.');
      return;
    }

    if (effectiveSender.trim() === recipientAccount.trim()) {
      setError('Sender and Recipient account cannot be the same.');
      return;
    }

    if (!transactionPin || transactionPin.length < 4) {
      setError('Please enter your 4-6 digit Transaction PIN (Default: 1234).');
      return;
    }

    if (selectedSender && transferAmt > selectedSender.balance) {
      setError(
        `Insufficient balance. Available: $${selectedSender.balance.toFixed(2)}`
      );
      return;
    }

    try {
      const result = await dispatch(
        executeFundTransfer({
          senderAccount: effectiveSender.trim(),
          recipientAccount: recipientAccount.trim(),
          amount: transferAmt,
          description: description.trim() || 'Fund Transfer',
          transactionPin: transactionPin.trim(),
        })
      ).unwrap();

      setCompletedTxn(result.transaction);
      // Refresh account balances
      dispatch(fetchAccounts());
      // Reset form
      setAmount('');
      setDescription('');
      setTransactionPin('');
      if (transferMode === 'external') {
        setRecipientAccount('');
      }
    } catch (err: unknown) {
      setError(typeof err === 'string' ? err : 'Transfer failed. Please check details.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Instant Fund Transfer
          </span>
          <span className="text-xs text-slate-400">Zero Processing Fees</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Transfer Money
        </h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Transfer funds securely to any customer account within the bank or between your own accounts.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#f1f5f9] p-1.5 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => {
            setTransferMode('external');
            setRecipientAccount('');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
            transferMode === 'external'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>To Another Customer</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTransferMode('internal');
            const otherAccount = accounts.find(
              a => a.accountNumber !== senderAccount
            );
            setRecipientAccount(otherAccount?.accountNumber || '');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
            transferMode === 'internal'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Wallet className="h-4 w-4" />
          <span>Between My Accounts ({accounts.length})</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Transfer Form Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleTransferSubmit} className="space-y-6">
          {/* Sender Account */}
          <div>
            <label
              htmlFor="sender-account"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              From Bank Account
            </label>
            <select
              id="sender-account"
              value={effectiveSender}
              onChange={e => {
                setSenderAccount(e.target.value);
                if (
                  transferMode === 'internal' &&
                  e.target.value === recipientAccount
                ) {
                  const alt = accounts.find(
                    a => a.accountNumber !== e.target.value
                  );
                  setRecipientAccount(alt?.accountNumber || '');
                }
              }}
              className="w-full rounded-2xl border border-transparent bg-[#f1f5f9] p-3.5 text-xs font-semibold text-slate-900 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:text-white"
            >
              {accounts.map((acc: BankAccount) => (
                <option key={acc.accountNumber} value={acc.accountNumber}>
                  {acc.accountType} — {acc.accountNumber} (Available: $
                  {acc.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                  )
                </option>
              ))}
            </select>
            {selectedSender && (
              <p className="mt-1.5 text-[11px] text-slate-400">
                Daily Limit: ${(selectedSender.dailyLimit || 5000).toLocaleString()}{' '}
                • Max Single: $
                {(selectedSender.maxSingleTransaction || 2000).toLocaleString()}
              </p>
            )}
          </div>

          {/* Recipient Account */}
          <div>
            <label
              htmlFor="recipient-account"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Recipient Account Number
            </label>
            {transferMode === 'internal' ? (
              <select
                id="recipient-account"
                value={recipientAccount}
                onChange={e => setRecipientAccount(e.target.value)}
                className="w-full rounded-2xl border border-transparent bg-[#f1f5f9] p-3.5 text-xs font-semibold text-slate-900 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:text-white"
              >
                {accounts
                  .filter((a: BankAccount) => a.accountNumber !== senderAccount)
                  .map((acc: BankAccount) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountType} — {acc.accountNumber} ($
                      {acc.balance.toFixed(2)})
                    </option>
                  ))}
              </select>
            ) : (
              <div className="relative">
                <input
                  id="recipient-account"
                  type="text"
                  maxLength={16}
                  value={recipientAccount}
                  onChange={e =>
                    setRecipientAccount(e.target.value.replace(/\s+/g, ''))
                  }
                  placeholder="Enter 10-digit account number (e.g. 1003489112)"
                  className="w-full rounded-2xl border border-transparent bg-[#f1f5f9] p-3.5 text-xs font-mono font-bold text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:text-white"
                />
              </div>
            )}
            {transferMode === 'external' && (
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <span>Demo In-Bank Customer:</span>
                <button
                  type="button"
                  onClick={() => setRecipientAccount('1003489112')}
                  className="font-mono font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  1003489112 (Elena Rostova)
                </button>
              </div>
            )}
          </div>

          {/* Transfer Amount */}
          <div>
            <label
              htmlFor="transfer-amount"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Transfer Amount ($)
            </label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-4 text-base font-extrabold text-slate-400">
                $
              </span>
              <input
                id="transfer-amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border border-transparent bg-[#f1f5f9] py-3.5 pl-9 pr-4 font-mono text-xl font-bold text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Description / Reference */}
          <div>
            <label
              htmlFor="transfer-description"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Description / Payment Reference (Optional)
            </label>
            <input
              id="transfer-description"
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Rent, consulting fee, family support"
              className="w-full rounded-2xl border border-transparent bg-[#f1f5f9] p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Transaction PIN */}
          <div>
            <label
              htmlFor="transaction-pin"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Transaction Security PIN
            </label>
            <div className="relative flex items-center">
              <KeyRound className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" />
              <input
                id="transaction-pin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={transactionPin}
                onChange={e =>
                  setTransactionPin(e.target.value.replace(/\D/g, ''))
                }
                placeholder="Enter 4-6 digit PIN (Default Demo PIN: 1234)"
                className="w-full rounded-2xl border border-transparent bg-[#f1f5f9] py-3.5 pl-11 pr-4 font-mono text-sm tracking-widest text-slate-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authorizing Fund Transfer...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Execute Transfer Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Automatic Transaction Receipt Modal */}
      {completedTxn && (
        <TransactionReceiptModal
          transaction={completedTxn}
          onClose={() => setCompletedTxn(null)}
        />
      )}
    </div>
  );
}
