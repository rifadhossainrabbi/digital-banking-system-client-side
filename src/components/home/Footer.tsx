'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Share2, Globe, MessageSquare } from 'lucide-react';

const footerColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'Platform Features', href: '/features' },
      { label: 'Banking Services', href: '/services' },
      { label: 'About Vaultly', href: '/about' },
      { label: 'Contact Support', href: '/contact' },
    ],
  },
  {
    title: 'Banking',
    links: [
      { label: 'Savings Accounts', href: '/services' },
      { label: 'Current Accounts', href: '/services' },
      { label: 'Commercial Business', href: '/services' },
      { label: 'Loans & EMI', href: '/dashboard/customer' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help & FAQ', href: '/contact' },
      { label: 'Branch VLT-NYC-01', href: '/contact' },
      { label: 'Security Pillars', href: '/about' },
      { label: 'System Portal', href: '/login' },
    ],
  },
];

const socialButtons = [
  { label: 'Share Vaultly', icon: Share2, href: '#' },
  { label: 'Global Presence', icon: Globe, href: '#' },
  { label: 'Contact Support', icon: MessageSquare, href: '/#contact' },
];

const Footer = () => {
  const footerRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = footerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="w-full border-t border-slate-200/80 bg-[#f8fafc] pt-16 pb-10 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Grid: Brand + 3 Link Columns */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Brand Info & Icons */}
          <div
            className={`lg:col-span-5 transition-all duration-700 ease-out ${
              inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071121] shadow-sm transition-transform duration-300 group-hover:scale-105 dark:bg-emerald-950 dark:ring-1 dark:ring-emerald-700/50">
                <svg
                  width="20"
                  height="22"
                  viewBox="0 0 24 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 1.75L3 5.5V12.2C3 17.85 6.84 23.02 12 24.5C17.16 23.02 21 17.85 21 12.2V5.5L12 1.75Z"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="8.75"
                    y="11.5"
                    width="6.5"
                    height="5"
                    rx="1"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M10 11.5V9.8C10 8.7 10.9 7.8 12 7.8C13.1 7.8 14 8.7 14 9.8V11.5"
                    stroke="#FFFFFF"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-[#071121] dark:text-white">
                Vaultly
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
              Engineered for discerning individuals and enterprises seeking
              uncompromising security, effortless capital orchestration, and
              institutional clarity.
            </p>

            {/* 3 Icon Buttons */}
            <div className="mt-6 flex items-center gap-2.5">
              {socialButtons.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: 3 Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {footerColumns.map((column, colIndex) => (
              <div
                key={column.title}
                style={{ transitionDelay: `${(colIndex + 1) * 100}ms` }}
                className={`transition-all duration-700 ease-out ${
                  inView
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-6 opacity-0'
                }`}
              >
                <h3 className="text-sm font-bold text-[#071121] dark:text-white">
                  {column.title}
                </h3>

                <ul className="mt-4 space-y-3">
                  {column.links.map(link => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-block text-xs font-medium text-slate-500 transition-all duration-200 hover:translate-x-1 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 sm:text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div
          className={`mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-7 transition-all delay-300 duration-700 dark:border-slate-800 sm:flex-row ${
            inView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2026 Vaultly Digital Banking. All rights reserved. Member FDIC.
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 dark:text-slate-500">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-[#071121] dark:hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-[#071121] dark:hover:text-white"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/#security"
              className="transition-colors hover:text-[#071121] dark:hover:text-white"
            >
              Security Disclosures
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
