import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import StaffLayoutClient from './StaffLayoutClient';

export const instant = false;

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  if (session.user.role !== 'Bank Staff' && session.user.role !== 'Admin') {
    redirect('/dashboard');
  }

  return (
    <StaffLayoutClient
      staffName={session.user.name || 'Bank Staff'}
      staffEmail={session.user.email || 'staff@vaultly.bank'}
    >
      {children}
    </StaffLayoutClient>
  );
}
