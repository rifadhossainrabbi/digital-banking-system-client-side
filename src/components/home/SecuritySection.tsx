'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Fingerprint, Radar, Lock } from 'lucide-react';

const SecuritySection = () => {
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
      id="security"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#040d1a] py-20 text-white sm:py-28"
    >
      {/* Ambient Top-Right Emerald Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-[380px] w-[380px] rounded-full bg-teal-500/5 blur-[100px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div
          className={`max-w-2xl transition-all duration-700 ease-out ${
            inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            SecOps Core Security
          </span>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your Security Is Always a Priority.
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            Constructed with strict zero-trust parameters, institutional
            cryptography, and segregated custody to guarantee your wealth
            remains untouchable.
          </p>
        </div>

        {/* Main Grid: Left Cards + Right Vault Guard */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (7 cols) */}
          <div className="flex flex-col gap-5 lg:col-span-7">
            {/* Top 2 Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Card 1: Protected Account Access */}
              <div
                style={{ transitionDelay: '120ms' }}
                className={`group rounded-2xl border border-slate-800/80 bg-[#0b1526]/90 p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-[#0e1b30] hover:shadow-lg hover:shadow-emerald-950/40 ${
                  inView
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-6 opacity-0'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-950/70 text-emerald-400 transition-transform duration-300 group-hover:scale-110">
                  <Fingerprint className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-base font-bold text-white sm:text-lg">
                  Protected Account Access
                </h3>

                <p className="mt-2.5 text-xs leading-relaxed text-slate-400 sm:text-sm">
                  Biometric multi-layer verification, hardware security key
                  (FIDO2) compatibility, and immediate step-up authentication on
                  sensitive requests.
                </p>
              </div>

              {/* Card 2: Activity Monitoring */}
              <div
                style={{ transitionDelay: '220ms' }}
                className={`group rounded-2xl border border-slate-800/80 bg-[#0b1526]/90 p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-[#0e1b30] hover:shadow-lg hover:shadow-emerald-950/40 ${
                  inView
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-6 opacity-0'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-950/70 text-emerald-400 transition-transform duration-300 group-hover:scale-110">
                  <Radar className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-base font-bold text-white sm:text-lg">
                  Activity Monitoring
                </h3>

                <p className="mt-2.5 text-xs leading-relaxed text-slate-400 sm:text-sm">
                  Machine learning surveillance scans transaction telemetry
                  24/7, catching anomalous patterns, geofence breaches, and
                  rapid withdrawal bursts.
                </p>
              </div>
            </div>

            {/* Bottom Wide Card: Privacy Focused & Encrypted */}
            <div
              style={{ transitionDelay: '320ms' }}
              className={`group flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-[#0b1526]/90 p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-[#0e1b30] hover:shadow-lg hover:shadow-emerald-950/40 sm:flex-row sm:items-center ${
                inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-950/70 text-emerald-400 transition-transform duration-300 group-hover:scale-110">
                <Lock className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white sm:text-lg">
                  Privacy Focused & Encrypted
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400 sm:text-sm">
                  AES-256 at-rest storage and TLS 1.3 transport isolation. We do
                  not sell user behavioral insights or market data pipelines.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Vaultly Vault Guard Animated Card */}
          <div
            style={{ transitionDelay: '260ms' }}
            className={`lg:col-span-5 transition-all duration-700 ease-out ${
              inView
                ? 'translate-y-0 scale-100 opacity-100'
                : 'translate-y-8 scale-95 opacity-0'
            }`}
          >
            <div className="group relative flex h-full min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-800/90 bg-[#0b1526]/95 p-8 text-center shadow-2xl transition-colors duration-300 hover:border-emerald-500/30">
              {/* Subtle Inner Background Glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              />

              {/* Animated Shield with Expanding Radar Rings */}
              <div className="relative flex items-center justify-center">
                {/* Outer Pulse Ring */}
                <span className="absolute h-24 w-24 animate-ping rounded-full bg-emerald-400/15 [animation-duration:2.8s]" />
                {/* Middle Soft Halo */}
                <span className="absolute h-24 w-24 rounded-full border border-emerald-400/20 bg-slate-800/40" />

                {/* Shield Emblem Container */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-slate-700/70 bg-slate-800/80 shadow-inner transition-transform duration-300 group-hover:scale-105">
                  {/* Custom Filled Mint Shield with Keyhole (Matches Image) */}
                  <svg
                    width="34"
                    height="38"
                    viewBox="0 0 24 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_0_12px_rgba(52,211,153,0.45)]"
                  >
                    <path
                      d="M12 1.5L3 5.2V12.2C3 17.9 6.84 23.1 12 24.5C17.16 23.1 21 17.9 21 12.2V5.2L12 1.5Z"
                      fill="#6ee7b7"
                    />
                    {/* Keyhole */}
                    <circle cx="12" cy="11.2" r="1.8" fill="#06221c" />
                    <path
                      d="M11.1 12.4L10.6 16.2H13.4L12.9 12.4H11.1Z"
                      fill="#06221c"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="relative mt-7 text-lg font-bold text-white sm:text-xl">
                Vaultly Vault Guard
              </h3>

              <p className="relative mt-1 text-xs font-medium text-emerald-400 sm:text-sm">
                Active Threat Elimination
              </p>

              {/* Status Badge */}
              <div className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-800/80 px-4 py-1.5 text-xs font-medium text-slate-300 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Zero vulnerabilities detected
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
