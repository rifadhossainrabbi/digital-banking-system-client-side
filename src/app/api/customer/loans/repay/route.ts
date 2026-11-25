import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise, { getDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const instant = false;

export async function POST(req: Request) {
  const mongoClient = await clientPromise;
  const mongoSession = mongoClient.startSession();

  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      await mongoSession.endSession();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const body = await req.json();
    const { loanId, accountNumber, amount, transactionPin } = body;

    if (!loanId || !accountNumber || !amount || !transactionPin) {
      await mongoSession.endSession();
      return NextResponse.json(
        { error: 'All repayment fields are required.' },
        { status: 400 },
      );
    }

    const repayAmount = Math.round(Number(amount) * 100) / 100;
    if (isNaN(repayAmount) || repayAmount <= 0) {
      await mongoSession.endSession();
      return NextResponse.json(
        { error: 'Repayment amount must be a positive number.' },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const bankAccountsCollection = db.collection('bank_accounts');
    const loansCollection = db.collection('loans');
    const transactionsCollection = db.collection('transactions');
    const notificationsCollection = db.collection('notifications');

    const currentUser = await usersCollection.findOne({ email });
    if (!currentUser) {
      await mongoSession.endSession();
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (currentUser.transactionPin) {
      const pinMatches = await bcrypt.compare(
        String(transactionPin),
        currentUser.transactionPin,
      );
      if (!pinMatches) {
        await mongoSession.endSession();
        return NextResponse.json(
          { error: 'Invalid transaction PIN.' },
          { status: 403 },
        );
      }
    } else if (String(transactionPin) !== '1234') {
      await mongoSession.endSession();
      return NextResponse.json(
        { error: 'Invalid transaction PIN (Default is 1234).' },
        { status: 403 },
      );
    }

    const loan = await loansCollection.findOne({ loanId, userEmail: email });
    if (!loan) {
      await mongoSession.endSession();
      return NextResponse.json({ error: 'Loan not found.' }, { status: 404 });
    }

    if (loan.status !== 'Active' && loan.status !== 'Approved') {
      await mongoSession.endSession();
      return NextResponse.json(
        {
          error: `This loan is currently ${loan.status} and cannot be repaid.`,
        },
        { status: 400 },
      );
    }

    const account = await bankAccountsCollection.findOne({
      accountNumber,
      userEmail: email,
    });

    if (!account) {
      await mongoSession.endSession();
      return NextResponse.json(
        { error: 'Repayment bank account not found.' },
        { status: 404 },
      );
    }

    if (account.status !== 'Active') {
      await mongoSession.endSession();
      return NextResponse.json(
        { error: `Account is ${account.status}.` },
        { status: 403 },
      );
    }

    const actualPayment = Math.min(repayAmount, loan.remainingBalance);
    const minBalance = account.minBalance ?? 50;
    if (account.balance - actualPayment < minBalance) {
      await mongoSession.endSession();
      return NextResponse.json(
        {
          error: `Insufficient account balance. Available: $${account.balance.toFixed(2)}, Min Reserve: $${minBalance.toFixed(2)}`,
        },
        { status: 400 },
      );
    }

    const newRemainingBalance = Math.max(
      0,
      Math.round((loan.remainingBalance - actualPayment) * 100) / 100,
    );
    const newPaidAmount =
      Math.round(((loan.paidAmount || 0) + actualPayment) * 100) / 100;
    const isCompleted = newRemainingBalance <= 0;

    const now = new Date();
    const paymentId =
      'PAY-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const repaymentEntry = {
      paymentId,
      amount: actualPayment,
      paymentDate: now,
      accountNumber,
      remainingAfter: newRemainingBalance,
    };

    const txnId =
      'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    await mongoSession.withTransaction(async () => {
      const debitRes = await bankAccountsCollection.updateOne(
        {
          accountNumber,
          balance: { $gte: actualPayment + minBalance },
          status: 'Active',
        },
        {
          $inc: { balance: -actualPayment },
          $set: { updatedAt: now },
        },
        { session: mongoSession },
      );

      if (debitRes.modifiedCount !== 1) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      await loansCollection.updateOne(
        { loanId },
        {
          $set: {
            remainingBalance: newRemainingBalance,
            paidAmount: newPaidAmount,
            status: isCompleted ? 'Completed' : 'Active',
            updatedAt: now,
          },
          $push: { repayments: repaymentEntry as never },
        },
        { session: mongoSession },
      );

      await transactionsCollection.insertOne(
        {
          transactionId: txnId,
          senderAccount: accountNumber,
          senderName: session.user.name || 'Customer',
          senderEmail: email,
          receiverAccount: 'VAULTLY_LOAN_FACILITY',
          receiverName: 'Vaultly Loan Amortization',
          receiverEmail: 'loans@vaultly.bank',
          type: 'Loan Repayment',
          amount: actualPayment,
          fee: 0,
          status: 'Completed',
          description: `Loan Repayment for ${loanId} (${paymentId})`,
          reference: paymentId,
          relatedLoanId: loanId,
          createdAt: now,
          updatedAt: now,
        },
        { session: mongoSession },
      );

      await notificationsCollection.insertOne(
        {
          userEmail: email,
          title: isCompleted
            ? 'Loan Paid Off in Full!'
            : 'Loan Repayment Processed',
          message: isCompleted
            ? `Congratulations! Your ${loan.loanType} (${loanId}) has been completely repaid.`
            : `Repayment of $${actualPayment.toFixed(2)} applied to ${loanId}. Remaining: $${newRemainingBalance.toFixed(2)}.`,
          type: 'Loan',
          read: false,
          createdAt: now,
        },
        { session: mongoSession },
      );
    });

    await mongoSession.endSession();

    const updatedLoan = await loansCollection.findOne({ loanId });
    const updatedAccount = await bankAccountsCollection.findOne({
      accountNumber,
    });

    return NextResponse.json({
      success: true,
      message: isCompleted
        ? `Installment of $${actualPayment.toFixed(2)} paid. Loan is now fully paid off!`
        : `Installment of $${actualPayment.toFixed(2)} paid successfully. Remaining balance: $${newRemainingBalance.toFixed(2)}`,
      loan: updatedLoan,
      newAccountBalance: updatedAccount?.balance,
    });
  } catch (err: unknown) {
    await mongoSession.endSession();
    console.error('Error in POST /api/customer/loans/repay:', err);
    return NextResponse.json(
      { error: 'Failed to process loan repayment.' },
      { status: 500 },
    );
  }
}
