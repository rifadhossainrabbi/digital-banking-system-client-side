'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Receipt,
  FileSpreadsheet,
  Briefcase,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

const navItems = [
  {
    name: 'Overview',
    href: '/dashboard/staff',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Customer Operations',
    href: '/dashboard/staff/customers',
    icon: Users,
    badge: null,
  },
  {
    name: 'Transactions & Audit',
    href: '/dashboard/staff/transactions',
    icon: Receipt,
    badge: null,
  },
  {
    name: 'Loan Assistance',
    href: '/dashboard/staff/loans',
    icon: FileSpreadsheet,
    badge: 'Reviews',
  },
];

export default function StaffSidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white/95 px-4 py-6 backdrop-blur-md transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/95">
      {/* Brand & Portal Header */}
      <div className="mb-6 px-2">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={onCloseMobile}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 shadow-sm transition-transform duration-200 group-hover:scale-105 dark:bg-amber-600">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Vaultly
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Staff Operations
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Branch Badge */}
      <div className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">
        <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Branch Office</span>
          <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
            VLT-NYC-01
          </span>
        </div>
        <p className="mt-1 text-[11px] text-amber-900/70 dark:text-amber-400/80">
          Authorized Teller & Operational Desk
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Staff Console
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard/staff'
              ? pathname === '/dashboard/staff'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm dark:bg-amber-600'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="h-4 w-4 text-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Sign Out */}
      <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
