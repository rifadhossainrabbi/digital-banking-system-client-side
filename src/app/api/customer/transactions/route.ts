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
    const typeFilter = url.searchParams.get('type');
    const statusFilter = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const searchFilter = url.searchParams.get('search');
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)),
    );
    const skip = (page - 1) * limit;

    const db = await getDatabase();
    const bankAccountsCollection = db.collection('bank_accounts');
    const transactionsCollection = db.collection('transactions');

    const userAccounts = await bankAccountsCollection
      .find({ userEmail: email })
      .toArray();

    const accountNumbers = userAccounts.map(a => a.accountNumber);

    if (accountNumbers.length === 0) {
      return NextResponse.json({
        transactions: [],
        total: 0,
        page,
        totalPages: 0,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (accountFilter && accountFilter !== 'All') {
      if (!accountNumbers.includes(accountFilter)) {
        return NextResponse.json(
          { error: 'Forbidden account access' },
          { status: 403 },
        );
      }
      query.$or = [
        { senderAccount: accountFilter },
        { receiverAccount: accountFilter },
      ];
    } else {
      query.$or = [
        { senderAccount: { $in: accountNumbers } },
        { receiverAccount: { $in: accountNumbers } },
      ];
    }

    if (typeFilter && typeFilter !== 'All') {
      query.type = typeFilter;
    }

    if (statusFilter && statusFilter !== 'All') {
      query.status = statusFilter;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (searchFilter && searchFilter.trim()) {
      const regex = new RegExp(searchFilter.trim(), 'i');
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { transactionId: regex },
            { description: regex },
            { senderName: regex },
            { receiverName: regex },
            { senderAccount: regex },
            { receiverAccount: regex },
          ],
        },
      ];
    }

    const total = await transactionsCollection.countDocuments(query);
    const transactions = await transactionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: unknown) {
    console.error('Error in GET /api/customer/transactions:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve transactions' },
      { status: 500 },
    );
  }
}
