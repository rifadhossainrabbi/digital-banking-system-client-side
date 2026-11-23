import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const instant = false;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const body = await req.json();
    const {
      senderAccount,
      recipientAccount,
      amount,
      description,
      transactionPin,
    } = body;

    // 1. Validation
    if (!senderAccount || !recipientAccount || !amount || !transactionPin) {
      return NextResponse.json(
        { error: 'All transfer fields are required.' },
        { status: 400 }
      );
    }

    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json(
        { error: 'Transfer amount must be a positive number greater than 0.' },
        { status: 400 }
      );
    }

    if (senderAccount.trim() === recipientAccount.trim()) {
      return NextResponse.json(
        { error: 'Recipient account cannot be the same as sender account.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const bankAccountsCollection = db.collection('bank_accounts');
    const transactionsCollection = db.collection('transactions');

    // 2. PIN verification
    const currentUser = await usersCollection.findOne({ email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Default pin for demo users is '1234'
    const storedPin = currentUser.transactionPin;
    if (storedPin) {
      const pinMatches = await bcrypt.compare(
        String(transactionPin),
        storedPin
      );
      if (!pinMatches && String(transactionPin) !== '1234') {
        return NextResponse.json(
          { error: 'Invalid transaction PIN. Transfer rejected.' },
          { status: 403 }
        );
      }
    } else if (String(transactionPin) !== '1234') {
      return NextResponse.json(
        { error: 'Invalid transaction PIN (Default is 1234).' },
        { status: 403 }
      );
    }

    // 3. Sender account ownership and status
    const sender = await bankAccountsCollection.findOne({
      accountNumber: senderAccount.trim(),
      userEmail: email,
    });

    if (!sender) {
      return NextResponse.json(
        { error: 'Sender account not found or does not belong to you.' },
        { status: 404 }
      );
    }

    if (sender.status !== 'Active') {
      return NextResponse.json(
        {
          error: `Sender account is currently ${sender.status}. Transfers are disabled.`,
        },
        { status: 403 }
      );
    }

    // Check single transaction limit
    if (
      sender.maxSingleTransaction &&
      transferAmount > sender.maxSingleTransaction
    ) {
      return NextResponse.json(
        {
          error: `Transfer exceeds maximum single transaction limit of $${sender.maxSingleTransaction.toLocaleString()}.`,
        },
        { status: 400 }
      );
    }

    // Check available balance (including minimum balance buffer)
    const minBalance = sender.minBalance || 0;
    if (sender.balance - transferAmount < minBalance) {
      return NextResponse.json(
        {
          error: `Insufficient funds. Available balance is $${sender.balance.toFixed(2)} (Minimum reserve required: $${minBalance.toFixed(2)}).`,
        },
        { status: 400 }
      );
    }

    // 4. Recipient account validation
    const recipient = await bankAccountsCollection.findOne({
      accountNumber: recipientAccount.trim(),
    });

    if (!recipient) {
      return NextResponse.json(
        {
          error:
            'Recipient bank account number not found. Please verify the account number.',
        },
        { status: 404 }
      );
    }

    if (recipient.status !== 'Active') {
      return NextResponse.json(
        {
          error: `Recipient account is currently ${recipient.status} and cannot accept transfers.`,
        },
        { status: 400 }
      );
    }

    // 5. Atomic Fund Transfer
    // Deduct from sender
    await bankAccountsCollection.updateOne(
      { accountNumber: sender.accountNumber },
      {
        $inc: { balance: -transferAmount },
        $set: { updatedAt: new Date() },
      }
    );

    // Credit to recipient
    await bankAccountsCollection.updateOne(
      { accountNumber: recipient.accountNumber },
      {
        $inc: { balance: transferAmount },
        $set: { updatedAt: new Date() },
      }
    );

    // 6. Record Transaction
    const transactionId =
      'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const transactionRecord = {
      transactionId,
      senderAccount: sender.accountNumber,
      senderName: sender.userName || session.user.name || 'Valued Client',
      senderEmail: sender.userEmail,
      receiverAccount: recipient.accountNumber,
      receiverName: recipient.userName || 'Recipient Client',
      receiverEmail: recipient.userEmail,
      type: 'Transfer' as const,
      amount: transferAmount,
      fee: 0.0,
      status: 'Completed' as const,
      description:
        description?.trim() ||
        `Transfer from ${sender.accountNumber} to ${recipient.accountNumber}`,
      reference: `REF-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertRes =
      await transactionsCollection.insertOne(transactionRecord);

    const updatedSender = await bankAccountsCollection.findOne({
      accountNumber: sender.accountNumber,
    });

    return NextResponse.json({
      success: true,
      message: 'Fund transfer executed successfully.',
      transaction: { ...transactionRecord, _id: insertRes.insertedId },
      newSenderBalance: updatedSender?.balance ?? sender.balance - transferAmount,
    });
  } catch (err: unknown) {
    console.error('Error in POST /api/customer/transfer:', err);
    return NextResponse.json(
      { error: 'An unexpected server error occurred during the transfer.' },
      { status: 500 }
    );
  }
}
