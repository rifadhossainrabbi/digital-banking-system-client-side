'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  CheckSquare,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

const navItems = [
  {
    name: 'Overview',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Customers',
    href: '/dashboard/admin/customers',
    icon: Users,
    badge: null,
  },
  {
    name: 'Bank Accounts',
    href: '/dashboard/admin/accounts',
    icon: CreditCard,
    badge: null,
  },
  {
    name: 'Transactions & Audit',
    href: '/dashboard/admin/transactions',
    icon: Receipt,
    badge: 'Audit',
  },
  {
    name: 'Loans & EMI',
    href: '/dashboard/admin/loans',
    icon: FileSpreadsheet,
    badge: null,
  },
  {
    name: 'Clearance Requests',
    href: '/dashboard/admin/requests',
    icon: CheckSquare,
    badge: null,
  },
  {
    name: 'Bank Staff',
    href: '/dashboard/admin/staff',
    icon: UserCheck,
    badge: null,
  },
];

export default function AdminSidebar({ onCloseMobile }: SidebarProps) {
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-700 to-rose-950 shadow-sm transition group-hover:scale-105 ring-1 ring-rose-500/50">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Vaultly<span className="text-rose-600">.</span>
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Management Console
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard/admin'
              ? pathname === '/dashboard/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-rose-50 text-rose-700 shadow-xs dark:bg-rose-950/50 dark:text-rose-400 dark:ring-1 dark:ring-rose-800/40'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Security Status Card */}
      <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5 dark:border-rose-900/30 dark:bg-rose-950/20">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          <span className="text-xs font-bold text-rose-900 dark:text-rose-300">
            System Control
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
          RBAC Role: <strong className="text-slate-900 dark:text-white">Admin (Full Control)</strong>
        </p>
      </div>

      {/* Footer / Logout */}
      <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="h-4 w-4" />
            <span>Sign Out Admin</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
