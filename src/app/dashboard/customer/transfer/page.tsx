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
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  executeFundTransfer,
  Transaction,
} from '@/redux/slices/transactionSlice';
import { fetchAccounts, BankAccount } from '@/redux/slices/accountSlice';
import { bankingApi, useGetCustomerProfileQuery } from '@/redux/api/bankingApi';
import TransactionReceiptModal from '@/components/customer/TransactionReceiptModal';
import toast from 'react-hot-toast';

export default function CustomerTransferPage() {
  const dispatch = useAppDispatch();
  const { accounts, activeAccount } = useAppSelector(state => state.accounts);
  const { isSubmitting } = useAppSelector(state => state.transactions);
  const { data: profileData } = useGetCustomerProfileQuery();

  const [transferMode, setTransferMode] = useState<'external' | 'internal'>(
    'external',
  );
  const [senderAccount, setSenderAccount] = useState<string>('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `IDEM-${Date.now()}`,
  );

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTxn, setCompletedTxn] = useState<Transaction | null>(null);

  const effectiveSender =
    senderAccount ||
    activeAccount?.accountNumber ||
    accounts[0]?.accountNumber ||
    '';

  const selectedSender =
    accounts.find(a => a.accountNumber === effectiveSender) ||
    activeAccount ||
    accounts[0];

  const is2FAEnabledOnProfile = Boolean(profileData?.profile?.twoFactorEnabled);
  const numericAmount = Number(amount) || 0;
  const shouldShow2FA =
    requires2FA || is2FAEnabledOnProfile || numericAmount >= 5000;

  const regenerateIdempotencyKey = () => {
    setIdempotencyKey(
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `IDEM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    );
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
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

    if (shouldShow2FA && !/^\d{6}$/.test(twoFactorCode.trim())) {
      setError(
        'Two-Factor Authentication (6-digit OTP) is required for this transfer (Demo OTP: 654321).',
      );
      return;
    }

    const minReserve = selectedSender?.minBalance ?? 50;
    if (selectedSender && selectedSender.balance - transferAmt < minReserve) {
      setError(
        `Insufficient funds. Available: $${selectedSender.balance.toFixed(
          2,
        )} (Minimum Reserve: $${minReserve.toFixed(2)}).`,
      );
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleConfirmTransfer = async () => {
    setConfirmDialogOpen(false);
    setError(null);
    const transferAmt = Number(amount);

    try {
      const result = await dispatch(
        executeFundTransfer({
          senderAccount: effectiveSender.trim(),
          recipientAccount: recipientAccount.trim(),
          amount: transferAmt,
          description: description.trim() || 'Fund Transfer',
          transactionPin: transactionPin.trim(),
          twoFactorCode: shouldShow2FA ? twoFactorCode.trim() : undefined,
          idempotencyKey,
        }),
      ).unwrap();

      setCompletedTxn(result.transaction);
      toast.success(
        `Transferred $${transferAmt.toFixed(
          2,
        )} to ${recipientAccount.trim()} successfully!`,
      );
      dispatch(fetchAccounts());
      dispatch(
        bankingApi.util.invalidateTags([
          'Notifications',
          'Transactions',
          'Accounts',
        ]),
      );
      setAmount('');
      setDescription('');
      setTransactionPin('');
      setTwoFactorCode('');
      setRequires2FA(false);
      regenerateIdempotencyKey();
      if (transferMode === 'external') {
        setRecipientAccount('');
      }
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'requires2FA' in err &&
        (err as { requires2FA?: boolean }).requires2FA
      ) {
        setRequires2FA(true);
        const msg =
          (err as { message?: string }).message ||
          '2FA code required (Demo OTP: 654321).';
        setError(msg);
        toast.error(msg);
        return;
      }
      const msg =
        typeof err === 'string'
          ? err
          : 'Transfer failed. Please check details.';
      setError(msg);
      toast.error(msg);
      regenerateIdempotencyKey();
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
          Transfer funds securely to any customer account within the bank or
          between your own accounts.
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
              a => a.accountNumber !== effectiveSender,
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
        <form onSubmit={handleOpenConfirm} className="space-y-6">
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
                    a => a.accountNumber !== e.target.value,
                  );
                  setRecipientAccount(alt?.accountNumber || '');
                }
              }}
              className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                Daily Limit: $
                {(selectedSender.dailyLimit || 5000).toLocaleString()} • Max
                Single: $
                {(selectedSender.maxSingleTransaction || 2000).toLocaleString()}{' '}
                • Min Reserve: ${(selectedSender.minBalance ?? 50).toFixed(2)}
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
              accounts.filter(a => a.accountNumber !== effectiveSender)
                .length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                  You only have 1 bank account. Open a second account from
                  &quot;My Accounts&quot; to transfer between your own accounts.
                </div>
              ) : (
                <select
                  id="recipient-account"
                  value={recipientAccount}
                  onChange={e => setRecipientAccount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {accounts
                    .filter(
                      (a: BankAccount) => a.accountNumber !== effectiveSender,
                    )
                    .map((acc: BankAccount) => (
                      <option key={acc.accountNumber} value={acc.accountNumber}>
                        {acc.accountType} — {acc.accountNumber} ($
                        {acc.balance.toFixed(2)})
                      </option>
                    ))}
                </select>
              )
            ) : (
              <input
                id="recipient-account"
                type="text"
                maxLength={16}
                value={recipientAccount}
                onChange={e =>
                  setRecipientAccount(e.target.value.replace(/\s+/g, ''))
                }
                placeholder="Enter 10-digit account number (e.g. 1003489112)"
                className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 text-xs font-mono font-bold text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
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
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-9 pr-4 font-mono text-xl font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
              className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 font-mono text-sm tracking-widest text-slate-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Conditional Two-Factor Authentication Input */}
          {shouldShow2FA && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/25">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Two-Factor Authentication Required</span>
              </div>
              <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                {numericAmount >= 5000
                  ? 'High-value transfers ($5,000+) require 2FA verification.'
                  : '2FA protection is enabled on your profile.'}{' '}
                Enter your 6-digit verification code (Demo OTP:{' '}
                <strong className="font-mono">654321</strong>).
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={twoFactorCode}
                onChange={e =>
                  setTwoFactorCode(e.target.value.replace(/\D/g, ''))
                }
                placeholder="Enter 6-digit 2FA OTP (654321)"
                className="mt-2.5 w-full rounded-xl border border-amber-300 bg-white p-3 font-mono text-sm tracking-widest text-slate-900 dark:border-amber-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          )}

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
                  <span>Review & Execute Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Transfer Confirmation Dialog */}
      {confirmDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Fund Transfer
              </h3>
              <button
                type="button"
                onClick={() => setConfirmDialogOpen(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Amount to Send
                </span>
                <p className="mt-1 font-mono text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  $
                  {Number(amount).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="space-y-2 rounded-2xl border border-slate-100 p-3.5 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">From Account</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {effectiveSender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">To Account</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {recipientAccount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transfer Fee</span>
                  <span className="font-mono font-semibold text-emerald-600">
                    $0.00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Memo</span>
                  <span className="max-w-[180px] truncate text-slate-700 dark:text-slate-300">
                    {description || 'Fund Transfer'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialogOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}

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
