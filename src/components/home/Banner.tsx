'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Landmark,
  ShoppingBag,
  Cloud,
} from 'lucide-react';

const recentMovements = [
  {
    id: 1,
    title: 'Acme Corp - Payroll',
    subtitle: 'Direct Deposit • Today',
    amount: '+$3,200.00',
    positive: true,
    icon: Landmark,
  },
  {
    id: 2,
    title: 'Whole Foods Market',
    subtitle: 'Groceries • Yesterday',
    amount: '-$142.50',
    positive: false,
    icon: ShoppingBag,
  },
  {
    id: 3,
    title: 'Cloud Infrastructure',
    subtitle: 'Subscription • 2d ago',
    amount: '-$35.00',
    positive: false,
    icon: Cloud,
  },
];

// Stagger container & item variants (TypeScript-safe)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const Banner = () => {
  const [showBalance, setShowBalance] = useState(true);

  // Savings goal circular progress (92%)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (92 / 100) * circumference;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-white py-14 transition-colors duration-300 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:py-20 lg:py-24">
      {/* Subtle Animated Background Ambient Glow */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
        {/* Left Column: Staggered Hero Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6"
        >
          {/* Top Pill Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Smarter Digital Banking Platform</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-[#0b162c] dark:text-white sm:text-5xl lg:text-[3.4rem]"
          >
            Banking That{' '}
            <span className="text-emerald-600 dark:text-emerald-400">
              Moves With Your Life.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg"
          >
            Manage your money, track transactions, access institutional-grade
            banking services, and stay in absolute command of your financial
            trajectory—all unified within one calm, secure interface.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-[#071121] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-[#0f1f3a] hover:shadow-lg dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 text-emerald-400 transition-transform duration-200 group-hover:translate-x-1 dark:text-slate-950" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/features"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-[#0b162c] shadow-2xs transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Explore Features
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Secure Account Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Easy Money Management</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Real-Time Activity</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Interactive Dashboard Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:col-span-6"
        >
          <div className="relative mx-auto max-w-lg">
            {/* Floating Top-Right Notification Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, y: [0, -7, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.6 },
                x: { duration: 0.5, delay: 0.6 },
                y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="absolute -right-2 -top-6 z-20 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:-right-5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Transfer completed
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  $1,250.00 → Vault Savings
                </p>
              </div>
            </motion.div>

            {/* Main Dashboard Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-200/60 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:p-7">
              {/* Total Balance Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    TOTAL BALANCE
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBalance(prev => !prev)}
                    aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                    className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  >
                    {showBalance ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  +12.4% this month
                </span>
              </div>

              {/* Main Amount with AnimatePresence */}
              <div className="mt-2 flex items-baseline gap-2 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={showBalance ? 'visible' : 'hidden'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-3xl font-extrabold tracking-tight text-[#0b162c] dark:text-white sm:text-4xl"
                  >
                    {showBalance ? '$24,850.00' : '$••,•••.••'}
                  </motion.span>
                </AnimatePresence>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  USD
                </span>
              </div>

              {/* Monthly Income & Expenses Cards */}
              <div className="mt-5 grid grid-cols-2 gap-3.5">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="rounded-2xl bg-slate-50 p-3.5 transition-colors hover:bg-slate-100/80 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <ArrowDown className="h-3 w-3" />
                    <span>Monthly Income</span>
                  </div>
                  <p className="mt-1 text-base font-bold text-[#0b162c] dark:text-white sm:text-lg">
                    {showBalance ? '+$4,250.00' : '+$•,•••.••'}
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="rounded-2xl bg-slate-50 p-3.5 transition-colors hover:bg-slate-100/80 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <ArrowUp className="h-3 w-3" />
                    <span>Expenses</span>
                  </div>
                  <p className="mt-1 text-base font-bold text-[#0b162c] dark:text-white sm:text-lg">
                    {showBalance ? '-$1,820.00' : '-$•,•••.••'}
                  </p>
                </motion.div>
              </div>

              {/* Framer Motion Animated Sparkline Chart */}
              <div className="relative mt-5 h-20 w-full">
                <svg
                  viewBox="0 0 400 85"
                  className="h-full w-full overflow-visible"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id="vaultlyChartFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#10b981"
                        stopOpacity="0.22"
                      />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area Fade In */}
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    d="M0 72 C 55 70, 90 54, 140 44 C 195 33, 225 56, 275 46 C 325 36, 345 14, 392 22 L 392 85 L 0 85 Z"
                    fill="url(#vaultlyChartFill)"
                  />

                  {/* Path Length Drawing Animation */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: {
                        duration: 1.4,
                        delay: 0.35,
                        ease: 'easeOut',
                      },
                      opacity: { duration: 0.2, delay: 0.35 },
                    }}
                    d="M0 72 C 55 70, 90 54, 140 44 C 195 33, 225 56, 275 46 C 325 36, 345 14, 392 22"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="dark:stroke-emerald-400"
                  />

                  {/* Pulsing Live End Point */}
                  <motion.circle
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{
                      delay: 1.5,
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    cx="392"
                    cy="22"
                    r="6"
                    className="fill-emerald-400/50"
                  />
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4, type: 'spring' }}
                    cx="392"
                    cy="22"
                    r="4"
                    className="fill-[#071121] stroke-emerald-400 stroke-2 dark:fill-emerald-300"
                  />
                </svg>
              </div>

              {/* Recent Movements */}
              <div className="mt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    RECENT MOVEMENTS
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live feed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {recentMovements.map((tx, index) => {
                    const Icon = tx.icon;
                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.5 + index * 0.12,
                        }}
                        whileHover={{ x: 4 }}
                        className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50/90 px-3.5 py-2.5 transition-colors hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-2xs dark:bg-slate-900 dark:text-slate-300">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white sm:text-sm">
                              {tx.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {tx.subtitle}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold sm:text-sm ${
                            tx.positive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {tx.amount}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Floating Bottom-Left Savings Goal Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, y: [0, 7, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.7 },
                x: { duration: 0.5, delay: 0.7 },
                y: {
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                },
              }}
              className="mt-4 flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:absolute sm:-bottom-6 sm:-left-6 sm:mt-0"
            >
              {/* Animated Circular 92% Progress Ring */}
              <div className="relative flex h-12 w-12 items-center justify-center">
                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    strokeWidth="4"
                    fill="none"
                    className="stroke-slate-100 dark:stroke-slate-800"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r={radius}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: progressOffset }}
                    transition={{ duration: 1.3, delay: 0.7, ease: 'easeOut' }}
                    className="stroke-emerald-600 dark:stroke-emerald-400"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-[#0b162c] dark:text-white">
                  92%
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Primary Savings Goal
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  $18,400 of $20,000 funded
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Banner;
