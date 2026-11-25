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

    if (session.user.role !== 'Customer') {
      await mongoSession.endSession();
      return NextResponse.json(
        {
          error:
            'Forbidden: Only Customer accounts can perform fund transfers.',
        },
        { status: 403 },
      );
    }

    const email = session.user.email.toLowerCase();
    const body = await req.json();
    const {
      senderAccount,
      recipientAccount,
      amount,
      description,
      transactionPin,
      twoFactorCode,
      idempotencyKey,
    } = body;

    if (!senderAccount || !recipientAccount || !amount || !transactionPin) {
      await mongoSession.endSession();
      return NextResponse.json(
        { error: 'All transfer fields are required.' },
        { status: 400 },
      );
    }

    const transferAmount = Math.round(Number(amount) * 100) / 100;
    if (isNaN(transferAmount) || transferAmount <= 0) {
      await mongoSession.endSession();
      return NextResponse.json(
        { error: 'Transfer amount must be greater than $0.00.' },
        { status: 400 },
      );
    }

    const cleanSender = String(senderAccount).trim();
    const cleanRecipient = String(recipientAccount).trim();

    if (cleanSender === cleanRecipient) {
      await mongoSession.endSession();
      return NextResponse.json(
        { error: 'Recipient account cannot be the same as sender account.' },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const bankAccountsCollection = db.collection('bank_accounts');
    const transactionsCollection = db.collection('transactions');
    const notificationsCollection = db.collection('notifications');

    // 1. Duplicate Transaction Prevention (Idempotency Key & Rapid Duplicate Guard)
    if (idempotencyKey) {
      const existingByKey = await transactionsCollection.findOne({
        idempotencyKey: String(idempotencyKey),
        senderEmail: email,
      });
      if (existingByKey) {
        await mongoSession.endSession();
        return NextResponse.json(
          {
            error:
              'Duplicate transfer detected. This transaction has already been processed.',
          },
          { status: 409 },
        );
      }
    }

    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
    const rapidDuplicate = await transactionsCollection.findOne({
      senderAccount: cleanSender,
      receiverAccount: cleanRecipient,
      amount: transferAmount,
      type: 'Transfer',
      createdAt: { $gte: tenSecondsAgo },
    });
    if (rapidDuplicate) {
      await mongoSession.endSession();
      return NextResponse.json(
        {
          error:
            'Duplicate transaction prevented: an identical transfer was just processed. Please wait 10 seconds.',
        },
        { status: 409 },
      );
    }

    // 2. Strict PIN & User Status Verification
    const currentUser = await usersCollection.findOne({ email });
    if (!currentUser) {
      await mongoSession.endSession();
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (currentUser.status !== 'Active') {
      await mongoSession.endSession();
      return NextResponse.json(
        {
          error: `Your account is ${currentUser.status}. Transfers are disabled.`,
        },
        { status: 403 },
      );
    }

    const storedPin = currentUser.transactionPin;
    if (storedPin) {
      const pinMatches = await bcrypt.compare(
        String(transactionPin),
        storedPin,
      );
      if (!pinMatches) {
        await mongoSession.endSession();
        return NextResponse.json(
          { error: 'Invalid transaction PIN. Transfer rejected.' },
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

    // 2FA check for high-value transfers (>= $5,000) or when 2FA is enabled
    if (currentUser.twoFactorEnabled || transferAmount >= 5000) {
      const code = String(twoFactorCode || '').trim();
      if (!code || !/^\d{6}$/.test(code)) {
        await mongoSession.endSession();
        return NextResponse.json(
          {
            error:
              'Two-Factor Authentication required for this transfer. Please enter a 6-digit verification code (Demo OTP: 654321).',
            requires2FA: true,
          },
          { status: 403 },
        );
      }
      if (code !== '654321' && code !== '000000') {
        await mongoSession.endSession();
        return NextResponse.json(
          { error: 'Invalid 2FA verification code. (Demo OTP: 654321)' },
          { status: 403 },
        );
      }
    }

    // 3. Sender account ownership & limits
    const sender = await bankAccountsCollection.findOne({
      accountNumber: cleanSender,
      userEmail: email,
    });

    if (!sender) {
      await mongoSession.endSession();
      return NextResponse.json(
        { error: 'Sender account not found or does not belong to you.' },
        { status: 404 },
      );
    }

    if (sender.status !== 'Active') {
      await mongoSession.endSession();
      return NextResponse.json(
        {
          error: `Sender account is ${sender.status}. Transfers are disabled.`,
        },
        { status: 403 },
      );
    }

    const maxSingle = sender.maxSingleTransaction || 5000;
    if (transferAmount > maxSingle) {
      await mongoSession.endSession();
      return NextResponse.json(
        {
          error: `Transfer exceeds single transaction limit of $${maxSingle.toLocaleString()}.`,
        },
        { status: 400 },
      );
    }

    const minBalance = sender.minBalance ?? 50;
    if (sender.balance - transferAmount < minBalance) {
      await mongoSession.endSession();
      return NextResponse.json(
        {
          error: `Insufficient funds. Available: $${sender.balance.toFixed(2)} (Min Reserve: $${minBalance.toFixed(2)}).`,
        },
        { status: 400 },
      );
    }

    // Daily cumulative transfer limit check
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayAgg = await transactionsCollection
      .aggregate([
        {
          $match: {
            senderAccount: cleanSender,
            type: 'Transfer',
            status: 'Completed',
            createdAt: { $gte: startOfDay },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .toArray();
    const usedToday = todayAgg[0]?.total ?? 0;
    const dailyLimit = sender.dailyLimit || 5000;
    if (usedToday + transferAmount > dailyLimit) {
      await mongoSession.endSession();
      return NextResponse.json(
        {
          error: `Daily transfer limit of $${dailyLimit.toLocaleString()} exceeded. Used today: $${usedToday.toFixed(2)}.`,
        },
        { status: 400 },
      );
    }

    // 4. Recipient validation
    const recipient = await bankAccountsCollection.findOne({
      accountNumber: cleanRecipient,
    });
    if (!recipient) {
      await mongoSession.endSession();
      return NextResponse.json(
        { error: 'Recipient bank account number not found.' },
        { status: 404 },
      );
    }
    if (recipient.status !== 'Active') {
      await mongoSession.endSession();
      return NextResponse.json(
        {
          error: `Recipient account is ${recipient.status} and cannot accept transfers.`,
        },
        { status: 400 },
      );
    }

    // 5. Rule-based Suspicious Transaction Detection
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const burstCount = await transactionsCollection.countDocuments({
      senderAccount: cleanSender,
      type: 'Transfer',
      createdAt: { $gte: fiveMinutesAgo },
    });

    const isSuspicious =
      transferAmount >= 10000 ||
      transferAmount >= dailyLimit * 0.8 ||
      burstCount >= 3;
    const flaggedReason = isSuspicious
      ? transferAmount >= 10000
        ? 'High-value transfer (>= $10,000 threshold)'
        : burstCount >= 3
          ? 'Unusual high-frequency transfer burst detected'
          : 'Transfer exceeds 80% of daily account limit'
      : null;

    const now = new Date();
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
      idempotencyKey: idempotencyKey ? String(idempotencyKey) : null,
      isSuspicious,
      flaggedReason,
      flagStatus: isSuspicious ? 'Flagged by Security Rule' : null,
      createdAt: now,
      updatedAt: now,
    };

    // 6. Atomic Execution via MongoDB Transaction
    let insertId: unknown = null;
    try {
      await mongoSession.withTransaction(async () => {
        const debitResult = await bankAccountsCollection.updateOne(
          {
            accountNumber: sender.accountNumber,
            balance: { $gte: transferAmount + minBalance },
            status: 'Active',
          },
          {
            $inc: { balance: -transferAmount },
            $set: { updatedAt: now },
          },
          { session: mongoSession },
        );

        if (debitResult.modifiedCount !== 1) {
          throw new Error('INSUFFICIENT_FUNDS_CONCURRENT');
        }

        const creditResult = await bankAccountsCollection.updateOne(
          { accountNumber: recipient.accountNumber, status: 'Active' },
          {
            $inc: { balance: transferAmount },
            $set: { updatedAt: now },
          },
          { session: mongoSession },
        );

        if (creditResult.modifiedCount !== 1) {
          throw new Error('RECIPIENT_CREDIT_FAILED');
        }

        const insertRes = await transactionsCollection.insertOne(
          transactionRecord,
          { session: mongoSession },
        );
        insertId = insertRes.insertedId;

        await notificationsCollection.insertMany(
          [
            {
              userEmail: email,
              title: 'Transfer Completed',
              message: `Sent $${transferAmount.toFixed(2)} to ${recipient.userName} (${recipient.accountNumber}). Ref: ${transactionId}`,
              type: 'Transfer',
              read: false,
              createdAt: now,
            },
            {
              userEmail: recipient.userEmail,
              title: 'Money Received',
              message: `Received $${transferAmount.toFixed(2)} from ${sender.userName} into ${recipient.accountNumber}. Ref: ${transactionId}`,
              type: 'Transfer',
              read: false,
              createdAt: now,
            },
          ],
          { session: mongoSession },
        );
      });
    } catch (txErr: unknown) {
      if (
        txErr instanceof Error &&
        txErr.message === 'INSUFFICIENT_FUNDS_CONCURRENT'
      ) {
        await mongoSession.endSession();
        return NextResponse.json(
          { error: 'Insufficient balance or concurrent balance change.' },
          { status: 400 },
        );
      }
      throw txErr;
    }

    await mongoSession.endSession();

    const updatedSender = await bankAccountsCollection.findOne({
      accountNumber: sender.accountNumber,
    });

    return NextResponse.json({
      success: true,
      message: 'Fund transfer executed successfully.',
      transaction: { ...transactionRecord, _id: insertId },
      newSenderBalance:
        updatedSender?.balance ?? sender.balance - transferAmount,
    });
  } catch (err: unknown) {
    await mongoSession.endSession();
    console.error('Error in POST /api/customer/transfer:', err);
    return NextResponse.json(
      { error: 'Transfer failed and was safely rolled back.' },
      { status: 500 },
    );
  }
}
