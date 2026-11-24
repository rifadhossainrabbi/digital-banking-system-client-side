'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Menu,
  ShieldCheck,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobile: () => void;
}

export default function AdminHeader({ onOpenMobile }: HeaderProps) {
  const { data: session } = useSession();

  const getInitials = (name?: string | null) => {
    if (!name || !name.trim()) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md transition-colors duration-200 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/90">
      {/* Left: Mobile Toggle & System Live Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open Navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs dark:border-rose-900/50 dark:bg-rose-950/40">
          <Activity className="h-3.5 w-3.5 animate-pulse text-rose-600 dark:text-rose-400" />
          <span className="font-semibold text-rose-800 dark:text-rose-300">
            Vaultly Banking Core • Production Active
          </span>
        </div>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Link to public homepage / customer preview */}
        <Link
          href="/"
          target="_blank"
          className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <span>View Public Site</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>

        {/* Admin Avatar & Role Badge */}
        <div className="flex items-center gap-2 pl-2">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name || 'Admin'}
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-rose-500/40"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-rose-900 font-mono text-xs font-bold text-white shadow-xs">
              {getInitials(user?.name)}
            </div>
          )}
          <div className="hidden text-left sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {user?.name || 'System Admin'}
            </p>
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-rose-600 dark:text-rose-400" />
              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                Administrator
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
