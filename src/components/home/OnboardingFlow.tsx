'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  UserPlus,
  Link2,
  Rocket,
  Clock,
  RefreshCw,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react';

interface StepItem {
  number: string;
  title: string;
  description: string;
  statusText: string;
  icon: LucideIcon;
  statusIcon: LucideIcon;
}

const stepsData: StepItem[] = [
  {
    number: '01',
    title: 'Create Your Account',
    description:
      'Sign up and configure your personal or institutional profile in minutes with streamlined, secure digital identity verification.',
    statusText: 'Average setup time: 3 mins',
    icon: UserPlus,
    statusIcon: Clock,
  },
  {
    number: '02',
    title: 'Access Your Banking',
    description:
      'Link external banks seamlessly, set up automated treasury vaults, and configure custom allocation percentages for savings goals.',
    statusText: 'Connects to 11,000+ banks',
    icon: Link2,
    statusIcon: RefreshCw,
  },
  {
    number: '03',
    title: 'Manage Your Money',
    description:
      'Track transactions live, issue deposits or withdrawals, and let intelligent rules automatically compound your cash reserves.',
    statusText: 'Ready for full operations',
    icon: Rocket,
    statusIcon: CheckCircle2,
  },
];

const OnboardingFlow = () => {
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
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="w-full bg-[#f8fafc] py-20 transition-colors duration-200 dark:bg-slate-950/60 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            ONBOARDING FLOW
          </span>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#071121] dark:text-white sm:text-4xl">
            Getting Started Is Simple
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
            Three effortless steps to take decisive control of your financial
            journey in under five minutes.
          </p>
        </div>

        {/* 3 Steps Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {stepsData.map((step, index) => {
            const Icon = step.icon;
            const StatusIcon = step.statusIcon;

            return (
              <div
                key={step.number}
                style={{ transitionDelay: `${index * 130}ms` }}
                className={`group flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-7 shadow-xs transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800/70 ${
                  inView
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                }`}
              >
                <div>
                  {/* Top Number & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-200 transition-colors duration-300 group-hover:text-emerald-500/40 dark:text-slate-700 dark:group-hover:text-emerald-400/40">
                      {step.number}
                    </span>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#071121] transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-400">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-6 text-lg font-bold text-[#071121] dark:text-white">
                    {step.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Status */}
                <div className="mt-6 flex items-center gap-2 pt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <StatusIcon className="h-3.5 w-3.5 shrink-0 transition-transform duration-500 group-hover:rotate-12" />
                  <span>{step.statusText}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OnboardingFlow;
