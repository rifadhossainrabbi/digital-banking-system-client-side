'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db';

/** Helper to enforce Admin authorization */
async function requireAdmin() {
  const session = await auth();
  if (!session || !session.user || !session.user.email) {
    throw new Error('Unauthorized: Authentication required.');
  }
  if (session.user.role !== 'Admin') {
    throw new Error('Forbidden: Admin privilege required.');
  }
  return session;
}

// ─── 1. Dashboard Overview & Real Analytics ──────────────────────────────────
export async function getAdminDashboardDataAction() {
  await requireAdmin();
  const db = await getDatabase();

  const usersCol = db.collection('users');
  const accountsCol = db.collection('bank_accounts');
  const transactionsCol = db.collection('transactions');
  const loansCol = db.collection('loans');
  const requestsCol = db.collection('deposit_withdraw_requests');

  // Key Counts
  const [
    totalCustomers,
    totalAccounts,
    allAccounts,
    totalTransactions,
    pendingLoans,
    pendingRequests,
    flaggedTxns,
  ] = await Promise.all([
    usersCol.countDocuments({ role: 'Customer' }),
    accountsCol.countDocuments(),
    accountsCol.find().toArray(),
    transactionsCol.countDocuments(),
    loansCol.countDocuments({ status: { $in: ['Pending', 'Under Review'] } }),
    requestsCol.countDocuments({ status: 'Pending' }),
    transactionsCol.countDocuments({ isSuspicious: true }),
  ]);

  const totalBalance = allAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  // Totals from completed transactions
  const [depositRes, withdrawRes] = await Promise.all([
    transactionsCol
      .aggregate([
        { $match: { type: 'Deposit', status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .toArray(),
    transactionsCol
      .aggregate([
        { $match: { type: 'Withdrawal', status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .toArray(),
  ]);

  const totalDeposits = depositRes[0]?.total ?? 0;
  const totalWithdrawals = withdrawRes[0]?.total ?? 0;

  // Account Type Distribution
  const accountDistribution = await accountsCol
    .aggregate([
      { $group: { _id: '$accountType', count: { $sum: 1 }, totalBalance: { $sum: '$balance' } } },
      { $project: { type: '$_id', count: 1, totalBalance: 1, _id: 0 } },
    ])
    .toArray();

  // Loan Status Distribution
  const loanStats = await loansCol
    .aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$requestedAmount' } } },
      { $project: { status: '$_id', count: 1, totalAmount: 1, _id: 0 } },
    ])
    .toArray();

  // 6-Month Inflow/Outflow Trends
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dataMap: { [key: string]: { month: string; deposit: number; withdrawal: number; transfer: number } } = {};
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const key = `${MONTHS[past.getMonth()]} ${past.getFullYear().toString().slice(-2)}`;
    dataMap[key] = { month: key, deposit: 0, withdrawal: 0, transfer: 0 };
  }

  // Populate from transactions
  const sixMonthsAgo = new Date(d.getFullYear(), d.getMonth() - 5, 1);
  const recentTransactions = await transactionsCol
    .find({ createdAt: { $gte: sixMonthsAgo } })
    .toArray();

  recentTransactions.forEach(t => {
    const date = new Date(t.createdAt);
    const key = `${MONTHS[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
    if (dataMap[key]) {
      if (t.type === 'Deposit' || t.type === 'Loan Disbursement') {
        dataMap[key].deposit += t.amount || 0;
      } else if (t.type === 'Withdrawal') {
        dataMap[key].withdrawal += t.amount || 0;
      } else {
        dataMap[key].transfer += t.amount || 0;
      }
    }
  });

  // Recent 6 transactions for overview table
  const latestTransactions = await transactionsCol
    .find()
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();

  return {
    metrics: {
      totalCustomers,
      totalAccounts,
      totalBalance: parseFloat(totalBalance.toFixed(2)),
      totalDeposits: parseFloat(totalDeposits.toFixed(2)),
      totalWithdrawals: parseFloat(totalWithdrawals.toFixed(2)),
      totalTransactions,
      pendingLoans,
      pendingRequests,
      flaggedTxns,
    },
    charts: {
      monthlyActivity: Object.values(dataMap),
      accountDistribution: accountDistribution.map(a => ({
        ...a,
        totalBalance: parseFloat((a.totalBalance || 0).toFixed(2)),
      })),
      loanStats,
    },
    latestTransactions: JSON.parse(JSON.stringify(latestTransactions)),
  };
}

// ─── 2. Customer Management Actions ───────────────────────────────────────────
export async function getAdminCustomersAction(search = '', page = 1, limit = 20) {
  await requireAdmin();
  const db = await getDatabase();
  const usersCol = db.collection('users');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { role: 'Customer' };
  if (search.trim()) {
    const r = new RegExp(search.trim(), 'i');
    query.$or = [{ name: r }, { email: r }, { phone: r }];
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [total, customers] = await Promise.all([
    usersCol.countDocuments(query),
    usersCol
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

export async function getCustomerDetailsAction(email: string) {
  await requireAdmin();
  const db = await getDatabase();

  const customer = await db.collection('users').findOne(
    { email: email.toLowerCase() },
    { projection: { password: 0, transactionPin: 0 } }
  );

  if (!customer) {
    throw new Error('Customer not found.');
  }

  const [accounts, loans, transactions] = await Promise.all([
    db.collection('bank_accounts').find({ userEmail: customer.email }).toArray(),
    db.collection('loans').find({ userEmail: customer.email }).toArray(),
    db.collection('transactions')
      .find({
        $or: [{ senderEmail: customer.email }, { receiverEmail: customer.email }],
      })
      .sort({ createdAt: -1 })
      .limit(15)
      .toArray(),
  ]);

  return {
    customer: JSON.parse(JSON.stringify(customer)),
    accounts: JSON.parse(JSON.stringify(accounts)),
    loans: JSON.parse(JSON.stringify(loans)),
    transactions: JSON.parse(JSON.stringify(transactions)),
  };
}

export async function updateCustomerStatusAction(email: string, status: 'Active' | 'Suspended' | 'Blocked') {
  await requireAdmin();
  const db = await getDatabase();

  await db.collection('users').updateOne(
    { email: email.toLowerCase() },
    { $set: { status, updatedAt: new Date() } }
  );

  // If blocked or suspended, also freeze all bank accounts
  if (status === 'Blocked' || status === 'Suspended') {
    await db.collection('bank_accounts').updateMany(
      { userEmail: email.toLowerCase() },
      { $set: { status: 'Frozen', updatedAt: new Date() } }
    );
  } else if (status === 'Active') {
    await db.collection('bank_accounts').updateMany(
      { userEmail: email.toLowerCase(), status: 'Frozen' },
      { $set: { status: 'Active', updatedAt: new Date() } }
    );
  }

  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/admin/customers');
  return { success: true, message: `Customer status updated to ${status}.` };
}

// ─── 3. Bank Account Management Actions ───────────────────────────────────────
export async function getAdminAccountsAction(search = '', status = 'All', page = 1, limit = 20) {
  await requireAdmin();
  const db = await getDatabase();
  const accountsCol = db.collection('bank_accounts');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (status !== 'All') query.status = status;
  if (search.trim()) {
    const r = new RegExp(search.trim(), 'i');
    query.$or = [{ accountNumber: r }, { userName: r }, { userEmail: r }];
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [total, accounts] = await Promise.all([
    accountsCol.countDocuments(query),
    accountsCol
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  ]);

  return {
    accounts: JSON.parse(JSON.stringify(accounts)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createBankAccountAction(data: {
  userEmail: string;
  accountType: 'Savings Account' | 'Current Account' | 'Business Account';
  initialDeposit?: number;
  dailyLimit?: number;
  maxSingleTransaction?: number;
  minBalance?: number;
}) {
  await requireAdmin();
  const db = await getDatabase();
  const customer = await db.collection('users').findOne({ email: data.userEmail.toLowerCase() });

  if (!customer) {
    throw new Error('Target customer user not found.');
  }

  const accountNumber = '10' + Math.floor(10000000 + Math.random() * 90000000);
  const depositAmount = Number(data.initialDeposit) || 0;

  const newAccount = {
    userId: customer._id.toString(),
    userEmail: customer.email,
    userName: customer.name,
    accountNumber,
    accountType: data.accountType,
    balance: depositAmount,
    status: 'Active',
    dailyLimit: Number(data.dailyLimit) || (data.accountType === 'Business Account' ? 25000 : 5000),
    maxSingleTransaction: Number(data.maxSingleTransaction) || (data.accountType === 'Business Account' ? 10000 : 2000),
    minBalance: Number(data.minBalance) || (data.accountType === 'Business Account' ? 500 : 50),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const insertResult = await db.collection('bank_accounts').insertOne(newAccount);

  if (depositAmount > 0) {
    const txnId = 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
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
      description: `Admin Provisioning Initial Deposit for ${data.accountType}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/admin/accounts');
  return {
    success: true,
    message: `Account ${accountNumber} created successfully.`,
    accountId: insertResult.insertedId.toString(),
  };
}

export async function updateBankAccountAction(
  accountNumber: string,
  data: {
    status?: 'Active' | 'Frozen' | 'Closed';
    dailyLimit?: number;
    maxSingleTransaction?: number;
    minBalance?: number;
  }
) {
  await requireAdmin();
  const db = await getDatabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFields: any = { updatedAt: new Date() };
  if (data.status) updateFields.status = data.status;
  if (data.dailyLimit != null) updateFields.dailyLimit = Number(data.dailyLimit);
  if (data.maxSingleTransaction != null) updateFields.maxSingleTransaction = Number(data.maxSingleTransaction);
  if (data.minBalance != null) updateFields.minBalance = Number(data.minBalance);

  await db.collection('bank_accounts').updateOne({ accountNumber }, { $set: updateFields });

  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/admin/accounts');
  return { success: true, message: `Account ${accountNumber} updated successfully.` };
}

// ─── 4. Loan Management Actions (With Automatic Disbursement) ─────────────────
export async function getAdminLoansAction(search = '', status = 'All', page = 1, limit = 20) {
  await requireAdmin();
  const db = await getDatabase();
  const loansCol = db.collection('loans');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (status !== 'All') query.status = status;
  if (search.trim()) {
    const r = new RegExp(search.trim(), 'i');
    query.$or = [{ loanId: r }, { userName: r }, { userEmail: r }, { accountNumber: r }];
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [total, loans] = await Promise.all([
    loansCol.countDocuments(query),
    loansCol
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

export async function reviewLoanAction(
  loanId: string,
  status: 'Approved' | 'Rejected' | 'Under Review',
  adminNote = ''
) {
  await requireAdmin();
  const db = await getDatabase();
  const loan = await db.collection('loans').findOne({ loanId });

  if (!loan) {
    throw new Error('Loan not found.');
  }

  const now = new Date();

  // If Approving a pending or under-review loan, disburse funds atomically
  if (status === 'Approved' && (loan.status === 'Pending' || loan.status === 'Under Review')) {
    const disburseAmount = Number(loan.requestedAmount);
    const targetAccount = loan.accountNumber;
    const txnId = 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // 1. Update Loan
    await db.collection('loans').updateOne(
      { loanId },
      {
        $set: {
          status: 'Active',
          adminNote: adminNote || 'Approved and disbursed by Bank Admin',
          remainingBalance: disburseAmount,
          paidAmount: 0,
          approvedAt: now,
          disbursedAt: now,
          updatedAt: now,
        },
      }
    );

    // 2. Credit target bank account
    await db.collection('bank_accounts').updateOne(
      { accountNumber: targetAccount },
      { $inc: { balance: disburseAmount }, $set: { updatedAt: now } }
    );

    // 3. Record disbursement transaction
    await db.collection('transactions').insertOne({
      transactionId: txnId,
      senderAccount: 'SYSTEM',
      senderName: 'Vaultly Loan Department',
      senderEmail: 'loans@vaultly.bank',
      receiverAccount: targetAccount,
      receiverName: loan.userName,
      receiverEmail: loan.userEmail,
      type: 'Loan Disbursement',
      amount: disburseAmount,
      fee: 0,
      status: 'Completed',
      description: `${loan.loanType} Disbursement — Approved Loan ID: ${loanId}`,
      relatedLoanId: loanId,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Send customer notification
    await db.collection('notifications').insertOne({
      userEmail: loan.userEmail,
      title: 'Loan Approved & Disbursed',
      message: `Your ${loan.loanType} application (${loanId}) of $${disburseAmount} was approved and disbursed into account ${targetAccount}.`,
      type: 'Loan',
      read: false,
      createdAt: now,
    });

    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/admin/loans');
    return {
      success: true,
      message: `Loan ${loanId} approved and $${disburseAmount} credited to account ${targetAccount}.`,
    };
  }

  // If Rejecting
  await db.collection('loans').updateOne(
    { loanId },
    { $set: { status, adminNote: adminNote || '', updatedAt: now } }
  );

  if (status === 'Rejected') {
    await db.collection('notifications').insertOne({
      userEmail: loan.userEmail,
      title: 'Loan Application Rejected',
      message: `Your ${loan.loanType} application (${loanId}) was not approved. Note: ${adminNote || 'Does not meet current credit requirements.'}`,
      type: 'Loan',
      read: false,
      createdAt: now,
    });
  }

  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/admin/loans');
  return { success: true, message: `Loan status updated to ${status}.` };
}

// ─── 5. Deposit & Withdrawal Request Approvals ───────────────────────────────
export async function getAdminRequestsAction(status = 'All', page = 1, limit = 20) {
  await requireAdmin();
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

export async function reviewDepositWithdrawRequestAction(requestId: string, status: 'Approved' | 'Rejected') {
  await requireAdmin();
  const db = await getDatabase();
  const reqDoc = await db.collection('deposit_withdraw_requests').findOne({ requestId });

  if (!reqDoc) {
    throw new Error('Request not found.');
  }
  if (reqDoc.status !== 'Pending') {
    throw new Error('Only Pending requests can be updated.');
  }

  const now = new Date();
  await db.collection('deposit_withdraw_requests').updateOne(
    { requestId },
    { $set: { status, updatedAt: now } }
  );

  if (status === 'Approved') {
    const balanceDelta = reqDoc.type === 'Deposit' ? reqDoc.amount : -reqDoc.amount;
    await db.collection('bank_accounts').updateOne(
      { accountNumber: reqDoc.accountNumber },
      { $inc: { balance: balanceDelta }, $set: { updatedAt: now } }
    );

    const txnId = 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const user = await db.collection('users').findOne({ email: reqDoc.userEmail });
    await db.collection('transactions').insertOne({
      transactionId: txnId,
      senderAccount: reqDoc.type === 'Deposit' ? 'SYSTEM' : reqDoc.accountNumber,
      senderName: reqDoc.type === 'Deposit' ? 'Vaultly Central Reserve' : user?.name || 'Customer',
      senderEmail: reqDoc.type === 'Deposit' ? 'system@vaultly.bank' : reqDoc.userEmail,
      receiverAccount: reqDoc.type === 'Deposit' ? reqDoc.accountNumber : 'SYSTEM',
      receiverName: reqDoc.type === 'Deposit' ? user?.name || 'Customer' : 'Vaultly Processing',
      receiverEmail: reqDoc.type === 'Deposit' ? reqDoc.userEmail : 'system@vaultly.bank',
      type: reqDoc.type,
      amount: reqDoc.amount,
      fee: 0,
      status: 'Completed',
      description: `Admin Approved — ${reqDoc.type} Request ${requestId}`,
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
      message: `Your ${reqDoc.type} request of $${reqDoc.amount} on account ${reqDoc.accountNumber} was rejected by administration.`,
      type: 'Transaction',
      read: false,
      createdAt: now,
    });
  }

  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/admin/requests');
  return { success: true, message: `Request ${status} successfully.` };
}

// ─── 6. Transaction Auditing & Suspicious Flag Reviews ────────────────────────
export async function getAdminTransactionsAction(params: {
  search?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  flaggedOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();
  const db = await getDatabase();
  const txnCol = db.collection('transactions');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (params.type && params.type !== 'All') query.type = params.type;
  if (params.status && params.status !== 'All') query.status = params.status;
  if (params.flaggedOnly) query.isSuspicious = true;

  if (params.startDate || params.endDate) {
    query.createdAt = {};
    if (params.startDate) query.createdAt.$gte = new Date(params.startDate);
    if (params.endDate) query.createdAt.$lte = new Date(params.endDate);
  }

  if (params.search && params.search.trim()) {
    const r = new RegExp(params.search.trim(), 'i');
    query.$or = [
      { transactionId: r },
      { senderName: r },
      { receiverName: r },
      { senderAccount: r },
      { receiverAccount: r },
      { description: r },
    ];
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, params.limit || 20);
  const skip = (page - 1) * limit;

  const [total, transactions] = await Promise.all([
    txnCol.countDocuments(query),
    txnCol
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

export async function reviewSuspiciousTransactionAction(
  txnId: string,
  action: 'Dismiss' | 'Reverse',
  note = ''
) {
  await requireAdmin();
  const db = await getDatabase();
  const txn = await db.collection('transactions').findOne({ transactionId: txnId });

  if (!txn) {
    throw new Error('Transaction not found.');
  }

  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {
    adminReviewNote: note || '',
    adminReviewedAt: now,
    updatedAt: now,
  };

  if (action === 'Dismiss') {
    updates.isSuspicious = false;
    updates.flagStatus = 'Resolved - Cleared by Admin';
  } else if (action === 'Reverse' && txn.status === 'Completed') {
    if (txn.type === 'Transfer') {
      await db.collection('bank_accounts').updateOne(
        { accountNumber: txn.senderAccount },
        { $inc: { balance: txn.amount }, $set: { updatedAt: now } }
      );
      await db.collection('bank_accounts').updateOne(
        { accountNumber: txn.receiverAccount },
        { $inc: { balance: -txn.amount }, $set: { updatedAt: now } }
      );
    }
    updates.status = 'Reversed';
    updates.flagStatus = 'Resolved - Reversal Executed';
  }

  await db.collection('transactions').updateOne({ transactionId: txnId }, { $set: updates });

  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/admin/transactions');
  return { success: true, message: `Transaction review recorded: ${action}.` };
}

// ─── 7. Staff Management Actions ──────────────────────────────────────────────
export async function getAdminStaffAction() {
  await requireAdmin();
  const db = await getDatabase();

  const staff = await db
    .collection('users')
    .find({ role: 'Bank Staff' }, { projection: { password: 0, transactionPin: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return { staff: JSON.parse(JSON.stringify(staff)) };
}

export async function createStaffMemberAction(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  employeeId?: string;
  branchCode?: string;
}) {
  await requireAdmin();
  const db = await getDatabase();

  const existing = await db.collection('users').findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new Error('Email already registered for another user.');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const result = await db.collection('users').insertOne({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: hashedPassword,
    role: 'Bank Staff',
    status: 'Active',
    phone: data.phone || null,
    employeeId: data.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    branchCode: data.branchCode || 'VLT-MAIN-01',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath('/dashboard/admin/staff');
  return {
    success: true,
    message: 'Staff member onboarded successfully.',
    staffId: result.insertedId.toString(),
  };
}
