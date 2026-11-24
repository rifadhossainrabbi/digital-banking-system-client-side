import React from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Building,
  PiggyBank,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  BadgeCheck,
} from 'lucide-react';

export const metadata = {
  title: 'Banking Services • Vaultly Digital Banking',
  description: 'Comprehensive financial services for individuals, businesses, and enterprises.',
};

export default function ServicesPage() {
  const accounts = [
    {
      title: 'Savings Account',
      badge: 'Personal Growth',
      apy: '3.50% APY',
      desc: 'Engineered for individuals building their wealth with steady compound returns and zero hidden charges.',
      icon: PiggyBank,
      benefits: [
        'Initial $1,000 welcome opening deposit credited',
        'Daily transfer limit up to $5,000',
        'Single transaction limit of $2,000',
        'Free electronic statements & instant wire clearance',
      ],
      cta: 'Open Savings Account',
      popular: true,
    },
    {
      title: 'Current Account',
      badge: 'Everyday Liquidity',
      apy: 'Zero Maintenance',
      desc: 'Designed for daily operational transactions, high-frequency card operations, and continuous liquidity.',
      icon: CreditCard,
      benefits: [
        'Higher daily transfer threshold of $15,000',
        'Single transaction ceiling of $5,000',
        'Zero monthly ledger maintenance fees',
        'Instant multi-account intra-bank routing',
      ],
      cta: 'Open Current Account',
      popular: false,
    },
    {
      title: 'Business Account',
      badge: 'Commercial Enterprise',
      apy: 'Corporate Grade',
      desc: 'Full-spectrum commercial banking suite built for SMEs and corporate enterprises handling payroll and vendor wires.',
      icon: Building,
      benefits: [
        'High-capacity daily limit up to $50,000',
        'Single transaction volume up to $20,000',
        'Automated payroll and batch wire processing',
        'Priority branch officer support desk',
      ],
      cta: 'Open Business Account',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d18]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white px-4 py-20 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-300">
            <Globe2 className="h-3.5 w-3.5" />
            Institutional Banking Portfolio
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Tailored Financial Solutions
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            From personal high-yield savings to commercial accounts and structured credit assistance.
          </p>
        </div>
      </section>

      {/* Account Types Showcase */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {accounts.map((acc) => {
            const Icon = acc.icon;
            return (
              <div
                key={acc.title}
                className={`relative flex flex-col justify-between rounded-3xl border bg-white p-8 shadow-xs transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:bg-slate-900 ${
                  acc.popular
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {acc.popular && (
                  <span className="absolute -top-3.5 right-8 rounded-full bg-emerald-600 px-3.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-800 dark:bg-slate-800 dark:text-emerald-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {acc.apy}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                    {acc.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {acc.desc}
                  </p>

                  <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

                  <ul className="space-y-3">
                    {acc.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href={`/register`}
                    className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${
                      acc.popular
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400'
                        : 'border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{acc.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
