'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  PiggyBank,
  Send,
  FileText,
  CreditCard,
  ArrowRight,
  Lock,
  LucideIcon,
} from 'lucide-react';

interface ServiceFeature {
  title: string;
  badge: string;
  badgeHighlight?: boolean;
  description: string;
  icon: LucideIcon;
}

const serviceFeatures: ServiceFeature[] = [
  {
    title: 'Savings Accounts',
    badge: '4.85% APY',
    badgeHighlight: true,
    description:
      'High-yield interest tiers with dedicated goal-oriented sub-vaults and automatic round-ups.',
    icon: PiggyBank,
  },
  {
    title: 'Money Transfers',
    badge: 'Instant ACH',
    description:
      'Instant peer transfers, recurring payroll scheduling, and global SWIFT/SEPA rail clearance.',
    icon: Send,
  },
  {
    title: 'Deposit & Withdrawal Requests',
    badge: 'Verified',
    description:
      'Real-time status tracking, automated invoice reconciliations, and instant downloadable PDF receipts.',
    icon: FileText,
  },
  {
    title: 'Loan Applications',
    badge: 'Fixed Rate',
    description:
      'Transparent collateral requirements, rapid automated underwriting, and flexible repayment terms.',
    icon: CreditCard,
  },
];

const BankingServices = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  // 3D Tilt state for Vaultly Black Card
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
  });
  const [isHoveringCard, setIsHoveringCard] = useState(false);

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

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 10; // max 10deg
    const rotateX = -((y - centerY) / centerY) * 10;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY });
  };

  const handleCardMouseLeave = () => {
    setIsHoveringCard(false);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="w-full overflow-hidden bg-[#f8fafc] py-20 transition-colors duration-200 dark:bg-slate-950 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Heading + 4 Stacked Cards */}
          <div className="lg:col-span-6">
            <div
              className={`transition-all duration-700 ease-out ${
                inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              <span className="inline-flex rounded-full bg-slate-200/70 px-3.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Comprehensive Capabilities
              </span>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#071121] dark:text-white sm:text-4xl">
                Your Financial Tools, All in One Place.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
                From everyday liquid balances to yield-bearing vaults and
                flexible commercial lending, Vaultly converges distinct banking
                operations into an elegant, friction-free environment.
              </p>
            </div>

            {/* Stacked Feature List */}
            <div className="mt-8 space-y-3.5">
              {serviceFeatures.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                    className={`group flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-2xs transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800/70 sm:p-5 ${
                      inView
                        ? 'translate-x-0 opacity-100'
                        : '-translate-x-6 opacity-0'
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#071121] transition-colors duration-300 group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-400">
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#071121] dark:text-white sm:text-base">
                          {feature.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            feature.badgeHighlight
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {feature.badge}
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA Link */}
            <div
              className={`mt-7 transition-all delay-500 duration-700 ${
                inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 text-sm font-bold text-[#071121] transition-colors hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400"
              >
                <span>Explore all Banking Services</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Vaultly Black Card Widget */}
          <div
            className={`lg:col-span-6 transition-all delay-200 duration-700 ease-out ${
              inView
                ? 'translate-y-0 scale-100 opacity-100'
                : 'translate-y-8 scale-95 opacity-0'
            }`}
          >
            <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:p-5">
              {/* 3D Interactive Card Container */}
              <div
                style={{ perspective: '1000px' }}
                onMouseEnter={() => setIsHoveringCard(true)}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div
                  style={{
                    transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                    transition: isHoveringCard
                      ? 'transform 100ms ease-out'
                      : 'transform 500ms ease-out',
                  }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071121] via-[#0b192c] to-[#062621] p-6 text-white shadow-lg"
                >
                  {/* Dynamic Glare / Sheen on Hover */}
                  <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                    style={{
                      opacity: isHoveringCard ? 0.25 : 0.08,
                      background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(52, 211, 153, 0.55), transparent 60%)`,
                    }}
                  />

                  {/* Top Row: Brand & Contactless Icon */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Green Shield Lock Logo */}
                      <svg
                        width="20"
                        height="22"
                        viewBox="0 0 24 26"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 1.75L3 5.5V12.2C3 17.85 6.84 23.02 12 24.5C17.16 23.02 21 17.85 21 12.2V5.5L12 1.75Z"
                          stroke="#34d399"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <rect
                          x="8.75"
                          y="11.5"
                          width="6.5"
                          height="5"
                          rx="1"
                          fill="#34d399"
                        />
                        <path
                          d="M10 11.5V9.8C10 8.7 10.9 7.8 12 7.8C13.1 7.8 14 8.7 14 9.8V11.5"
                          stroke="#34d399"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-sm font-bold tracking-tight text-white">
                        Vaultly Black
                      </span>
                    </div>

                    {/* Contactless / NFC Icon */}
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="text-slate-300"
                      >
                        <path d="M8.5 16.5a6.5 6.5 0 0 1 0-9" />
                        <path d="M12 19a10 10 0 0 1 0-14" />
                        <path d="M15.5 21.5a13.5 13.5 0 0 1 0-19" />
                      </svg>
                    </div>
                  </div>

                  {/* EMV Chip */}
                  <div className="relative z-10 mt-7">
                    <div className="flex h-7 w-10 items-center justify-center rounded-md border border-white/25 bg-white/10">
                      <div className="h-4 w-6 rounded-xs border border-white/20" />
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className="relative z-10 mt-7 font-mono text-base font-medium tracking-[0.18em] text-slate-100 sm:text-lg">
                    4092 •••• •••• 8821
                  </div>

                  {/* Cardholder & Expiry */}
                  <div className="relative z-10 mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        CARDHOLDER
                      </p>
                      <p className="mt-0.5 text-xs font-bold tracking-wider text-white sm:text-sm">
                        ALEXANDER M. VANCE
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        EXPIRES
                      </p>
                      <p className="mt-0.5 font-mono text-xs font-bold text-white sm:text-sm">
                        09/29
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Spending Limit Bar */}
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3.5 transition-colors dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#071121] dark:text-white">
                      Card Spending Limit
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      $3,450 / $10,000 monthly used
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#071121] dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BankingServices;
