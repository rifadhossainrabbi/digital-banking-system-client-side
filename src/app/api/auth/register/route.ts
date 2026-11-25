import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      role,
      fullName,
      name,
      email,
      password,
      transactionPin,
      accountType = 'Savings Account',
    } = body;

    const userName = (fullName || name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const validAccountTypes = [
      'Savings Account',
      'Current Account',
      'Business Account',
    ];
    const chosenAccountType = validAccountTypes.includes(accountType)
      ? accountType
      : 'Savings Account';

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

    const existingUser = await usersCollection.findOne({ email: trimmedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const pinToHash =
      transactionPin && /^\d{4,6}$/.test(String(transactionPin))
        ? String(transactionPin)
        : '1234';
    const hashedPin = await bcrypt.hash(pinToHash, 10);
    const now = new Date();

    if (role === 'Customer') {
      const userResult = await usersCollection.insertOne({
        name: userName,
        email: trimmedEmail,
        image: null,
        password: hashedPassword,
        transactionPin: hashedPin,
        twoFactorEnabled: false,
        role: 'Customer',
        accountType: chosenAccountType,
        status: 'Active',
        createdAt: now,
        updatedAt: now,
      });

      const accountNumber =
        '10' + Math.floor(10000000 + Math.random() * 90000000);

      const limits =
        chosenAccountType === 'Business Account'
          ? { dailyLimit: 50000, maxSingleTransaction: 20000, minBalance: 500 }
          : chosenAccountType === 'Current Account'
            ? { dailyLimit: 15000, maxSingleTransaction: 5000, minBalance: 100 }
            : { dailyLimit: 5000, maxSingleTransaction: 2000, minBalance: 50 };

      await db.collection('bank_accounts').insertOne({
        userId: userResult.insertedId.toString(),
        userEmail: trimmedEmail,
        userName,
        accountNumber,
        accountType: chosenAccountType,
        balance: 1000.0,
        status: 'Active',
        ...limits,
        createdAt: now,
        updatedAt: now,
      });

      await db.collection('transactions').insertOne({
        transactionId:
          'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        senderAccount: 'SYSTEM',
        senderName: 'Vaultly Welcome Reserve',
        senderEmail: 'system@vaultly.bank',
        receiverAccount: accountNumber,
        receiverName: userName,
        receiverEmail: trimmedEmail,
        type: 'Deposit',
        amount: 1000.0,
        fee: 0,
        status: 'Completed',
        description: `Welcome Opening Deposit (${chosenAccountType})`,
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
