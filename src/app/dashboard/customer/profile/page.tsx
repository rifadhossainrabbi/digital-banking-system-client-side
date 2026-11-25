'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  KeyRound,
  Lock,
  Loader2,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import {
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
} from '@/redux/api/bankingApi';
import { useAppDispatch } from '@/redux/hooks';
import { fetchAccounts } from '@/redux/slices/accountSlice';
import toast from 'react-hot-toast';

export default function CustomerProfilePage() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetCustomerProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateCustomerProfileMutation();

  const profile = data?.profile;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Change PIN
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');

  // Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSaveBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      }).unwrap();
      toast.success(res.message || 'Profile updated successfully!');
      dispatch(fetchAccounts());
    } catch (err: unknown) {
      const msg =
        (err as { data?: { error?: string } })?.data?.error ||
        'Failed to update profile.';
      toast.error(msg);
    }
  };

  const handleToggle2FA = async () => {
    if (!profile) return;
    const nextState = !profile.twoFactorEnabled;
    try {
      const res = await updateProfile({ twoFactorEnabled: nextState }).unwrap();
      toast.success(
        nextState
          ? 'Two-Factor Authentication enabled for all transfers! (Demo OTP: 654321)'
          : 'Two-Factor Authentication disabled for standard transfers.',
      );
      void res;
    } catch (err: unknown) {
      const msg =
        (err as { data?: { error?: string } })?.data?.error ||
        'Failed to update 2FA setting.';
      toast.error(msg);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(newPin)) {
      toast.error('New PIN must be 4 to 6 numeric digits.');
      return;
    }
    try {
      const res = await updateProfile({
        action: 'change-pin',
        currentPin,
        newPin,
      }).unwrap();
      toast.success(res.message || 'Transaction PIN updated!');
      setCurrentPin('');
      setNewPin('');
    } catch (err: unknown) {
      const msg =
        (err as { data?: { error?: string } })?.data?.error ||
        'Failed to update PIN.';
      toast.error(msg);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    try {
      const res = await updateProfile({
        action: 'change-password',
        currentPassword,
        newPassword,
      }).unwrap();
      toast.success(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg =
        (err as { data?: { error?: string } })?.data?.error ||
        'Failed to update password.';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-xs text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <span className="mt-2">Loading profile & security settings...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Account Security & Preferences
          </span>
          {profile?.kycVerified && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              KYC Verified
            </span>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Profile & Security Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Manage your personal details, Transaction PIN, login password, and
          Two-Factor Authentication.
        </p>
      </div>

      {/* 1. Profile Details + 2FA Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <form
          onSubmit={handleSaveBasicInfo}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Personal Information
            </h2>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 p-3 font-mono text-slate-500 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold uppercase tracking-wider text-slate-400">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:text-slate-950"
            >
              {isUpdating ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* Two-Factor Authentication (2FA) */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Two-Factor Authentication (2FA)
              </h2>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Require an additional 6-digit verification code for every fund
              transfer (high-value transfers $5,000+ always enforce 2FA
              automatically).
            </p>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    2FA Protection Status
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Demo OTP Code:{' '}
                    <span className="font-mono font-bold">654321</span>
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    profile?.twoFactorEnabled
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {profile?.twoFactorEnabled ? 'Enabled' : 'Standard'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isUpdating}
            onClick={handleToggle2FA}
            className={`mt-6 w-full rounded-xl py-3 text-xs font-bold shadow-xs transition disabled:opacity-50 ${
              profile?.twoFactorEnabled
                ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                : 'bg-[#071121] text-white hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950'
            }`}
          >
            {profile?.twoFactorEnabled
              ? 'Disable Mandatory 2FA'
              : 'Enable Mandatory 2FA'}
          </button>
        </div>
      </div>

      {/* 2. Change Transaction PIN & Password */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Change PIN */}
        <form
          onSubmit={handleChangePin}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <KeyRound className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Change Transaction PIN
            </h2>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold uppercase tracking-wider text-slate-400">
                Current PIN (Default: 1234)
              </label>
              <input
                type="password"
                maxLength={6}
                required
                value={currentPin}
                onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono tracking-widest text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold uppercase tracking-wider text-slate-400">
                New 4-6 Digit PIN
              </label>
              <input
                type="password"
                maxLength={6}
                required
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono tracking-widest text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-amber-600 disabled:opacity-50"
            >
              Update Transaction PIN
            </button>
          </div>
        </form>

        {/* Change Password */}
        <form
          onSubmit={handleChangePassword}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Change Account Password
            </h2>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold uppercase tracking-wider text-slate-400">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold uppercase tracking-wider text-slate-400">
                New Password (Min. 8 chars)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
            >
              Update Login Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
