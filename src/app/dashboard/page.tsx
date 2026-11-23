import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const instant = false;

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const role = session.user.role;

  if (role === 'Admin') {
    redirect('/dashboard/admin');
  } else if (role === 'Bank Staff' || role === 'STAFF') {
    redirect('/dashboard/staff');
  } else {
    redirect('/dashboard/customer');
  }
}
