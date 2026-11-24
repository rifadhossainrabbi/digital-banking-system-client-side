'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  ShieldCheck,
  Briefcase,
  User,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface DemoAccount {
  role: 'Admin' | 'Bank Staff' | 'Customer';
  email: string;
  password: string;
  badgeColor: string;
  icon: React.ElementType;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Admin',
    email: 'admin@vaultly.bank',
    password: 'Admin@1234',
    badgeColor:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
    icon: ShieldCheck,
  },
  {
    role: 'Bank Staff',
    email: 'staff@vaultly.bank',
    password: 'Staff@1234',
    badgeColor:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    icon: Briefcase,
  },
  {
    role: 'Customer',
    email: 'customer@vaultly.bank',
    password: 'Customer@1234',
    badgeColor:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    icon: User,
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filledRole, setFilledRole] = useState<string | null>(null);

  const errorParam = searchParams.get('error');
  const searchError = errorParam
    ? errorParam === 'OAuthSignin' ||
      errorParam === 'OAuthCallbackError' ||
      errorParam === 'Configuration'
      ? 'Google Authentication note: Please ensure your Google Client ID and Secret and Authorized Redirect URI (http://localhost:3000/api/auth/callback/google) are configured in Google Cloud Console.'
      : errorParam === 'CredentialsSignin'
        ? 'Invalid credentials or account awaiting admin approval.'
        : decodeURIComponent(errorParam)
    : null;

  const displayError = error || searchError;

  const handleFillDemo = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
    setFilledRole(account.role);
    setTimeout(() => setFilledRole(null), 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes('awaiting Admin approval')) {
          setError('Your staff account is awaiting Admin approval.');
        } else if (res.error.includes('deactivated or blocked')) {
          setError(
            'Your account has been deactivated or blocked. Please contact bank administration.'
          );
        } else if (res.error.includes('Google')) {
          setError(
            'This account was registered using Google. Please sign in with Google.'
          );
        } else {
          setError('Invalid email or password. Please verify your credentials.');
        }
        return;
      }

      router.refresh();
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError(
        'Google sign-in could not be initiated. Please verify your AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in your .env file.'
      );
      setIsGoogleLoading(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white px-4 py-12 transition-colors duration-200 dark:bg-slate-950">
      <div className="w-full max-w-[430px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#0b162c] dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to your Vaultly account to continue.
          </p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
            {displayError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Email address
            </label>
            <div className="relative flex items-center">
              <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:bg-slate-900 dark:focus:ring-slate-800"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-transparent bg-[#f1f5f9] py-3 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-700 dark:focus:bg-slate-900 dark:focus:ring-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#0b162c] focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:checked:bg-emerald-500"
              />
              <span>Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-[#0b162c] hover:underline dark:text-emerald-400"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b162c] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#132240] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
              </span>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* OR Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            OR
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Continue with Google Button */}
        <button
          type="button"
          disabled={isGoogleLoading || isLoading}
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#f1f5f9] py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200/80 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100 dark:ring-1 dark:ring-slate-800 dark:hover:bg-slate-800"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-600 dark:text-slate-300" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
          )}
          <span>
            {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </span>
        </button>

        {/* Bottom Info */}
        <div className="mt-7 space-y-4 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-[#0b162c] hover:underline dark:text-emerald-400"
            >
              Create an account
            </Link>
          </p>

          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <Shield className="h-3.5 w-3.5" />
            <span>Your information is encrypted and secure.</span>
          </p>
        </div>

        {/* Demo Credentials Box for Mentor / Evaluator */}
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Demo Access (For Evaluator)</span>
            </div>
            <span className="text-[11px] text-slate-400">Click to auto-fill</span>
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(acc => {
              const Icon = acc.icon;
              const isFilled = filledRole === acc.role;

              return (
                <div
                  key={acc.role}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/70 bg-white px-3 py-2.5 transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-800"
                >
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${acc.badgeColor}`}
                    >
                      <Icon className="h-3 w-3" />
                      {acc.role}
                    </span>
                    <p className="mt-1 truncate font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {acc.email}
                    </p>
                    <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      Pass: {acc.password}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFillDemo(acc)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isFilled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-[#0b162c] hover:bg-[#0b162c] hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-500 dark:hover:text-slate-950'
                    }`}
                  >
                    {isFilled ? (
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-3 w-3" /> Filled
                      </span>
                    ) : (
                      'Use'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0b162c] dark:text-emerald-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
