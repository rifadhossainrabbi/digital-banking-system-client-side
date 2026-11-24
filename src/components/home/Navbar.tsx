'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import {
  User,
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ArrowRight,
  CreditCard,
  ArrowRightLeft,
  Receipt,
  Banknote,
  FileSpreadsheet,
} from 'lucide-react';

type UserRole = 'Admin' | 'Bank Staff' | 'Customer';

interface NavUser {
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
}

interface NavbarProps {
  user?: NavUser | null;
  onLogout?: () => void;
}

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Banking Services', href: '/services' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const emptySubscribe = () => () => {};
function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const Navbar: React.FC<NavbarProps> = ({ user: propUser = null, onLogout }) => {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();

  const mounted = useMounted();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Active user from session or prop
  const user: NavUser | null =
    propUser ||
    (session?.user
      ? {
          name: session.user.name || 'User',
          email: session.user.email || '',
          role: (session.user.role as UserRole) || 'Customer',
          image: session.user.image || null,
        }
      : null);

  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'US';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await signOut({ callbackUrl: '/login' });
    }
  };



  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // ইউজারের রোল অনুযায়ী ড্যাশবোর্ড রুট নির্ধারণ
  const getDashboardHref = (role?: UserRole) => {
    switch (role) {
      case 'Admin':
        return '/dashboard/admin';
      case 'Bank Staff':
        return '/dashboard/staff';
      case 'Customer':
        return '/dashboard/customer';
      default:
        return '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo (Matches Image) */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071121] shadow-sm transition-transform duration-200 group-hover:scale-105 dark:bg-emerald-950 dark:ring-1 dark:ring-emerald-700/50">
            {/* Custom Shield with Padlock SVG matching the screenshot */}
            <svg
              width="22"
              height="24"
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
              {/* Padlock inside shield */}
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

          <div className="flex flex-col">
            <span className="text-xl font-bold leading-tight tracking-tight text-[#071121] dark:text-white">
              Vaultly
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              DIGITAL BANKING
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map(item => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'font-semibold text-[#071121] dark:text-white'
                    : 'text-slate-500 hover:text-[#071121] dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions + Theme Toggle + User Profile */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Dark or Light Mode"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {mounted ? (
              resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )
            ) : (
              <span className="h-4 w-4" />
            )}
          </button>

          {!user ? (
            <>
              {/* Login Button */}
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#071121] shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Login
              </Link>

              {/* Get Started Button */}
              <Link
                href="/register"
                className="rounded-xl bg-[#022c1e] px-5 py-2.5 text-sm font-semibold text-[#34d399] shadow-sm transition hover:bg-[#033d2a] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
              >
                Get Started
              </Link>
            </>
          ) : (
            <Link
              href={getDashboardHref(user.role)}
              className="flex items-center gap-2 rounded-xl bg-[#022c1e] px-4 py-2.5 text-sm font-semibold text-[#34d399] shadow-sm transition hover:bg-[#033d2a] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}

          {/* Circular User Avatar / Initials Button (Per Requirement) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen(prev => !prev)}
              aria-label="Account Menu"
              className="group flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-slate-200 transition hover:ring-emerald-500 focus:outline-hidden dark:ring-slate-800 dark:hover:ring-emerald-500"
            >
              {user ? (
                user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0b162c] to-[#043320] text-xs font-bold uppercase tracking-wider text-emerald-300 dark:from-emerald-950 dark:to-slate-900 dark:text-emerald-400">
                    {getInitials(user.name)}
                  </div>
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#071121] text-white dark:bg-slate-800">
                  <User className="h-4 w-4" />
                </div>
              )}
            </button>

            {/* Dropdown Menu for Quick Role/Auth Navigation */}
            {profileMenuOpen && (
              <div
                onMouseLeave={() => setProfileMenuOpen(false)}
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
              >
                {user ? (
                  <>
                    <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-bold text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                          <ShieldCheck className="h-3 w-3" />
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {/* Dedicated Customer Dashboard Navlink & Shortcuts */}
                    {user.role === 'Customer' ? (
                      <div className="space-y-0.5 py-1.5">
                        <Link
                          href="/dashboard/customer"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center justify-between rounded-xl bg-emerald-50/70 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                        >
                          <span className="flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Customer Dashboard
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </Link>

                        <Link
                          href="/dashboard/customer/accounts"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                          My Accounts
                        </Link>

                        <Link
                          href="/dashboard/customer/transfer"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400" />
                          Fund Transfer
                        </Link>

                        <Link
                          href="/dashboard/customer/transactions"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <Receipt className="h-3.5 w-3.5 text-slate-400" />
                          Transaction History
                        </Link>

                        <Link
                          href="/dashboard/customer/deposit-withdraw"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <Banknote className="h-3.5 w-3.5 text-slate-400" />
                          Deposit & Withdraw
                        </Link>

                        <Link
                          href="/dashboard/customer/loans"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" />
                          Loans & Repayments
                        </Link>
                      </div>
                    ) : (
                      <div className="py-1">
                        <Link
                          href={getDashboardHref(user.role)}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Go to Dashboard ({user.role})
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 p-1">
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Portal Access
                    </p>
                    <Link
                      href="/login"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Customer & Staff Login
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                    >
                      Open Bank Account
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Controls (Theme Toggle + Hamburger) */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            {mounted &&
              (resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              ))}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-6 pt-4 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <nav className="flex flex-col space-y-2">
            {navLinks.map(item => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-100 font-semibold text-[#071121] dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-200 pt-4 dark:border-slate-800">
            {!user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-center text-sm font-semibold text-[#071121] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-xl bg-[#022c1e] py-2.5 text-center text-sm font-semibold text-[#34d399] dark:bg-emerald-500 dark:text-slate-950"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-bold text-emerald-800 dark:bg-slate-800 dark:text-emerald-400">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  href={getDashboardHref(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-xl bg-[#022c1e] py-2.5 text-center text-sm font-semibold text-[#34d399] dark:bg-emerald-500 dark:text-slate-950"
                >
                  Dashboard ({user.role})
                </Link>

                {user.role === 'Customer' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/dashboard/customer/accounts"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      Accounts
                    </Link>
                    <Link
                      href="/dashboard/customer/transfer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      Transfer
                    </Link>
                    <Link
                      href="/dashboard/customer/transactions"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      Transactions
                    </Link>
                    <Link
                      href="/dashboard/customer/loans"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      Loans
                    </Link>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full rounded-xl border border-rose-200 py-2.5 text-center text-sm font-semibold text-rose-600 dark:border-rose-900 dark:text-rose-400"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
