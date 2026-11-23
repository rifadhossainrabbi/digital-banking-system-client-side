import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db';

export const instant = false;

// GET: Fetch customer loans
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
      { status: 500 }
    );
  }
}

// POST: Apply for a new loan
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const principal = Number(requestedAmount);
    const months = Number(durationMonths);

    if (!accountNumber || !loanType || !principal || !months) {
      return NextResponse.json(
        { error: 'Please provide all required loan application details.' },
        { status: 400 }
      );
    }

    if (principal < 500 || principal > 200000) {
      return NextResponse.json(
        { error: 'Loan amount must be between $500 and $200,000.' },
        { status: 400 }
      );
    }

    const validDurations = [6, 12, 24, 36, 48, 60];
    if (!validDurations.includes(months)) {
      return NextResponse.json(
        { error: 'Invalid loan duration. Allowed: 6, 12, 24, 36, 48, 60 months.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const bankAccountsCollection = db.collection('bank_accounts');
    const loansCollection = db.collection('loans');
    const transactionsCollection = db.collection('transactions');

    const account = await bankAccountsCollection.findOne({
      accountNumber,
      userEmail: email,
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Disbursement bank account not found or unauthorized.' },
        { status: 404 }
      );
    }

    // Standard interest rate: 5.5% annual
    const annualRate = 0.055;
    const monthlyRate = annualRate / 12;
    // Standard EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const roundedEmi = Math.round(emi * 100) / 100;
    const totalPayable = Math.round(roundedEmi * months * 100) / 100;

    const loanId = 'LN-' + Math.floor(10000 + Math.random() * 90000);

    const newLoan = {
      loanId,
      userId: session.user.id || '',
      userEmail: email,
      userName: session.user.name || 'Customer',
      accountNumber,
      loanType,
      requestedAmount: principal,
      interestRate: 5.5,
      durationMonths: months,
      monthlyInstallment: roundedEmi,
      monthlyIncome: Number(monthlyIncome) || 0,
      employmentStatus: employmentStatus || 'Employed',
      description: description || 'Digital Loan Application',
      status: 'Active' as const, // Auto-approved and disbursed for immediate simulation
      remainingBalance: totalPayable,
      paidAmount: 0,
      repayments: [],
      approvedAt: new Date(),
      disbursedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await loansCollection.insertOne(newLoan);

    // Disburse loan funds directly into customer's bank account!
    await bankAccountsCollection.updateOne(
      { accountNumber },
      {
        $inc: { balance: principal },
        $set: { updatedAt: new Date() },
      }
    );

    // Record disbursement transaction
    const txnId =
      'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    await transactionsCollection.insertOne({
      transactionId: txnId,
      senderAccount: 'VAULTLY_LOAN_CREDIT',
      senderName: 'Vaultly Credit Facility',
      senderEmail: 'credit@vaultly.bank',
      receiverAccount: accountNumber,
      receiverName: session.user.name || 'Customer',
      receiverEmail: email,
      type: 'Loan Disbursement',
      amount: principal,
      fee: 0,
      status: 'Completed',
      description: `${loanType} Disbursement (${loanId})`,
      reference: loanId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: `Congratulations! Your ${loanType} for $${principal.toLocaleString()} has been approved and disbursed.`,
        loan: { ...newLoan, _id: insertResult.insertedId },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Error in POST /api/customer/loans:', err);
    return NextResponse.json(
      { error: 'Failed to submit loan application.' },
      { status: 500 }
    );
  }
}
