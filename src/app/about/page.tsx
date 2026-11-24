import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Users2,
  Award,
  Lock,
  ArrowRight,
  Landmark,
  FileCheck2,
} from 'lucide-react';

export const metadata = {
  title: 'About Us • Vaultly Digital Bank',
  description: 'Our mission, security governance, and digital banking technology.',
};

export default function AboutPage() {
  const stats = [
    { label: 'Active Capital Backing', value: '$2.4B+' },
    { label: 'System Uptime SLA', value: '99.99%' },
    { label: 'Transactions Cleared', value: '1.2M+' },
    { label: 'Core Branch Center', value: 'VLT-NYC-01' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d18]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white px-4 py-20 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-bold text-purple-800 dark:border-purple-900/50 dark:bg-purple-950/50 dark:text-purple-300">
            <Landmark className="h-3.5 w-3.5" />
            Regulatory Governance & Innovation
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Pioneering The Future of Digital Banking
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Engineered with institutional cryptographic integrity, high-speed atomic transactions, and uncompromising transparency.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="mx-auto -mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story & Core Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Engineered for absolute data consistency and customer sovereignty
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Vaultly was conceived with one foundational directive: eradicate the latency, opacity, and vulnerability of legacy banking cores.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              By combining strict role-based authorization (Admin, Bank Staff, Customer), database transactions with atomic rollbacks, and instant cryptographic receipt hashing, we ensure your finances are continuously protected.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <Link
                href="/register"
                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#071121] px-6 py-3.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-[#0b1a33] hover:shadow-lg active:scale-[0.98] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
              >
                <span>Join Vaultly</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <Lock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                Cryptographic PINs
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Every outbound fund transfer requires secure 4-digit bcrypt-hashed PIN authorization.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                3-Tier RBAC
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Server-side enforced access control across Admin, Bank Staff, and Customer zones.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                Branch Compliance
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Authorized staff review loan queues and flag suspicious transactions for compliance audit.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <FileCheck2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                Immutable Ledger
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Permanent audit preservation for all deposits, withdrawals, transfers, and loans.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
