'use client';

import React, { useState, useEffect } from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import CustomerHeader from '@/components/customer/CustomerHeader';
import { useAppDispatch } from '@/redux/hooks';
import { fetchAccounts } from '@/redux/slices/accountSlice';
import { fetchTransactions } from '@/redux/slices/transactionSlice';
import { fetchLoans } from '@/redux/slices/loanSlice';
import { X } from 'lucide-react';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();

  // Load customer state into Redux on mount
  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions(undefined));
    dispatch(fetchLoans());
  }, [dispatch]);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-[#f8fafc] text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block lg:shrink-0">
        <CustomerSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close Sidebar"
              className="absolute right-4 top-5 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
            <CustomerSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <CustomerHeader onOpenMobile={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
