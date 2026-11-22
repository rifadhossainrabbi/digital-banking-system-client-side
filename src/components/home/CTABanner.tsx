'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CTABanner = () => {
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
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="w-full bg-[#f8fafc] py-16 transition-colors duration-200 dark:bg-slate-950 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#040d1a] via-[#081729] to-[#0b2327] px-6 py-14 text-center shadow-2xl transition-all duration-700 ease-out sm:px-12 sm:py-20 ${
            inView
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-8 scale-[0.97] opacity-0'
          }`}
        >
          {/* Ambient Animated Top Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 animate-pulse rounded-full bg-emerald-500/15 blur-[100px] [animation-duration:4s]"
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            {/* Top Badge */}
            <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-950/60 px-4 py-1 text-xs font-semibold text-emerald-400">
              Seamless Banking Awaits
            </span>

            {/* Heading */}
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Your Banking Experience Starts Here.
            </h2>

            {/* Subtitle */}
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300/90 sm:text-base">
              Discover an uncompromising standard for digital banking, built for
              clarity, institutional safety, and everyday financial speed.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-[#022c1e] px-6 py-3 text-sm font-semibold text-[#34d399] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#033d2a] sm:w-auto"
              >
                <span>Create Your Account</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-700 sm:w-auto"
              >
                Sign In
              </Link>
            </div>

            {/* Bottom Trust Line */}
            <p className="mt-7 text-xs text-slate-400">
              No credit score impact • Setup completes in 3 minutes • Member
              FDIC
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
