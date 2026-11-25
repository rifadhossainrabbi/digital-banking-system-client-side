'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Menu,
  ArrowRightLeft,
  ChevronDown,
  Wallet,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveAccount, BankAccount } from '@/redux/slices/accountSlice';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from '@/redux/api/bankingApi';

interface HeaderProps {
  onOpenMobile: () => void;
}

export default function CustomerHeader({ onOpenMobile }: HeaderProps) {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const { accounts, activeAccount } = useAppSelector(state => state.accounts);

  const [notifOpen, setNotifOpen] = useState(false);
  const { data: notifData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });
  const [markRead] = useMarkNotificationReadMutation();

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

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
                        a => a.accountNumber === e.target.value,
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

      {/* Right: Quick Transfer, Notification Bell, Profile */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/customer/transfer"
          className="hidden items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:flex dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          <span>Quick Transfer</span>
        </Link>

        {/* Notification Bell (RTK Query) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(prev => !prev)}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              onMouseLeave={() => setNotifOpen(false)}
              className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markRead({ markAll: true })}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n._id}
                      type="button"
                      onClick={() => {
                        if (!n.read) markRead({ id: n._id });
                      }}
                      className={`w-full rounded-xl p-2.5 text-left transition ${
                        n.read
                          ? 'bg-slate-50/50 text-slate-500 dark:bg-slate-950/30 dark:text-slate-400'
                          : 'bg-emerald-50/60 text-slate-900 ring-1 ring-emerald-200/70 dark:bg-emerald-950/30 dark:text-white dark:ring-emerald-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold">{n.title}</span>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug opacity-85">
                        {n.message}
                      </p>
                      <span className="mt-1 block font-mono text-[9px] text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar linking to /dashboard/customer/profile */}
        <Link
          href="/dashboard/customer/profile"
          aria-label="Profile and Security Settings"
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
              Profile &amp; 2FA
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
