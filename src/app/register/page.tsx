'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  PiggyBank,
  Loader2,
} from 'lucide-react';

type RegistrationRole = 'Customer' | 'Bank Staff';
type AccountType = 'Savings Account' | 'Current Account' | 'Business Account';

const ACCOUNT_TYPES: {
  id: AccountType;
  title: string;
  badge: string;
  desc: string;
  limits: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'Savings Account',
    title: 'Savings Account',
    badge: '3.5% APY',
    desc: 'High-yield personal savings with compound interest growth.',
    limits: '$5,000 Daily Limit • $50 Min Balance',
    icon: PiggyBank,
  },
  {
    id: 'Current Account',
    title: 'Current Account',
    badge: 'Everyday Checking',
    desc: 'Flexible daily transactions with zero monthly maintenance fee.',
    limits: '$15,000 Daily Limit • $100 Min Balance',
    icon: CreditCard,
  },
  {
    id: 'Business Account',
    title: 'Business Account',
    badge: 'Enterprise & SMEs',
    desc: 'Dedicated commercial account for payroll, invoicing, and high-volume wires.',
    limits: '$50,000 Daily Limit • $500 Min Balance',
    icon: Building,
  },
];

const RegisterPage = () => {
  const [role, setRole] = useState<RegistrationRole>('Customer');
  const [accountType, setAccountType] = useState<AccountType>('Savings Account');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedState, setSubmittedState] = useState<{
    role: RegistrationRole;
    email: string;
    accountType?: AccountType;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          accountType: role === 'Customer' ? accountType : undefined,
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      setSubmittedState({
        role,
        email: email.trim().toLowerCase(),
        accountType: role === 'Customer' ? accountType : undefined,
      });
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      // Store chosen account type in cookie so Google signIn callback applies it
      document.cookie = `vaultly_account_type=${encodeURIComponent(
        accountType
      )}; path=/; max-age=3600; SameSite=Lax`;

      await signIn('google', { callbackUrl: '/dashboard/customer' });
    } catch {
      setError('Google Sign Up failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  // Submission Confirmation View
  if (submittedState) {
    const isStaff = submittedState.role === 'Bank Staff';

    return (
      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white px-4 py-12 transition-colors duration-200 dark:bg-slate-950">
        <div className="w-full max-w-[460px] rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
              isStaff
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
            }`}
          >
            {isStaff ? (
              <Clock className="h-7 w-7" />
            ) : (
              <CheckCircle2 className="h-7 w-7" />
            )}
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#0b162c] dark:text-white">
            {isStaff ? 'Pending Admin Approval' : 'Account Created!'}
          </h2>

          <p className="mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {isStaff ? (
              <>
                Your Bank Staff registration for{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {submittedState.email}
                </span>{' '}
                has been submitted. An <strong>Admin</strong> must review and
                approve your request before you can log in to the Staff Portal.
              </>
            ) : (
              <>
                Welcome to Vaultly! Your{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {submittedState.accountType || 'Savings Account'}
                </span>{' '}
                has been provisioned with a $1,000 welcome opening deposit. Sign in
                to access your customer dashboard.
              </>
            )}
          </p>

          {isStaff && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              Status: Awaiting Admin Approval
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3">
            <Link
              href="/login"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0b162c] py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-[#132240] hover:shadow-md active:scale-[0.98] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => setSubmittedState(null)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              Register another account
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white px-4 py-12 transition-colors duration-200 dark:bg-slate-950">
      <div className="w-full max-w-[480px]">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-[#0b162c] dark:text-white">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Open a high-security digital banking account in minutes.
          </p>
        </div>

        {/* Role Selector (Customer vs Bank Staff) */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Account Role
          </label>
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#f1f5f9] p-1.5 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => {
                setRole('Customer');
                setError(null);
              }}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                role === 'Customer'
                  ? 'bg-white text-[#0b162c] shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <User className="h-4 w-4" />
              Customer
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('Bank Staff');
                setError(null);
              }}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                role === 'Bank Staff'
                  ? 'bg-white text-[#0b162c] shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Bank Staff
            </button>
          </div>
        </div>

        {/* Account Type Selection (Only for Customer) */}
        {role === 'Customer' && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Choose Account Type *
              </label>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Instant $1,000 Deposit Included
              </span>
            </div>
            <div className="space-y-2.5">
              {ACCOUNT_TYPES.map((t) => {
                const isSelected = accountType === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAccountType(t.id)}
                    className={`flex w-full cursor-pointer items-start gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500/50 dark:border-emerald-500 dark:bg-emerald-950/30'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`rounded-xl p-2.5 transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {t.title}
                        </span>
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {t.badge}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {t.desc}
                      </p>
                      <div className="mt-1 text-[11px] font-medium text-slate-400">
                        {t.limits}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bank Staff Notice */}
        {role === 'Bank Staff' && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs leading-relaxed text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Admin Approval Required:</strong> Bank Staff accounts
              remain in pending status until verified and approved by a System
              Admin.
            </span>
          </div>
        )}

        {/* Google Quick Sign-Up (with chosen account type) */}
        {role === 'Customer' && (
          <div className="mb-6">
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleSignUp}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-xs transition-all duration-200 hover:scale-[1.02] hover:bg-slate-50 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-600 dark:text-slate-300" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {isGoogleLoading
                  ? 'Connecting to Google...'
                  : `Sign up with Google (${accountType.split(' ')[0]})`}
              </span>
            </button>

            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              <span className="absolute bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:bg-slate-950">
                Or register with email
              </span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alexander Vance"
                className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="reg-email"
              className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Email address
            </label>
            <div className="relative flex items-center">
              <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="reg-password"
              className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:ring-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-200 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0b162c] py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-[#132240] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            <span>
              {isLoading
                ? 'Processing...'
                : role === 'Bank Staff'
                ? 'Submit Staff Application'
                : `Open ${accountType}`}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Bottom Info */}
        <div className="mt-7 space-y-4 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-[#0b162c] hover:underline dark:text-emerald-400"
            >
              Sign in
            </Link>
          </p>

          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <Shield className="h-3.5 w-3.5" />
            <span>Admin accounts are provisioned internally for security.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
