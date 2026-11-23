'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AdminChartsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monthlyActivity: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accountDistribution: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loanStats: any[];
}

const ACCOUNT_COLORS: Record<string, string> = {
  'Savings Account': '#10b981',
  'Current Account': '#0ea5e9',
  'Business Account': '#8b5cf6',
};

const LOAN_COLORS: Record<string, string> = {
  Active: '#10b981',
  Pending: '#f59e0b',
  'Under Review': '#3b82f6',
  Approved: '#06b6d4',
  Rejected: '#f43f5e',
  Completed: '#64748b',
};

export default function AdminCharts({
  monthlyActivity,
  accountDistribution,
  loanStats,
}: AdminChartsProps) {
  // Client mount state to guarantee pristine hydration
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Formatted Account Pie Data
  const accountPieData = React.useMemo(() => {
    if (!accountDistribution || accountDistribution.length === 0) {
      return [
        { name: 'Savings Account', value: 1, color: '#10b981' },
        { name: 'Business Account', value: 1, color: '#8b5cf6' },
      ];
    }
    return accountDistribution.map(item => ({
      name: item.type || 'Standard',
      value: item.count || 1,
      color: ACCOUNT_COLORS[item.type] || '#64748b',
      balance: item.totalBalance || 0,
    }));
  }, [accountDistribution]);

  // Formatted Loan Status Data
  const loanPieData = React.useMemo(() => {
    if (!loanStats || loanStats.length === 0) {
      return [
        { name: 'Active', value: 1, color: '#10b981' },
        { name: 'Pending', value: 1, color: '#f59e0b' },
      ];
    }
    return loanStats.map(item => ({
      name: item.status || 'Active',
      value: item.count || 1,
      color: LOAN_COLORS[item.status] || '#8b5cf6',
      totalAmount: item.totalAmount || 0,
    }));
  }, [loanStats]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-900 lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-900" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 1. Area Chart: Monthly Banking Cash Flow (Deposits vs Withdrawals) */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bank-Wide Cash Flow & Volume
            </h3>
            <p className="text-xs text-slate-400">
              6-Month trend of total customer deposits vs withdrawals
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Inflow (Deposits)
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Outflow (Withdrawals)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyActivity} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="adminDepositColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="adminWithdrawColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="deposit"
                name="Inflow ($)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#adminDepositColor)"
              />
              <Area
                type="monotone"
                dataKey="withdrawal"
                name="Outflow ($)"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#adminWithdrawColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Pie Chart: Account Types Distribution */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Account Distribution
        </h3>
        <p className="text-xs text-slate-400">
          Distribution of accounts by type
        </p>

        <div className="mt-2 flex h-48 items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={accountPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {accountPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {accountPieData.map(item => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {item.value} account{item.value !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Bottom Row: Loan Portfolio Approval Status */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Loan Portfolio Approval Statistics
            </h3>
            <p className="text-xs text-slate-400">
              Status breakdown of submitted banking credit applications
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {loanPieData.map(l => (
            <div
              key={l.name}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50"
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {l.name}
                </span>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                {l.value}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400 font-mono">
                ${(l.totalAmount || 0).toLocaleString()} volume
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
