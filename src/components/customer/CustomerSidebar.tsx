'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  Receipt,
  Banknote,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight,
  UserCog,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

const navItems = [
  {
    name: 'Overview',
    href: '/dashboard/customer',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Bank Accounts',
    href: '/dashboard/customer/accounts',
    icon: CreditCard,
    badge: null,
  },
  {
    name: 'Fund Transfer',
    href: '/dashboard/customer/transfer',
    icon: ArrowRightLeft,
    badge: 'Instant',
  },
  {
    name: 'Transactions',
    href: '/dashboard/customer/transactions',
    icon: Receipt,
    badge: null,
  },
  {
    name: 'Deposit & Withdraw',
    href: '/dashboard/customer/deposit-withdraw',
    icon: Banknote,
    badge: null,
  },
  {
    name: 'Loans & EMI',
    href: '/dashboard/customer/loans',
    icon: FileSpreadsheet,
    badge: '5.5% APR',
  },
  {
    name: 'Profile & 2FA',
    href: '/dashboard/customer/profile',
    icon: UserCog,
    badge: null,
  },
];

export default function CustomerSidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white/95 px-4 py-6 backdrop-blur-md transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/95">
      {/* Brand & Portal Header */}
      <div className="mb-6 px-2">
        <Link
          href="/"
          className="group flex items-center gap-3"
          onClick={onCloseMobile}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071121] shadow-sm transition group-hover:scale-105 dark:bg-emerald-950 dark:ring-1 dark:ring-emerald-700/50">
            <svg
              width="20"
              height="22"
              viewBox="0 0 24 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 1.75L3 5.5V12.2C3 17.85 6.84 23.02 12 24.5C17.16 23.02 21 17.85 21 12.2V5.5L12 1.75Z"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <rect
                x="8.75"
                y="11.5"
                width="6.5"
                height="5"
                rx="1"
                fill="#FFFFFF"
              />
              <path
                d="M10 11.5V9.8C10 8.7 10.9 7.8 12 7.8C13.1 7.8 14 8.7 14 9.8V11.5"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold leading-tight tracking-tight text-[#071121] dark:text-white">
              Vaultly
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              CUSTOMER PORTAL
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Financial Hub
        </p>
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard/customer'
                ? pathname === '/dashboard/customer'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition ${
                      isActive
                        ? 'text-white dark:text-slate-950'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white dark:bg-black/20 dark:text-slate-950'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Security Status Box */}
      <div className="mt-auto pt-4">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              256-Bit SSL Secured
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Your transactions and accounts are monitored under bank encryption.
          </p>
        </div>
      </div>
    </aside>
  );
}
