'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StatItem {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  subLabel: string;
  highlight?: boolean;
}

const statsData: StatItem[] = [
  {
    target: 25,
    suffix: 'K+',
    label: 'Active Customers',
    subLabel: 'Across 42 countries',
    highlight: true,
  },
  {
    target: 30,
    suffix: 'K+',
    label: 'Accounts Managed',
    subLabel: 'Personal & Corporate',
    highlight: false,
  },
  {
    target: 48,
    prefix: '$',
    suffix: 'M+',
    label: 'Managed Balance',
    subLabel: 'FDIC insured backing',
    highlight: true,
  },
  {
    target: 99.9,
    decimals: 1,
    suffix: '%',
    label: 'Platform Availability',
    subLabel: 'Zero downtime SLA',
    highlight: false,
  },
];

interface AnimatedCounterProps {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  startAnimation: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  decimals = 0,
  prefix = '',
  suffix = '',
  startAnimation,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startAnimation) return;

    // ইউজার যদি reduced motion অন করে রাখে, তাহলে সরাসরি টার্গেট দেখাবে
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    let animationFrameId: number;
    const duration = 1600; // অ্যানিমেশন সময় (ms)
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic effect
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = easedProgress * target;

      setCount(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [startAnimation, target]);

  const formattedValue =
    decimals > 0 ? count.toFixed(decimals) : Math.round(count).toString();

  return (
    <span>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};

const Stats = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // একবার অ্যানিমেশন চলার পর অবজার্ভার বন্ধ হবে
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full border-y border-slate-100 bg-white py-12 transition-colors duration-200 dark:border-slate-800/80 dark:bg-slate-950 sm:py-16"
    >
      <div className="mx-auto container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
          {statsData.map((stat, index) => (
            <div
              key={stat.label}
              style={{ transitionDelay: `${index * 120}ms` }}
              className={`group flex flex-col items-center justify-center px-6 text-center transition-all duration-700 ease-out ${
                inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              } ${
                index !== statsData.length - 1
                  ? 'lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800'
                  : ''
              }`}
            >
              <h3 className="text-3xl font-extrabold tracking-tight text-[#071121] transition-transform duration-300 group-hover:scale-105 dark:text-white sm:text-4xl">
                <AnimatedCounter
                  target={stat.target}
                  decimals={stat.decimals}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  startAnimation={inView}
                />
              </h3>

              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                {stat.label}
              </p>

              <p
                className={`mt-1 text-xs font-medium ${
                  stat.highlight
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {stat.subLabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
