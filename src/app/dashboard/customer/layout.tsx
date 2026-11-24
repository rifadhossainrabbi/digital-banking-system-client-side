import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import CustomerLayoutClient from './CustomerLayoutClient';

export const instant = false;

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Role Protection: Admin and Staff have their dedicated dashboards
  if (session.user.role === 'Admin') {
    redirect('/dashboard/admin');
  } else if (session.user.role === 'Bank Staff' || session.user.role === 'STAFF') {
    redirect('/dashboard/staff');
  }

  return <CustomerLayoutClient>{children}</CustomerLayoutClient>;
}
