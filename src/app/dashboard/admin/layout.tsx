import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminLayoutClient from './AdminLayoutClient';

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  if (session.user.role !== 'Admin') {
    redirect('/dashboard');
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
