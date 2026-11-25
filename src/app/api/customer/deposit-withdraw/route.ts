import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db';

export const instant = false;

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const url = new URL(req.url);
    const accountFilter = url.searchParams.get('account');

    const db = await getDatabase();
    const requestsCollection = db.collection('deposit_withdraw_requests');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userEmail: email };
    if (accountFilter && accountFilter !== 'All') {
      query.accountNumber = accountFilter;
    }

    const requests = await requestsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ requests });
  } catch (err: unknown) {
    console.error('Error in GET /api/customer/deposit-withdraw:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve requests' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'Customer') {
      return NextResponse.json(
        {
          error: 'Forbidden: Only Customer accounts can submit requests here.',
        },
        { status: 403 },
      );
    }

    const email = session.user.email.toLowerCase();
    const body = await req.json();
    const { accountNumber, type, amount, description } = body;

    if (!accountNumber || !type || !amount) {
      return NextResponse.json(
        { error: 'Account number, request type, and amount are required.' },
        { status: 400 },
      );
    }

    const reqAmount = Math.round(Number(amount) * 100) / 100;
    if (isNaN(reqAmount) || reqAmount <= 0 || reqAmount > 1000000) {
      return NextResponse.json(
        { error: 'Amount must be between $0.01 and $1,000,000.' },
        { status: 400 },
      );
    }

    if (type !== 'Deposit' && type !== 'Withdrawal') {
      return NextResponse.json(
        { error: 'Request type must be either Deposit or Withdrawal.' },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const bankAccountsCollection = db.collection('bank_accounts');
    const requestsCollection = db.collection('deposit_withdraw_requests');

    const account = await bankAccountsCollection.findOne({
      accountNumber,
      userEmail: email,
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Specified bank account was not found or is unauthorized.' },
        { status: 404 },
      );
    }

    if (account.status !== 'Active') {
      return NextResponse.json(
        {
          error: `Account is currently ${account.status}. Requests cannot be processed.`,
        },
        { status: 403 },
      );
    }

    if (type === 'Withdrawal') {
      const minBalance = account.minBalance ?? 50;
      const pendingAgg = await requestsCollection
        .aggregate([
          {
            $match: {
              accountNumber,
              type: 'Withdrawal',
              status: 'Pending',
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .toArray();
      const pendingWithdrawalSum = pendingAgg[0]?.total ?? 0;

      if (account.balance - pendingWithdrawalSum - reqAmount < minBalance) {
        return NextResponse.json(
          {
            error: `Insufficient available funds. Balance: $${account.balance.toFixed(2)}, Pending Withdrawals: $${pendingWithdrawalSum.toFixed(2)}, Min Reserve: $${minBalance.toFixed(2)}.`,
          },
          { status: 400 },
        );
      }
    }

    const now = new Date();
    const requestId = 'REQ-' + Math.floor(100000 + Math.random() * 900000);

    // Always enters Pending status — Admin/Staff approval required
    const newRequest = {
      requestId,
      userId: session.user.id || '',
      userEmail: email,
      userName: session.user.name || 'Customer',
      accountNumber,
      accountType: account.accountType,
      type,
      amount: reqAmount,
      status: 'Pending' as const,
      description:
        description?.trim() || `${type} request for account ${accountNumber}`,
      requestDate: now,
      reviewedAt: null,
      reviewedBy: null,
      notes: 'Awaiting Bank Staff / Admin approval',
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await requestsCollection.insertOne(newRequest);

    await db.collection('notifications').insertOne({
      userEmail: email,
      title: `${type} Request Submitted`,
      message: `Your ${type} request (${requestId}) of $${reqAmount.toFixed(2)} for account ${accountNumber} is pending Staff/Admin approval.`,
      type: 'Transaction',
      read: false,
      createdAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        message: `${type} request (${requestId}) of $${reqAmount.toFixed(2)} submitted for Admin/Staff approval.`,
        request: { ...newRequest, _id: insertResult.insertedId },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error('Error in POST /api/customer/deposit-withdraw:', err);
    return NextResponse.json(
      { error: 'Failed to process request.' },
      { status: 500 },
    );
  }
}
