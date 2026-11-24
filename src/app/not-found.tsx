import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Home,
  LayoutDashboard,
  ArrowRight,
  ArrowLeft,
  Compass,
} from 'lucide-react';

export const metadata = {
  title: '404 - Page Not Found • Vaultly Digital Banking',
  description: 'The requested banking resource could not be found.',
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-[#f8fafc] px-4 py-16 text-center dark:bg-[#070d18] sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-md">
        {/* Animated Badge Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 shadow-sm ring-1 ring-amber-200 dark:bg-amber-950/60 dark:ring-amber-900/60">
          <ShieldAlert className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Big Code */}
        <div className="mt-6 font-mono text-6xl font-black tracking-tight text-slate-900 dark:text-white sm:text-7xl">
          404
        </div>

        <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Financial Ledger Path Not Found
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
          The banking resource, ledger route, or transaction portal you are trying to reach does not exist or has been relocated to another endpoint.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#071121] px-6 py-3.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-[#0b1a33] hover:shadow-lg active:scale-[0.98] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-bold text-slate-700 shadow-xs transition-all duration-200 hover:scale-[1.02] hover:bg-slate-50 hover:shadow-md active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Access Dashboard</span>
          </Link>
        </div>

        {/* Secondary Links */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs font-semibold text-slate-400">
          <Link href="/services" className="hover:text-slate-700 dark:hover:text-slate-200">
            Services
          </Link>
          <span>•</span>
          <Link href="/features" className="hover:text-slate-700 dark:hover:text-slate-200">
            Features
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-slate-700 dark:hover:text-slate-200">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
