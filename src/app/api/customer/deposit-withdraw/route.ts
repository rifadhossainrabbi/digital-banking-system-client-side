import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db';

export const instant = false;

// GET: Retrieve deposit and withdrawal requests for customer
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
      { status: 500 }
    );
  }
}

// POST: Submit a new Deposit or Withdrawal request
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const body = await req.json();
    const { accountNumber, type, amount, description } = body;

    if (!accountNumber || !type || !amount) {
      return NextResponse.json(
        { error: 'Account number, request type, and amount are required.' },
        { status: 400 }
      );
    }

    const reqAmount = Number(amount);
    if (isNaN(reqAmount) || reqAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0.' },
        { status: 400 }
      );
    }

    if (type !== 'Deposit' && type !== 'Withdrawal') {
      return NextResponse.json(
        { error: 'Request type must be either Deposit or Withdrawal.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const bankAccountsCollection = db.collection('bank_accounts');
    const requestsCollection = db.collection('deposit_withdraw_requests');
    const transactionsCollection = db.collection('transactions');

    // Validate account ownership
    const account = await bankAccountsCollection.findOne({
      accountNumber,
      userEmail: email,
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Specified bank account was not found or is unauthorized.' },
        { status: 404 }
      );
    }

    if (account.status !== 'Active') {
      return NextResponse.json(
        {
          error: `Account is currently ${account.status}. Requests cannot be processed.`,
        },
        { status: 403 }
      );
    }

    if (type === 'Withdrawal') {
      const minBalance = account.minBalance || 0;
      if (account.balance - reqAmount < minBalance) {
        return NextResponse.json(
          {
            error: `Insufficient funds for withdrawal. Available: $${account.balance.toFixed(2)} (Min Reserve: $${minBalance.toFixed(2)})`,
          },
          { status: 400 }
        );
      }
    }

    const requestId =
      'REQ-' + Math.floor(100000 + Math.random() * 900000);

    // For full workflow simulation in this digital banking environment,
    // Approved requests process balance directly and record transactions!
    // Auto-approve simulated requests below $10,000 for realistic instant feedback
    const isAutoApproved = reqAmount <= 10000;
    const initialStatus = isAutoApproved ? 'Approved' : 'Pending';

    const newRequest = {
      requestId,
      userId: session.user.id || '',
      userEmail: email,
      userName: session.user.name || 'Customer',
      accountNumber,
      type,
      amount: reqAmount,
      status: initialStatus,
      description:
        description ||
        `${type} request for account ${accountNumber}`,
      requestDate: new Date(),
      reviewedAt: isAutoApproved ? new Date() : null,
      reviewedBy: isAutoApproved ? 'Automated Clearance System' : null,
      notes: isAutoApproved
        ? 'Automated instant simulation approval'
        : 'Awaiting Bank Staff review',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await requestsCollection.insertOne(newRequest);

    // If auto-approved, update account balance & record transaction
    if (isAutoApproved) {
      const balanceChange = type === 'Deposit' ? reqAmount : -reqAmount;
      await bankAccountsCollection.updateOne(
        { accountNumber },
        {
          $inc: { balance: balanceChange },
          $set: { updatedAt: new Date() },
        }
      );

      const txnId =
        'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      await transactionsCollection.insertOne({
        transactionId: txnId,
        senderAccount: type === 'Deposit' ? 'EXTERNAL_CLEARING' : accountNumber,
        senderName:
          type === 'Deposit'
            ? 'Vaultly Cashier / Deposit'
            : session.user.name || 'Customer',
        senderEmail: email,
        receiverAccount:
          type === 'Deposit' ? accountNumber : 'ATM_OR_BRANCH_PAYOUT',
        receiverName:
          type === 'Deposit'
            ? session.user.name || 'Customer'
            : 'Cashier Withdrawal',
        receiverEmail: email,
        type: type as 'Deposit' | 'Withdrawal',
        amount: reqAmount,
        fee: 0,
        status: 'Completed',
        description: `${type} via ${description || 'Digital Portal'}`,
        reference: requestId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: isAutoApproved
          ? `${type} of $${reqAmount.toFixed(2)} approved and balance updated!`
          : `${type} request of $${reqAmount.toFixed(2)} submitted for staff review.`,
        request: { ...newRequest, _id: insertResult.insertedId },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Error in POST /api/customer/deposit-withdraw:', err);
    return NextResponse.json(
      { error: 'Failed to process request.' },
      { status: 500 }
    );
  }
}
