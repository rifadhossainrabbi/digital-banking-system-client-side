'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

type RegistrationRole = 'Customer' | 'Bank Staff';

const RegisterPage = () => {
  const [role, setRole] = useState<RegistrationRole>('Customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedState, setSubmittedState] = useState<{
    role: RegistrationRole;
    email: string;
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

      setSubmittedState({ role, email: email.trim().toLowerCase() });
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // সফলভাবে সাবমিট করার পর কনফার্মেশন ভিউ
  if (submittedState) {
    const isStaff = submittedState.role === 'Bank Staff';

    return (
      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white px-4 py-12 transition-colors duration-200 dark:bg-slate-950">
        <div className="w-full max-w-[440px] rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
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
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Savings Account
                </span>{' '}
                is ready. You can now sign in to access your digital banking
                dashboard.
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b162c] py-3 text-sm font-semibold text-white transition hover:bg-[#132240] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
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
      <div className="w-full max-w-[430px]">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-[#0b162c] dark:text-white">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Register as a Customer or apply for a Bank Staff account.
          </p>
        </div>

        {/* Role Selector (Only Customer & Bank Staff allowed) */}
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
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
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
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
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

        {/* Admin Approval Notice for Bank Staff */}
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

        {/* Error Banner */}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Registration Form (Only Name, Email, Password) */}
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
                onChange={e => setFullName(e.target.value)}
                placeholder="Alexander Vance"
                className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:ring-slate-800"
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
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:ring-slate-800"
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
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:ring-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
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
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b162c] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#132240] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            <span>
              {isLoading
                ? 'Processing...'
                : role === 'Bank Staff'
                  ? 'Submit Staff Application'
                  : 'Create Customer Account'}
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
