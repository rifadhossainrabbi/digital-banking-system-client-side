'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db';

/** Enforces Bank Staff or Admin role authorization */
async function requireStaff() {
  const session = await auth();
  if (!session || !session.user || !session.user.email) {
    throw new Error('Unauthorized: Authentication required.');
  }
  const role = session.user.role;
  if (role !== 'Bank Staff' && role !== 'Admin') {
    throw new Error('Forbidden: Bank Staff or Admin access required.');
  }
  return session;
}

// ─── 1. Staff Dashboard Overview Action ──────────────────────────────────────
export async function getStaffDashboardDataAction() {
  const session = await requireStaff();
  const db = await getDatabase();

  const usersCol = db.collection('users');
  const accountsCol = db.collection('bank_accounts');
  const transactionsCol = db.collection('transactions');
  const loansCol = db.collection('loans');
  const requestsCol = db.collection('deposit_withdraw_requests');

  const [
    totalCustomers,
    totalAccounts,
    pendingLoans,
    pendingTransactions,
    flaggedTransactions,
    unverifiedCustomers,
    pendingRequests,
  ] = await Promise.all([
    usersCol.countDocuments({ role: 'Customer' }),
    accountsCol.countDocuments({ status: 'Active' }),
    loansCol.countDocuments({ status: { $in: ['Pending', 'Under Review'] } }),
    transactionsCol.countDocuments({ status: 'Pending' }),
    transactionsCol.countDocuments({ isSuspicious: true }),
    usersCol.countDocuments({ role: 'Customer', kycVerified: { $ne: true } }),
    requestsCol.countDocuments({ status: 'Pending' }),
  ]);

  const recentTransactions = await transactionsCol
    .find({})
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();

  const pendingLoansList = await loansCol
    .find({ status: { $in: ['Pending', 'Under Review'] } })
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();

  return {
    staffMember: {
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      branchCode: 'VLT-NYC-01',
      branchName: 'New York Metro Branch',
    },
    metrics: {
      totalCustomers,
      totalAccounts,
      pendingLoans,
      pendingTransactions,
      flaggedTransactions,
      unverifiedCustomers,
      pendingRequests,
    },
    recentTransactions: JSON.parse(JSON.stringify(recentTransactions)),
    pendingLoansList: JSON.parse(JSON.stringify(pendingLoansList)),
  };
}

// ─── 2. Customer Operations ──────────────────────────────────────────────────
export async function getStaffCustomersAction(params: {
  search?: string;
  kycFilter?: string;
  page?: number;
  limit?: number;
}) {
  await requireStaff();
  const { search = '', kycFilter = 'All', page = 1, limit = 20 } = params;
  const db = await getDatabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { role: 'Customer' };

  if (kycFilter === 'Verified') query.kycVerified = true;
  if (kycFilter === 'Unverified') query.kycVerified = { $ne: true };

  if (search.trim()) {
    const r = new RegExp(search.trim(), 'i');
    query.$or = [{ name: r }, { email: r }, { phone: r }];
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [total, customers] = await Promise.all([
    db.collection('users').countDocuments(query),
    db
      .collection('users')
      .find(query, { projection: { password: 0, transactionPin: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  ]);

  return {
    customers: JSON.parse(JSON.stringify(customers)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getStaffCustomerDetailsAction(email: string) {
  await requireStaff();
  const db = await getDatabase();

  const customer = await db
    .collection('users')
    .findOne(
      { email: email.toLowerCase(), role: 'Customer' },
      { projection: { password: 0, transactionPin: 0 } },
    );

  if (!customer) {
    return { success: false, error: 'Customer not found.' };
  }

  const accounts = await db
    .collection('bank_accounts')
    .find({ userEmail: email.toLowerCase() })
    .toArray();

  const recentTransactions = await db
    .collection('transactions')
    .find({
      $or: [
        { senderEmail: email.toLowerCase() },
        { receiverEmail: email.toLowerCase() },
      ],
    })
    .sort({ createdAt: -1 })
    .limit(8)
    .toArray();

  return {
    success: true,
    customer: JSON.parse(JSON.stringify(customer)),
    accounts: JSON.parse(JSON.stringify(accounts)),
    recentTransactions: JSON.parse(JSON.stringify(recentTransactions)),
  };
}

export async function registerCustomerAction(formData: {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  transactionPin?: string;
}) {
  const session = await requireStaff();
  const {
    name,
    email,
    password = 'Customer@1234',
    phone,
    transactionPin = '1234',
  } = formData;

  if (!name.trim() || !email.trim()) {
    return { success: false, error: 'Name and email are required.' };
  }

  const db = await getDatabase();
  const existing = await db
    .collection('users')
    .findOne({ email: email.toLowerCase() });
  if (existing) {
    return {
      success: false,
      error: 'A user with this email address already exists.',
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedPin = await bcrypt.hash(transactionPin, 10);

  const result = await db.collection('users').insertOne({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    transactionPin: hashedPin,
    role: 'Customer',
    status: 'Active',
    phone: phone?.trim() || null,
    kycVerified: false,
    registeredBy: session.user.email,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath('/dashboard/staff/customers');
  revalidatePath('/dashboard/staff');

  return {
    success: true,
    message: 'Customer registered successfully.',
    customerId: result.insertedId.toString(),
  };
}

export async function verifyCustomerKYCAction(
  email: string,
  verified: boolean,
  verificationNotes: string = '',
) {
  const session = await requireStaff();
  const db = await getDatabase();

  const result = await db.collection('users').updateOne(
    { email: email.toLowerCase(), role: 'Customer' },
    {
      $set: {
        kycVerified: Boolean(verified),
        verifiedBy: session.user.email,
        verifiedAt: new Date(),
        verificationNotes: verificationNotes.trim(),
        updatedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return { success: false, error: 'Customer not found.' };
  }

  revalidatePath('/dashboard/staff/customers');
  revalidatePath('/dashboard/staff');

  return {
    success: true,
    message: `Customer verification updated to: ${
      verified ? 'Verified' : 'Unverified'
    }.`,
  };
}

export async function createCustomerAccountAction(data: {
  userEmail: string;
  accountType: 'Savings Account' | 'Current Account' | 'Business Account';
  initialDeposit: number;
}) {
  const session = await requireStaff();
  const { userEmail, accountType, initialDeposit } = data;

  const validTypes = ['Savings Account', 'Current Account', 'Business Account'];
  if (!validTypes.includes(accountType)) {
    return { success: false, error: 'Invalid account type selected.' };
  }

  const db = await getDatabase();
  const customer = await db.collection('users').findOne({
    email: userEmail.toLowerCase(),
    role: 'Customer',
  });

  if (!customer) {
    return { success: false, error: 'Customer not found.' };
  }

  const depositAmount = Math.max(0, Number(initialDeposit) || 0);
  const accountNumber = '10' + Math.floor(10000000 + Math.random() * 90000000);

  const limitsByType = {
    'Savings Account': {
      dailyLimit: 5000,
      maxSingleTransaction: 2000,
      minBalance: 50,
    },
    'Current Account': {
      dailyLimit: 15000,
      maxSingleTransaction: 5000,
      minBalance: 100,
    },
    'Business Account': {
      dailyLimit: 50000,
      maxSingleTransaction: 20000,
      minBalance: 500,
    },
  };

  const limits = limitsByType[accountType] || limitsByType['Savings Account'];

  const newAccount = {
    userId: customer._id.toString(),
    userEmail: customer.email,
    userName: customer.name,
    accountNumber,
    accountType,
    balance: depositAmount,
    status: 'Active',
    ...limits,
    openedByStaff: session.user.email,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection('bank_accounts').insertOne(newAccount);

  if (depositAmount > 0) {
    const txnId =
      'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    await db.collection('transactions').insertOne({
      transactionId: txnId,
      senderAccount: 'SYSTEM',
      senderName: 'Vaultly Central Reserve',
      senderEmail: 'system@vaultly.bank',
      receiverAccount: accountNumber,
      receiverName: customer.name,
      receiverEmail: customer.email,
      type: 'Deposit',
      amount: depositAmount,
      fee: 0,
      status: 'Completed',
      description: `Staff Created ${accountType} with Initial Deposit`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  revalidatePath('/dashboard/staff/customers');
  revalidatePath('/dashboard/staff');

  return {
    success: true,
    message: `New ${accountType} #${accountNumber} created successfully with balance $${depositAmount.toLocaleString()}.`,
    accountNumber,
  };
}

// ─── 3. Transaction Management & Suspicious Flagging ─────────────────────────
export async function getStaffTransactionsAction(params: {
  search?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  flaggedOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  await requireStaff();
  const {
    search = '',
    type = 'All',
    status = 'All',
    startDate,
    endDate,
    flaggedOnly = false,
    page = 1,
    limit = 20,
  } = params;

  const db = await getDatabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (type !== 'All') query.type = type;
  if (status !== 'All') query.status = status;
  if (flaggedOnly) query.isSuspicious = true;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search.trim()) {
    const r = new RegExp(search.trim(), 'i');
    query.$or = [
      { transactionId: r },
      { senderName: r },
      { receiverName: r },
      { senderAccount: r },
      { receiverAccount: r },
    ];
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [total, transactions] = await Promise.all([
    db.collection('transactions').countDocuments(query),
    db
      .collection('transactions')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  ]);

  return {
    transactions: JSON.parse(JSON.stringify(transactions)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function flagSuspiciousTransactionAction(
  txnId: string,
  reason: string,
) {
  const session = await requireStaff();
  if (!reason?.trim()) {
    return {
      success: false,
      error: 'A detailed reason is required to flag a transaction.',
    };
  }

  const db = await getDatabase();
  const result = await db.collection('transactions').updateOne(
    { transactionId: txnId },
    {
      $set: {
        isSuspicious: true,
        flaggedReason: reason.trim(),
        flaggedBy: session.user.email,
        flaggedAt: new Date(),
        flagStatus: 'Pending Admin Review',
        updatedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return { success: false, error: 'Transaction not found.' };
  }

  revalidatePath('/dashboard/staff/transactions');
  revalidatePath('/dashboard/staff');
  revalidatePath('/dashboard/admin/transactions');

  return {
    success: true,
    message: 'Transaction flagged for Admin compliance review.',
  };
}

// ─── 4. Loan Assistance ──────────────────────────────────────────────────────
export async function getStaffLoansAction(params: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  await requireStaff();
  const { status = 'All', page = 1, limit = 20 } = params;
  const db = await getDatabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (status !== 'All') query.status = status;

  const skip = (Math.max(1, page) - 1) * limit;

  const [total, loans] = await Promise.all([
    db.collection('loans').countDocuments(query),
    db
      .collection('loans')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  ]);

  return {
    loans: JSON.parse(JSON.stringify(loans)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function addLoanStaffNoteAction(loanId: string, note: string) {
  const session = await requireStaff();
  if (!note?.trim()) {
    return { success: false, error: 'Note text cannot be empty.' };
  }

  const db = await getDatabase();
  const result = await db.collection('loans').updateOne(
    { loanId },
    {
      $push: {
        staffNotes: {
          note: note.trim(),
          addedBy: session.user.email,
          addedAt: new Date(),
        } as never,
      },
      $set: { updatedAt: new Date() },
    },
  );

  if (result.matchedCount === 0) {
    return { success: false, error: 'Loan not found.' };
  }

  revalidatePath('/dashboard/staff/loans');
  return { success: true, message: 'Internal staff note added successfully.' };
}

export async function forwardLoanApplicationAction(
  loanId: string,
  recommendation: string,
) {
  const session = await requireStaff();
  const db = await getDatabase();

  const loan = await db.collection('loans').findOne({ loanId });
  if (!loan) {
    return { success: false, error: 'Loan application not found.' };
  }

  if (loan.userEmail?.toLowerCase() === session.user.email?.toLowerCase()) {
    return {
      success: false,
      error:
        'Conflict of Interest: Bank Staff cannot forward or process their own loan applications.',
    };
  }

  await db.collection('loans').updateOne(
    { loanId },
    {
      $set: {
        status: 'Under Review',
        forwardedByStaff: session.user.email,
        forwardedAt: new Date(),
        staffRecommendation:
          recommendation?.trim() ||
          'Recommended for Admin approval upon initial review.',
        updatedAt: new Date(),
      },
    },
  );

  revalidatePath('/dashboard/staff/loans');
  revalidatePath('/dashboard/staff');
  revalidatePath('/dashboard/admin/loans');

  return {
    success: true,
    message: 'Loan application forwarded to Admin queue for final approval.',
  };
}

// ─── 5. Deposit & Withdrawal Clearance (Staff Approval Workflow) ─────────────
export async function getStaffRequestsAction(
  status = 'Pending',
  page = 1,
  limit = 20,
) {
  await requireStaff();
  const db = await getDatabase();
  const reqCol = db.collection('deposit_withdraw_requests');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (status !== 'All') query.status = status;

  const skip = (Math.max(1, page) - 1) * limit;

  const [total, requests] = await Promise.all([
    reqCol.countDocuments(query),
    reqCol
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  ]);

  return {
    requests: JSON.parse(JSON.stringify(requests)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function reviewStaffDepositWithdrawRequestAction(
  requestId: string,
  status: 'Approved' | 'Rejected',
) {
  const session = await requireStaff();
  const db = await getDatabase();
  const reqDoc = await db
    .collection('deposit_withdraw_requests')
    .findOne({ requestId });

  if (!reqDoc) {
    return { success: false, error: 'Request not found.' };
  }
  if (reqDoc.status !== 'Pending') {
    return {
      success: false,
      error: 'Only Pending requests can be processed.',
    };
  }
  if (reqDoc.userEmail?.toLowerCase() === session.user.email?.toLowerCase()) {
    return {
      success: false,
      error: 'Conflict of Interest: Cannot process your own request.',
    };
  }

  const now = new Date();

  if (status === 'Approved') {
    const acc = await db
      .collection('bank_accounts')
      .findOne({ accountNumber: reqDoc.accountNumber });
    if (!acc || acc.status !== 'Active') {
      return {
        success: false,
        error: 'Target bank account is not active.',
      };
    }

    if (reqDoc.type === 'Withdrawal') {
      const minBalance = acc.minBalance ?? 50;
      if (acc.balance - reqDoc.amount < minBalance) {
        return {
          success: false,
          error: `Insufficient funds in account ${reqDoc.accountNumber} for withdrawal.`,
        };
      }
    }

    const balanceDelta =
      reqDoc.type === 'Deposit' ? reqDoc.amount : -reqDoc.amount;
    await db
      .collection('bank_accounts')
      .updateOne(
        { accountNumber: reqDoc.accountNumber },
        { $inc: { balance: balanceDelta }, $set: { updatedAt: now } },
      );

    const txnId =
      'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const user = await db
      .collection('users')
      .findOne({ email: reqDoc.userEmail });

    await db.collection('transactions').insertOne({
      transactionId: txnId,
      senderAccount:
        reqDoc.type === 'Deposit' ? 'SYSTEM' : reqDoc.accountNumber,
      senderName:
        reqDoc.type === 'Deposit'
          ? 'Vaultly Central Reserve'
          : user?.name || 'Customer',
      senderEmail:
        reqDoc.type === 'Deposit' ? 'system@vaultly.bank' : reqDoc.userEmail,
      receiverAccount:
        reqDoc.type === 'Deposit' ? reqDoc.accountNumber : 'SYSTEM',
      receiverName:
        reqDoc.type === 'Deposit'
          ? user?.name || 'Customer'
          : 'Vaultly Processing',
      receiverEmail:
        reqDoc.type === 'Deposit' ? reqDoc.userEmail : 'system@vaultly.bank',
      type: reqDoc.type,
      amount: reqDoc.amount,
      fee: 0,
      status: 'Completed',
      description: `Staff Approved (${session.user.email}) — ${reqDoc.type} Request ${requestId}`,
      relatedRequestId: requestId,
      createdAt: now,
      updatedAt: now,
    });

    await db.collection('notifications').insertOne({
      userEmail: reqDoc.userEmail,
      title: `${reqDoc.type} Approved`,
      message: `Your ${reqDoc.type} of $${reqDoc.amount} on account ${reqDoc.accountNumber} has been approved.`,
      type: 'Transaction',
      read: false,
      createdAt: now,
    });
  } else {
    await db.collection('notifications').insertOne({
      userEmail: reqDoc.userEmail,
      title: `${reqDoc.type} Request Rejected`,
      message: `Your ${reqDoc.type} request of $${reqDoc.amount} on account ${reqDoc.accountNumber} was rejected by branch staff.`,
      type: 'Transaction',
      read: false,
      createdAt: now,
    });
  }

  await db.collection('deposit_withdraw_requests').updateOne(
    { requestId },
    {
      $set: {
        status,
        reviewedBy: session.user.email,
        reviewedAt: now,
        updatedAt: now,
      },
    },
  );

  revalidatePath('/dashboard/staff');
  revalidatePath('/dashboard/staff/requests');
  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/admin/requests');

  return { success: true, message: `Request ${status} successfully.` };
}
