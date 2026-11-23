import NextAuth from 'next-auth';
import type { DefaultSession } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import clientPromise, { getDatabase, DB_NAME } from '@/lib/db';
import { seedDemoAccounts } from '@/lib/seed';

declare module 'next-auth' {
  interface User {
    id?: string;
    role?: string;
    status?: string;
    phone?: string;
    accountType?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      status: string;
      phone?: string;
      accountType?: string;
    } & DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    status?: string;
    phone?: string;
    accountType?: string;
  }
}

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

const providers: Provider[] = [
  Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Please enter both email and password.');
      }

      const email = String(credentials.email).trim().toLowerCase();
      const password = String(credentials.password);

      // Seed demo accounts if they don't exist yet
      await seedDemoAccounts();

      const db = await getDatabase();
      const user = await db.collection('users').findOne({ email });

      if (!user) {
        throw new Error('Invalid email or password.');
      }

      if (!user.password) {
        throw new Error(
          'This account was registered using Google. Please sign in with Google.'
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid email or password.');
      }

      const role = user.role || 'Customer';
      const status = user.status || 'Active';

      // Check if staff account is pending admin approval
      if (
        (role === 'Bank Staff' || role === 'STAFF') &&
        (status === 'Pending Approval' ||
          status === 'PENDING' ||
          status === 'PENDING_APPROVAL')
      ) {
        throw new Error('Your staff account is awaiting Admin approval.');
      }

      if (status === 'Blocked' || status === 'Suspended') {
        throw new Error(
          'Your account has been deactivated or blocked. Please contact bank administration.'
        );
      }

      return {
        id: user._id.toString(),
        name: user.name || user.fullName || 'User',
        email: user.email,
        role,
        status,
        phone: user.phone || '',
        accountType: user.accountType || 'Savings Account',
      };
    },
  }),
];

// Configure Google Provider if client ID and secret are available
if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: DB_NAME,
  }),
  session: {
    strategy: 'jwt',
  },
  providers,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const db = await getDatabase();
          const email = user.email?.toLowerCase();
          if (!email) return false;

          const existingUser = await db.collection('users').findOne({ email });
          if (!existingUser) {
            // New Google user gets Customer role and Active status
            const insertRes = await db.collection('users').insertOne({
              name: user.name || 'Google Customer',
              email,
              image: user.image || null,
              role: 'Customer',
              status: 'Active',
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            const newUserId = insertRes.insertedId.toString();
            const accountNumber =
              '10' + Math.floor(10000000 + Math.random() * 90000000);
            await db.collection('bank_accounts').insertOne({
              userId: newUserId,
              userEmail: email,
              userName: user.name || 'Google Customer',
              accountNumber,
              accountType: 'Savings Account',
              balance: 1000.0,
              status: 'Active',
              dailyLimit: 5000,
              maxSingleTransaction: 2000,
              minBalance: 50,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            // Check if existing user has a bank account
            const existingAccount = await db
              .collection('bank_accounts')
              .findOne({ userEmail: email });
            if (!existingAccount) {
              const accountNumber =
                '10' + Math.floor(10000000 + Math.random() * 90000000);
              await db.collection('bank_accounts').insertOne({
                userId: existingUser._id.toString(),
                userEmail: email,
                userName: existingUser.name || user.name || 'Customer',
                accountNumber,
                accountType: existingUser.accountType || 'Savings Account',
                balance: 1000.0,
                status: 'Active',
                dailyLimit: 5000,
                maxSingleTransaction: 2000,
                minBalance: 50,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          }
        } catch (err) {
          console.error('Error during Google signIn callback:', err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'Customer';
        token.status = user.status || 'Active';
        token.phone = user.phone || '';
        token.accountType = user.accountType || 'Savings Account';
      }

      // If token role is missing (e.g., from initial OAuth link), fetch from database
      if (!token.role && token.email) {
        try {
          const db = await getDatabase();
          const dbUser = await db
            .collection('users')
            .findOne({ email: token.email.toLowerCase() });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role || 'Customer';
            token.status = dbUser.status || 'Active';
            token.phone = dbUser.phone || '';
            token.accountType = dbUser.accountType || 'Savings Account';
          } else {
            token.role = 'Customer';
            token.status = 'Active';
          }
        } catch {
          token.role = 'Customer';
          token.status = 'Active';
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as string) || 'Customer';
        session.user.status = (token.status as string) || 'Active';
        session.user.phone = (token.phone as string) || '';
        session.user.accountType =
          (token.accountType as string) || 'Savings Account';
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});

export default NextAuth;
