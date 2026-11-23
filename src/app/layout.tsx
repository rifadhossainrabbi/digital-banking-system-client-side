import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import AuthProvider from '@/components/AuthProvider';
import ReduxProvider from '@/redux/ReduxProvider';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vaultly | Digital Banking Management System',
  description:
    'Secure, modern digital banking platform for managing accounts, fund transfers, transactions, and loans.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <AuthProvider>
            <ReduxProvider>
              <Navbar />
              <main className="flex-grow w-full">{children}</main>
              <Footer />
            </ReduxProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
