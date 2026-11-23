import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, fullName, name, email, password } = body;

    const userName = (fullName || name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();

    // 1. Basic validation (Only Name, Email, Password, Role)
    if (!userName || !trimmedEmail || !password) {
      return NextResponse.json(
        { error: 'Please provide name, email, and password.' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 },
      );
    }

    if (role !== 'Customer' && role !== 'Bank Staff') {
      return NextResponse.json(
        { error: 'Invalid account role specified.' },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // 2. Check if user already exists
    const existingUser = await usersCollection.findOne({ email: trimmedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 },
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    if (role === 'Customer') {
      // Google login-এর মতোই সিম্পল ইউজার স্ট্রাকচার
      const userResult = await usersCollection.insertOne({
        name: userName,
        email: trimmedEmail,
        image: null,
        password: hashedPassword,
        role: 'Customer',
        status: 'Active',
        createdAt: now,
        updatedAt: now,
      });

      // Generate a unique 10-digit bank account number
      const accountNumber =
        '10' + Math.floor(10000000 + Math.random() * 90000000);

      // Create initial Savings Account with $1,000 welcome opening deposit
      await db.collection('bank_accounts').insertOne({
        userId: userResult.insertedId.toString(),
        userEmail: trimmedEmail,
        userName,
        accountNumber,
        accountType: 'Savings Account',
        balance: 1000.0,
        status: 'Active',
        dailyLimit: 5000,
        maxSingleTransaction: 2000,
        minBalance: 50,
        createdAt: now,
        updatedAt: now,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Customer account created successfully.',
          role: 'Customer',
          accountNumber,
        },
        { status: 201 },
      );
    }

    // Bank Staff registration - Requires Admin Approval
    await usersCollection.insertOne({
      name: userName,
      email: trimmedEmail,
      image: null,
      password: hashedPassword,
      role: 'Bank Staff',
      status: 'Pending Approval',
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Bank Staff registration submitted. Awaiting Admin approval before login.',
        role: 'Bank Staff',
        status: 'Pending Approval',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration.' },
      { status: 500 },
    );
  }
}
