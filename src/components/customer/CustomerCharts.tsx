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
import { BarChart3 } from 'lucide-react';

interface ChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[];
  activeAccountNumber?: string;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function CustomerCharts({
  transactions,
  activeAccountNumber,
}: ChartProps) {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
  }, []);

  // 1. Real 6-Month Monthly Deposit History vs Monthly Spending (Outflow)
  const monthlyData = React.useMemo(() => {
    const dataMap: Record<
      string,
      { month: string; deposit: number; spending: number }
    > = {};

    const d = now ?? new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const key = `${MONTHS[past.getMonth()]} ${past
        .getFullYear()
        .toString()
        .slice(-2)}`;
      dataMap[key] = { month: key, deposit: 0, spending: 0 };
    }

    transactions.forEach(t => {
      if (!t.createdAt || t.status === 'Failed' || t.status === 'Reversed') {
        return;
      }
      const date = new Date(t.createdAt);
      const key = `${MONTHS[date.getMonth()]} ${date
        .getFullYear()
        .toString()
        .slice(-2)}`;

      if (dataMap[key]) {
        const amt = Number(t.amount) || 0;
        const isIncomingTransfer =
          t.type === 'Transfer' &&
          activeAccountNumber &&
          t.receiverAccount === activeAccountNumber;

        if (
          t.type === 'Deposit' ||
          t.type === 'Loan Disbursement' ||
          isIncomingTransfer
        ) {
          dataMap[key].deposit += amt;
        } else {
          dataMap[key].spending += amt;
        }
      }
    });

    return Object.values(dataMap).map(item => ({
      ...item,
      deposit: Math.round(item.deposit * 100) / 100,
      spending: Math.round(item.spending * 100) / 100,
    }));
  }, [transactions, now, activeAccountNumber]);

  // 2. Real Transaction Category Distribution
  const pieData = React.useMemo(() => {
    let deposit = 0;
    let withdrawal = 0;
    let transfer = 0;
    let loan = 0;

    transactions.forEach(t => {
      if (t.status === 'Failed' || t.status === 'Reversed') return;
      const amt = Number(t.amount) || 0;
      if (t.type === 'Deposit') deposit += amt;
      else if (t.type === 'Withdrawal') withdrawal += amt;
      else if (t.type === 'Transfer') transfer += amt;
      else loan += amt;
    });

    return [
      { name: 'Deposits', value: Math.round(deposit), color: '#10b981' },
      { name: 'Transfers', value: Math.round(transfer), color: '#0ea5e9' },
      { name: 'Withdrawals', value: Math.round(withdrawal), color: '#f43f5e' },
      { name: 'Loans', value: Math.round(loan), color: '#8b5cf6' },
    ].filter(i => i.value > 0);
  }, [transactions]);

  const hasMonthlyActivity = monthlyData.some(
    m => m.deposit > 0 || m.spending > 0,
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Area Chart: Monthly Deposit History vs Monthly Spending */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Monthly Deposit History & Spending
            </h3>
            <p className="text-xs text-slate-400">
              Live 6-month inflow vs outgoing spending from your ledger
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Deposits / Credits
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Spending / Debits
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          {!hasMonthlyActivity ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800">
              <BarChart3 className="mb-2 h-6 w-6 text-slate-300 dark:text-slate-700" />
              <span>No transaction volume recorded in the last 6 months.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="depositColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="withdrawColor"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={v => `$${v}`}
                />
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
                  name="Deposits ($)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#depositColor)"
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  name="Spending ($)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#withdrawColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pie Chart: Transaction Distribution */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Transaction Distribution
        </h3>
        <p className="text-xs text-slate-400">
          Real volume breakdown by category
        </p>

        {pieData.length === 0 ? (
          <div className="mt-4 flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-800">
            <span>No categorized activity yet.</span>
          </div>
        ) : (
          <>
            <div className="mt-2 flex h-52 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
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

            <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
              {pieData.map(item => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
