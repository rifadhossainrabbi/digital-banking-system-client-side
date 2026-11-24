import React from 'react';
import Link from 'next/link';
import {
  ArrowRightLeft,
  ShieldCheck,
  CreditCard,
  FileSpreadsheet,
  Zap,
  Lock,
  BarChart3,
  Download,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'Features • Vaultly Digital Banking',
  description: 'Explore the full spectrum of modern digital banking features engineered for security, speed, and intelligence.',
};

export default function FeaturesPage() {
  const featureList = [
    {
      icon: ArrowRightLeft,
      title: 'Atomic Fund Transfers',
      badge: 'Zero-Loss Guarantee',
      desc: 'Transfers execute atomically across sender and recipient balances. If any step fails, funds are guaranteed to remain untouched.',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200/60 dark:border-emerald-900/40',
    },
    {
      icon: CreditCard,
      title: 'Multi-Account Provisioning',
      badge: 'Savings • Current • Business',
      desc: 'Instantly open and manage multiple accounts under a unified identity. Switch accounts seamlessly with custom daily and single-transaction limits.',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200/60 dark:border-blue-900/40',
    },
    {
      icon: FileSpreadsheet,
      title: 'Intelligent Loan Lifecycle',
      badge: 'Automated EMI Schedules',
      desc: 'Apply for personal and commercial credit with flexible tenures. View real-time repayment schedules, track outstanding balances, and pay EMIs with a click.',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200/60 dark:border-amber-900/40',
    },
    {
      icon: AlertTriangle,
      title: 'Rule-Based Fraud Detection',
      badge: 'Compliance & Audit',
      desc: 'High-frequency velocity checks and suspicious pattern heuristics automatically flag abnormal transactions for compliance officer review.',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200/60 dark:border-rose-900/40',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Financial Analytics',
      badge: 'Recharts Visualizations',
      desc: 'Dynamic monthly cash flow charts, deposit vs withdrawal volume metrics, and loan portfolio distributions powered by live database aggregations.',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200/60 dark:border-purple-900/40',
    },
    {
      icon: Download,
      title: 'Statements & Receipts',
      badge: 'RFC 4180 CSV & Vouchers',
      desc: 'Download date-filtered ledger statements in universal CSV format, along with generated cryptographic transaction receipt vouchers for record keeping.',
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-200/60 dark:border-teal-900/40',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d18]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white px-4 py-20 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Fintech Engine Architecture
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Built for Modern Banking Operations
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
            Experience high-performance digital banking workflows engineered with Next.js App Router, atomic MongoDB transactions, and multi-tier role authorization.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#071121] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-[#0b1a33] hover:shadow-lg active:scale-[0.98] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            >
              <span>Open An Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-xs transition-all duration-200 hover:scale-[1.02] hover:bg-slate-50 hover:shadow-md active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Explore Banking Services
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featureList.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group rounded-3xl border bg-white p-7 shadow-xs transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:bg-slate-900/80 ${f.border}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-2xl p-3.5 ${f.bg} ${f.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {f.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
