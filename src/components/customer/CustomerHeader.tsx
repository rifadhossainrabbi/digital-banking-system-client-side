'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  Menu,
  Sun,
  Moon,
  ArrowRightLeft,
  ChevronDown,
  Wallet,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveAccount, BankAccount } from '@/redux/slices/accountSlice';

interface HeaderProps {
  onOpenMobile: () => void;
}

export default function CustomerHeader({ onOpenMobile }: HeaderProps) {
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { accounts, activeAccount } = useAppSelector(state => state.accounts);

  const getInitials = (name?: string | null) => {
    if (!name || !name.trim()) return 'CU';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md transition-colors duration-200 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/90">
      {/* Left: Mobile Toggle & Active Account Selector */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open Navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Account Selector Pill */}
        {accounts.length > 0 ? (
          <div className="relative">
            <label htmlFor="account-switcher" className="sr-only">
              Switch Bank Account
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900/80">
              <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Account
                </span>
                <div className="relative flex items-center">
                  <select
                    id="account-switcher"
                    value={activeAccount?.accountNumber || ''}
                    onChange={e => {
                      const selected = accounts.find(
                        a => a.accountNumber === e.target.value
                      );
                      if (selected) {
                        dispatch(setActiveAccount(selected));
                      }
                    }}
                    className="cursor-pointer appearance-none bg-transparent pr-5 text-xs font-bold text-slate-800 focus:outline-hidden dark:text-white"
                  >
                    {accounts.map((acc: BankAccount) => (
                      <option
                        key={acc.accountNumber}
                        value={acc.accountNumber}
                        className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                      >
                        {acc.accountType} ({acc.accountNumber}) - $
                        {acc.balance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-0 h-3 w-3 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            <Wallet className="h-4 w-4 text-emerald-500" />
            <span>Vaultly Digital Account</span>
          </div>
        )}
      </div>

      {/* Right: Actions, Theme, and User Profile with Image / Initials */}
      <div className="flex items-center gap-3">
        {/* Quick Transfer Button */}
        <Link
          href="/dashboard/customer/transfer"
          className="hidden items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:flex dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          <span>Quick Transfer</span>
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() =>
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
          }
          aria-label="Toggle Theme"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>

        {/* User Profile Avatar / First 2 Digits (Initials) */}
        <Link
          href="/dashboard/customer"
          aria-label="Customer Profile Dashboard"
          className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-1 pr-3 transition hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0b162c] to-[#043320] text-xs font-bold text-emerald-300 shadow-inner dark:from-emerald-950 dark:to-slate-900 dark:text-emerald-400">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || 'Customer'}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div className="hidden text-left sm:block">
            <p className="max-w-[110px] truncate text-xs font-bold text-slate-900 dark:text-white">
              {user?.name || 'Customer'}
            </p>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Verified Client
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
