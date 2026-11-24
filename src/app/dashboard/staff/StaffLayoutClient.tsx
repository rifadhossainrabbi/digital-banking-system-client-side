'use client';

import React, { useState } from 'react';
import StaffSidebar from '@/components/staff/StaffSidebar';
import StaffHeader from '@/components/staff/StaffHeader';

interface StaffLayoutClientProps {
  children: React.ReactNode;
  staffName?: string;
  staffEmail?: string;
}

export default function StaffLayoutClient({
  children,
  staffName,
  staffEmail,
}: StaffLayoutClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 antialiased dark:bg-[#070d18] dark:text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <StaffSidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl">
            <StaffSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <StaffHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          staffName={staffName}
          staffEmail={staffEmail}
        />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
