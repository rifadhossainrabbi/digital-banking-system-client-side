'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowLeftRight,
  Repeat,
  BarChart2,
  Landmark,
  ShieldCheck,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';

interface CapabilityItem {
  title: string;
  description: string;
  ctaText: string;
  href: string;
  icon: LucideIcon;
}

const capabilitiesData: CapabilityItem[] = [
  {
    title: 'Smart Accounts',
    description:
      'Consolidate multiple personal, business, or treasury banking accounts and monitor combined net worth in real-time.',
    ctaText: 'Explore multi-tier accounts',
    href: '/dashboard/customer',
    icon: Wallet,
  },
  {
    title: 'Easy Transfers',
    description:
      'Move capital between internal accounts, linked external institutions, and international counterparties with zero latency.',
    ctaText: 'Instant routing engine',
    href: '/dashboard/customer',
    icon: ArrowLeftRight,
  },
  {
    title: 'Deposit & Withdraw',
    description:
      'Submit mobile check deposits, ACH transfers, and automated liquidity withdrawals with automated digital receipting.',
    ctaText: 'High daily limits',
    href: '/dashboard/customer',
    icon: Repeat,
  },
  {
    title: 'Transaction Insights',
    description:
      'Automated categorization, predictive burn rate analytics, and exportable financial reports designed for clean accounting.',
    ctaText: 'Real-time intelligence',
    href: '/dashboard/customer',
    icon: BarChart2,
  },
  {
    title: 'Loan Management',
    description:
      'Explore competitive personal and commercial credit lines, submit one-click applications, and track amortization schedules.',
    ctaText: 'Pre-approved credit tiers',
    href: '/dashboard/customer',
    icon: Landmark,
  },
  {
    title: 'Secure Banking',
    description:
      'Zero-trust architecture, multi-factor hardware key authorization, and adaptive behavioral anomaly detection.',
    ctaText: 'Bank-grade protocols',
    href: '/login',
    icon: ShieldCheck,
  },
];

const Capabilities = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

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
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="w-full bg-[#f8fafc] py-20 transition-colors duration-200 dark:bg-slate-950/60 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            CAPABILITIES
          </span>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#071121] dark:text-white sm:text-4xl">
            Everything You Need to Bank Smarter
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
            Powerful banking tools engineered to make managing your liquidity,
            allocations, and expenditures frictionless, auditable, and clear.
          </p>
        </div>

        {/* 6 Capability Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilitiesData.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                style={{ transitionDelay: `${index * 100}ms` }}
                className={`group flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-7 shadow-xs transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800/70 dark:hover:shadow-emerald-950/30 ${
                  inView
                    ? 'translate-y-0 scale-100 opacity-100'
                    : 'translate-y-8 scale-[0.98] opacity-0'
                }`}
              >
                <div>
                  {/* Icon Box */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#071121] transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Card Title */}
                  <h3 className="mt-6 text-lg font-bold text-[#071121] dark:text-white">
                    {item.title}
                  </h3>

                  {/* Card Description */}
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Link with Arrow Slide Animation */}
                <div className="mt-6 pt-2">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    <span>{item.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Capabilities;
