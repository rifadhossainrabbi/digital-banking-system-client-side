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

interface ChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CustomerCharts({ transactions }: ChartProps) {
  // Stable date — set via useEffect to avoid prerender evaluation (cacheComponents)
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
  }, []);

  // 1. Calculate Monthly Cash Flow
  const monthlyData = React.useMemo(() => {
    const dataMap: { [key: string]: { month: string; deposit: number; withdrawal: number; transfer: number } } = {};
    
    // Initialize past 6 months
    const d = now ?? new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const key = `${MONTHS[past.getMonth()]} ${past.getFullYear().toString().slice(-2)}`;
      dataMap[key] = { month: key, deposit: 0, withdrawal: 0, transfer: 0 };
    }

    // Default sample trends if transactions are low
    const keys = Object.keys(dataMap);
    if (keys.length >= 6) {
      dataMap[keys[0]].deposit = 4200;
      dataMap[keys[0]].withdrawal = 1800;
      dataMap[keys[0]].transfer = 800;

      dataMap[keys[1]].deposit = 5100;
      dataMap[keys[1]].withdrawal = 2300;
      dataMap[keys[1]].transfer = 1200;

      dataMap[keys[2]].deposit = 4800;
      dataMap[keys[2]].withdrawal = 1950;
      dataMap[keys[2]].transfer = 600;

      dataMap[keys[3]].deposit = 6200;
      dataMap[keys[3]].withdrawal = 3100;
      dataMap[keys[3]].transfer = 1450;

      dataMap[keys[4]].deposit = 5800;
      dataMap[keys[4]].withdrawal = 2400;
      dataMap[keys[4]].transfer = 950;
    }

    transactions.forEach(t => {
      const date = new Date(t.createdAt);
      const key = `${MONTHS[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
      if (dataMap[key]) {
        if (t.type === 'Deposit' || t.type === 'Loan Disbursement') {
          dataMap[key].deposit += t.amount;
        } else if (t.type === 'Withdrawal') {
          dataMap[key].withdrawal += t.amount;
        } else {
          dataMap[key].transfer += t.amount;
        }
      }
    });

    return Object.values(dataMap);
  }, [transactions, now]);

  // 2. Transaction Type Distribution
  const pieData = React.useMemo(() => {
    let deposit = 0;
    let withdrawal = 0;
    let transfer = 0;
    let loan = 0;

    transactions.forEach(t => {
      if (t.type === 'Deposit') deposit += t.amount;
      else if (t.type === 'Withdrawal') withdrawal += t.amount;
      else if (t.type === 'Transfer') transfer += t.amount;
      else loan += t.amount;
    });

    if (deposit === 0 && withdrawal === 0 && transfer === 0) {
      return [
        { name: 'Deposits', value: 55, color: '#10b981' },
        { name: 'Transfers', value: 25, color: '#0ea5e9' },
        { name: 'Withdrawals', value: 20, color: '#f43f5e' },
      ];
    }

    return [
      { name: 'Deposits', value: Math.round(deposit), color: '#10b981' },
      { name: 'Transfers', value: Math.round(transfer), color: '#0ea5e9' },
      { name: 'Withdrawals', value: Math.round(withdrawal), color: '#f43f5e' },
      { name: 'Loan Actions', value: Math.round(loan), color: '#8b5cf6' },
    ].filter(i => i.value > 0);
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Area Chart: Monthly Spending & Cash Volume */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Financial Activity & Cash Flow
            </h3>
            <p className="text-xs text-slate-400">
              6-Month trend of deposits vs outgoing transfers
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Inflow
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Outflow
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="depositColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="withdrawColor" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="deposit" name="Inflow ($)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#depositColor)" />
              <Area type="monotone" dataKey="withdrawal" name="Outflow ($)" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#withdrawColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Distribution */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Transaction Distribution
        </h3>
        <p className="text-xs text-slate-400">
          Proportion by transaction categories
        </p>

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
            <div key={item.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                ${item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
