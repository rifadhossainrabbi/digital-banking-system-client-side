'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Download,
  Plus,
  Send,
  ArrowDownLeft,
  FileText,
  SlidersHorizontal,
  Wallet,
  Lock,
} from 'lucide-react';

const velocityBars = [
  { label: 'Wk 1', height: 42, amount: '$1,420' },
  { label: '', height: 62, amount: '$2,110' },
  { label: 'Wk 2', height: 30, amount: '$980' },
  { label: '', height: 78, amount: '$2,640' },
  { label: 'Wk 3', height: 56, amount: '$1,890', activeDefault: true },
  { label: '', height: 36, amount: '$1,210' },
  { label: 'Wk 4', height: 46, amount: '$1,540' },
];

const InterfaceOverview = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [balanceDisplay, setBalanceDisplay] = useState(0);
  const [activeBarIndex, setActiveBarIndex] = useState(4); // Default Wk 3 bar

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Balance smooth count-up animation
  useEffect(() => {
    if (!inView) return;

    const target = 38420.5;
    const duration = 1400;
    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setBalanceDisplay(eased * target);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setBalanceDisplay(target);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [inView]);

  const formattedBalance = balanceDisplay.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#f8fafc] py-20 transition-colors duration-200 dark:bg-slate-950 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Row: Title & CTA */}
        <div
          className={`flex flex-col justify-between gap-6 transition-all duration-700 ease-out lg:flex-row lg:items-end ${
            inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              INTERFACE OVERVIEW
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#071121] dark:text-white sm:text-4xl">
              Complete Financial Visibility.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              Stay connected to your liquidity with real-time settlement
              telemetry, consolidated balances, and predictive spending curves.
            </p>
          </div>

          <Link
            href="/dashboard/customer"
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-[#071121] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            <span>Access Your Dashboard</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Dashboard Mockup Frame */}
        <div
          className={`mt-10 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/50 transition-all delay-150 duration-700 ease-out dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:p-8 ${
            inView
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-8 scale-[0.98] opacity-0'
          }`}
        >
          {/* Inner Top Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-[#071121] dark:bg-slate-800 dark:text-white">
                AV
              </div>
              <div>
                <h3 className="text-base font-bold text-[#071121] dark:text-white">
                  Welcome back, Alex
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Treasury Vault • Account #7702-8819
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download className="h-3.5 w-3.5" />
                Statements
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#071121] px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
              >
                <Plus className="h-3.5 w-3.5" />
                Deposit Funds
              </button>
            </div>
          </div>

          {/* 3 Dashboard Panels */}
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Panel 1: Total Net Position */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  TOTAL NET POSITION
                </p>
                <h4 className="mt-2 text-3xl font-extrabold tracking-tight text-[#071121] dark:text-white">
                  ${formattedBalance}
                </h4>
                <span className="mt-2.5 inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  +$2,840.10 this week
                </span>
              </div>

              {/* 4 Quick Actions */}
              <div className="mt-6 grid grid-cols-4 gap-2">
                {[
                  { label: 'Send', icon: Send },
                  { label: 'Receive', icon: ArrowDownLeft },
                  { label: 'Request', icon: FileText },
                  { label: 'Limits', icon: SlidersHorizontal },
                ].map(action => {
                  const ActionIcon = action.icon;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200/70 bg-white py-2.5 text-[11px] font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
                    >
                      <ActionIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel 2: Allocated Vaults */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ALLOCATED VAULTS
              </p>

              <div className="mt-3.5 space-y-3">
                {/* Vault 1 */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white p-3.5 transition hover:border-slate-300 dark:border-slate-700/70 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#071121] dark:text-white sm:text-sm">
                        Operating Checking
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Daily liquidity
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-[#071121] dark:text-white sm:text-sm">
                    $14,220.50
                  </p>
                </div>

                {/* Vault 2 */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white p-3.5 transition hover:border-emerald-200 dark:border-slate-700/70 dark:bg-slate-900 dark:hover:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#071121] dark:text-white sm:text-sm">
                        Growth Reserve
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        4.85% APY yield
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-[#071121] dark:text-white sm:text-sm">
                    $24,200.00
                  </p>
                </div>
              </div>
            </div>

            {/* Panel 3: Spending Velocity Bar Chart */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  SPENDING VELOCITY
                </p>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  May 2026
                </span>
              </div>

              {/* Animated Bars */}
              <div className="mt-6 flex h-32 items-end gap-2.5">
                {velocityBars.map((bar, idx) => {
                  const isActive = activeBarIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onMouseEnter={() => setActiveBarIndex(idx)}
                      onClick={() => setActiveBarIndex(idx)}
                      aria-label={`Spend ${bar.amount}`}
                      className="group relative flex h-full flex-1 flex-col items-center justify-end focus:outline-none"
                    >
                      {/* Tooltip on hover/active */}
                      <span
                        className={`mb-1.5 rounded-md bg-[#071121] px-1.5 py-0.5 text-[10px] font-semibold text-white transition-opacity dark:bg-slate-700 ${
                          isActive
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {bar.amount}
                      </span>

                      <div
                        style={{
                          height: inView ? `${bar.height}%` : '4%',
                          transitionDelay: `${idx * 70}ms`,
                        }}
                        className={`w-full rounded-t-md transition-all duration-700 ease-out ${
                          isActive
                            ? 'bg-[#071121] dark:bg-emerald-400'
                            : 'bg-slate-200 group-hover:bg-slate-300 dark:bg-slate-700 dark:group-hover:bg-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Week Labels */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Wk 1</span>
                <span>Wk 2</span>
                <span>Wk 3</span>
                <span>Wk 4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InterfaceOverview;
