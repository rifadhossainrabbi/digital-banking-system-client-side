import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db';

export const instant = false;

// GET: Export Account Statement in CSV format
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const url = new URL(req.url);
    const accountNumber = url.searchParams.get('account');

    const db = await getDatabase();
    const transactionsCollection = db.collection('transactions');
    const bankAccountsCollection = db.collection('bank_accounts');

    // Verify account ownership if specified
    if (accountNumber) {
      const account = await bankAccountsCollection.findOne({
        accountNumber,
        userEmail: email,
      });
      if (!account) {
        return new NextResponse('Account not found or unauthorized', {
          status: 404,
        });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (accountNumber) {
      query.$or = [
        { senderAccount: accountNumber },
        { receiverAccount: accountNumber },
      ];
    } else {
      const userAccounts = await bankAccountsCollection
        .find({ userEmail: email })
        .toArray();
      const numbers = userAccounts.map(a => a.accountNumber);
      query.$or = [
        { senderAccount: { $in: numbers } },
        { receiverAccount: { $in: numbers } },
      ];
    }

    const transactions = await transactionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Generate CSV lines
    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Amount ($)',
      'Fee ($)',
      'Status',
      'Sender Account',
      'Sender Name',
      'Receiver Account',
      'Receiver Name',
      'Description',
    ];

    const rows = transactions.map(t => [
      `"${t.transactionId}"`,
      `"${new Date(t.createdAt).toISOString()}"`,
      `"${t.type}"`,
      t.amount,
      t.fee || 0,
      `"${t.status}"`,
      `"${t.senderAccount}"`,
      `"${(t.senderName || '').replace(/"/g, '""')}"`,
      `"${t.receiverAccount}"`,
      `"${(t.receiverName || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join(
      '\n'
    );

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="vaultly-statement-${accountNumber || 'all'}-${Date.now()}.csv"`,
      },
    });
  } catch (err: unknown) {
    console.error('Error generating CSV statement:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
