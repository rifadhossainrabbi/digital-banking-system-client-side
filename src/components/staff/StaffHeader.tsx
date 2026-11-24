'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  Briefcase,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobile?: () => void;
  staffName?: string;
  staffEmail?: string;
}

export default function StaffHeader({
  onOpenMobile,
  staffName = 'Bank Staff Officer',
  staffEmail = 'staff@vaultly.bank',
}: HeaderProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-6 lg:px-8">
      {/* Left Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          aria-label="Open staff navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Teller & Ops Hub:
          </span>
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            Active Session
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Back to Home Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 sm:flex"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Public Portal</span>
        </Link>

        {/* Staff Profile Pill */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-xs font-bold uppercase tracking-wider text-white shadow-xs dark:bg-amber-600">
            {getInitials(staffName)}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {staffName}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400">
              {staffEmail}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
