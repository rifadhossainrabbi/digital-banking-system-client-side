import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db';

export const instant = false;

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const db = await getDatabase();
    const loansCollection = db.collection('loans');

    const loans = await loansCollection
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ loans });
  } catch (err: unknown) {
    console.error('Error in GET /api/customer/loans:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve loans' },
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
        { error: 'Forbidden: Only Customer accounts can apply for loans.' },
        { status: 403 },
      );
    }

    const email = session.user.email.toLowerCase();
    const body = await req.json();
    const {
      accountNumber,
      loanType,
      requestedAmount,
      durationMonths,
      monthlyIncome,
      employmentStatus,
      description,
    } = body;

    const principal = Math.round(Number(requestedAmount) * 100) / 100;
    const months = Number(durationMonths);

    if (!accountNumber || !loanType || !principal || !months) {
      return NextResponse.json(
        { error: 'Please provide all required loan application details.' },
        { status: 400 },
      );
    }

    if (principal < 500 || principal > 200000) {
      return NextResponse.json(
        { error: 'Loan amount must be between $500 and $200,000.' },
        { status: 400 },
      );
    }

    const validDurations = [6, 12, 24, 36, 48, 60];
    if (!validDurations.includes(months)) {
      return NextResponse.json(
        {
          error:
            'Invalid loan duration. Allowed: 6, 12, 24, 36, 48, 60 months.',
        },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const bankAccountsCollection = db.collection('bank_accounts');
    const loansCollection = db.collection('loans');

    const account = await bankAccountsCollection.findOne({
      accountNumber,
      userEmail: email,
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Disbursement bank account not found or unauthorized.' },
        { status: 404 },
      );
    }

    if (account.status !== 'Active') {
      return NextResponse.json(
        { error: `Account is ${account.status}. Cannot apply for a loan.` },
        { status: 403 },
      );
    }

    // Prevent concurrent pending/under-review loan spam
    const existingPending = await loansCollection.findOne({
      userEmail: email,
      status: { $in: ['Pending', 'Under Review'] },
    });
    if (existingPending) {
      return NextResponse.json(
        {
          error: `You already have a ${existingPending.status.toLowerCase()} loan application (${existingPending.loanId}). Please wait for review.`,
        },
        { status: 400 },
      );
    }

    const annualRate = 0.055;
    const monthlyRate = annualRate / 12;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const roundedEmi = Math.round(emi * 100) / 100;
    const totalPayable = Math.round(roundedEmi * months * 100) / 100;

    const now = new Date();
    const loanId = 'LN-' + Math.floor(10000 + Math.random() * 90000);

    // Enters Pending status; Staff reviews & Admin approves to disburse
    const newLoan = {
      loanId,
      userId: session.user.id || '',
      userEmail: email,
      userName: session.user.name || 'Customer',
      accountNumber,
      loanType,
      requestedAmount: principal,
      totalPayable,
      interestRate: 5.5,
      durationMonths: months,
      monthlyInstallment: roundedEmi,
      monthlyIncome: Number(monthlyIncome) || 0,
      employmentStatus: employmentStatus || 'Employed',
      description: description?.trim() || 'Digital Loan Application',
      status: 'Pending' as const,
      remainingBalance: 0,
      paidAmount: 0,
      repayments: [],
      staffNotes: [],
      approvedAt: null,
      disbursedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await loansCollection.insertOne(newLoan);

    await db.collection('notifications').insertOne({
      userEmail: email,
      title: 'Loan Application Received',
      message: `Your ${loanType} application (${loanId}) for $${principal.toLocaleString()} has been submitted and is awaiting Bank Staff / Admin review.`,
      type: 'Loan',
      read: false,
      createdAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Loan application ${loanId} for $${principal.toLocaleString()} submitted for Staff & Admin review.`,
        loan: { ...newLoan, _id: insertResult.insertedId },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error('Error in POST /api/customer/loans:', err);
    return NextResponse.json(
      { error: 'Failed to submit loan application.' },
      { status: 500 },
    );
  }
}
