import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db';

export const instant = false;

// GET: Fetch all bank accounts for the current customer
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const db = await getDatabase();
    const bankAccountsCollection = db.collection('bank_accounts');

    let accounts = await bankAccountsCollection
      .find({ userEmail: email })
      .toArray();

    // If customer has no bank accounts yet, create a default Savings Account
    if (accounts.length === 0) {
      const accountNumber =
        '10' + Math.floor(10000000 + Math.random() * 90000000);
      const defaultAccount = {
        userId: session.user.id || '',
        userEmail: email,
        userName: session.user.name || 'Customer',
        accountNumber,
        accountType: 'Savings Account' as const,
        balance: 1000.0,
        status: 'Active' as const,
        dailyLimit: 5000,
        maxSingleTransaction: 2000,
        minBalance: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await bankAccountsCollection.insertOne(defaultAccount);
      accounts = [{ ...defaultAccount, _id: result.insertedId }];
    }

    return NextResponse.json({ accounts });
  } catch (err: unknown) {
    console.error('Error in GET /api/customer/accounts:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve accounts' },
      { status: 500 }
    );
  }
}

// POST: Open an additional bank account
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const body = await req.json();
    const { accountType, initialDeposit } = body;

    const validTypes = ['Savings Account', 'Current Account', 'Business Account'];
    if (!validTypes.includes(accountType)) {
      return NextResponse.json(
        { error: 'Invalid account type specified.' },
        { status: 400 }
      );
    }

    const depositAmount = Number(initialDeposit) || 500.0;
    if (depositAmount < 50) {
      return NextResponse.json(
        { error: 'Minimum opening deposit is $50.00.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const bankAccountsCollection = db.collection('bank_accounts');

    // Limit maximum 5 accounts per customer
    const existingCount = await bankAccountsCollection.countDocuments({
      userEmail: email,
    });
    if (existingCount >= 5) {
      return NextResponse.json(
        { error: 'Maximum limit of 5 bank accounts reached per customer.' },
        { status: 400 }
      );
    }

    const accountNumber =
      '10' + Math.floor(10000000 + Math.random() * 90000000);
    const newAccount = {
      userId: session.user.id || '',
      userEmail: email,
      userName: session.user.name || 'Customer',
      accountNumber,
      accountType,
      balance: depositAmount,
      status: 'Active' as const,
      dailyLimit: accountType === 'Business Account' ? 25000 : 5000,
      maxSingleTransaction:
        accountType === 'Business Account' ? 10000 : 2000,
      minBalance: accountType === 'Business Account' ? 500 : 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await bankAccountsCollection.insertOne(newAccount);

    // Record opening deposit transaction
    const transactionsCollection = db.collection('transactions');
    const txnId =
      'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    await transactionsCollection.insertOne({
      transactionId: txnId,
      senderAccount: 'SYSTEM',
      senderName: 'Vaultly Central Reserve',
      senderEmail: 'system@vaultly.bank',
      receiverAccount: accountNumber,
      receiverName: session.user.name || 'Customer',
      receiverEmail: email,
      type: 'Deposit',
      amount: depositAmount,
      fee: 0,
      status: 'Completed',
      description: `New ${accountType} Opening Deposit`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'New bank account created successfully.',
        account: { ...newAccount, _id: insertResult.insertedId },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Error in POST /api/customer/accounts:', err);
    return NextResponse.json(
      { error: 'Failed to create bank account' },
      { status: 500 }
    );
  }
}
