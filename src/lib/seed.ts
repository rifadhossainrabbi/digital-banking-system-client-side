import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/db';

let seeded = false;

export async function seedDemoAccounts() {
  if (seeded) return;

  try {
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const bankAccountsCollection = db.collection('bank_accounts');
    const transactionsCollection = db.collection('transactions');
    const loansCollection = db.collection('loans');

    // 1. Admin Demo Account
    const existingAdmin = await usersCollection.findOne({
      email: 'admin@vaultly.bank',
    });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@1234', 10);
      await usersCollection.insertOne({
        name: 'System Admin',
        email: 'admin@vaultly.bank',
        password: hashedPassword,
        role: 'Admin',
        status: 'Active',
        phone: '+1 (555) 100-0001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 2. Bank Staff Demo Account (Approved / Active)
    const existingStaff = await usersCollection.findOne({
      email: 'staff@vaultly.bank',
    });
    if (!existingStaff) {
      const hashedPassword = await bcrypt.hash('Staff@1234', 10);
      await usersCollection.insertOne({
        name: 'Sarah Jenkins',
        email: 'staff@vaultly.bank',
        password: hashedPassword,
        role: 'Bank Staff',
        status: 'Active',
        employeeId: 'EMP-4092',
        branchCode: 'VLT-NYC-01',
        phone: '+1 (555) 200-4092',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 3. Customer Demo Account
    const existingCustomer = await usersCollection.findOne({
      email: 'customer@vaultly.bank',
    });
    let customerUserId = existingCustomer?._id;
    if (!existingCustomer) {
      const hashedPassword = await bcrypt.hash('Customer@1234', 10);
      const hashedPin = await bcrypt.hash('1234', 10);
      const insertResult = await usersCollection.insertOne({
        name: 'Alexander Vance',
        email: 'customer@vaultly.bank',
        password: hashedPassword,
        role: 'Customer',
        status: 'Active',
        phone: '+1 (555) 234-5678',
        accountType: 'Savings Account',
        transactionPin: hashedPin,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      customerUserId = insertResult.insertedId;
    }

    // Customer Primary Savings Account
    const existingBankAccount = await bankAccountsCollection.findOne({
      accountNumber: '1008492041',
    });
    if (!existingBankAccount && customerUserId) {
      await bankAccountsCollection.insertOne({
        userId: customerUserId.toString(),
        userEmail: 'customer@vaultly.bank',
        userName: 'Alexander Vance',
        accountNumber: '1008492041',
        accountType: 'Savings Account',
        balance: 25480.0,
        status: 'Active',
        dailyLimit: 10000,
        maxSingleTransaction: 5000,
        minBalance: 100,
        createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
        updatedAt: new Date(),
      });
    }

    // Customer Secondary Business Account (Enables multi-account switching)
    const existingBusinessAccount = await bankAccountsCollection.findOne({
      accountNumber: '1009841205',
    });
    if (!existingBusinessAccount && customerUserId) {
      await bankAccountsCollection.insertOne({
        userId: customerUserId.toString(),
        userEmail: 'customer@vaultly.bank',
        userName: 'Alexander Vance',
        accountNumber: '1009841205',
        accountType: 'Business Account',
        balance: 14250.0,
        status: 'Active',
        dailyLimit: 25000,
        maxSingleTransaction: 10000,
        minBalance: 500,
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        updatedAt: new Date(),
      });
    }

    // Sample Recipient Customer (for in-bank transfers)
    const existingDemoRecipient = await usersCollection.findOne({
      email: 'elena.rostova@vaultly.bank',
    });
    if (!existingDemoRecipient) {
      const recipientPass = await bcrypt.hash('Elena@1234', 10);
      const recipientUser = await usersCollection.insertOne({
        name: 'Elena Rostova',
        email: 'elena.rostova@vaultly.bank',
        password: recipientPass,
        role: 'Customer',
        status: 'Active',
        phone: '+1 (555) 987-6543',
        accountType: 'Current Account',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await bankAccountsCollection.insertOne({
        userId: recipientUser.insertedId.toString(),
        userEmail: 'elena.rostova@vaultly.bank',
        userName: 'Elena Rostova',
        accountNumber: '1003489112',
        accountType: 'Current Account',
        balance: 8900.0,
        status: 'Active',
        dailyLimit: 5000,
        maxSingleTransaction: 2000,
        minBalance: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 4. Sample Transactions for Customer
    const existingTxnCount = await transactionsCollection.countDocuments({
      $or: [
        { senderEmail: 'customer@vaultly.bank' },
        { receiverEmail: 'customer@vaultly.bank' },
      ],
    });

    if (existingTxnCount === 0) {
      const now = Date.now();
      const sampleTxns = [
        {
          transactionId: 'TXN-8F92A14B',
          senderAccount: 'SYSTEM',
          senderName: 'Vaultly Payroll Systems',
          senderEmail: 'payroll@vaultly.bank',
          receiverAccount: '1008492041',
          receiverName: 'Alexander Vance',
          receiverEmail: 'customer@vaultly.bank',
          type: 'Deposit',
          amount: 5400.0,
          fee: 0,
          status: 'Completed',
          description: 'Monthly Salary Direct Deposit',
          createdAt: new Date(now - 3 * 24 * 3600 * 1000),
          updatedAt: new Date(now - 3 * 24 * 3600 * 1000),
        },
        {
          transactionId: 'TXN-4B11E99A',
          senderAccount: '1008492041',
          senderName: 'Alexander Vance',
          senderEmail: 'customer@vaultly.bank',
          receiverAccount: '1003489112',
          receiverName: 'Elena Rostova',
          receiverEmail: 'elena.rostova@vaultly.bank',
          type: 'Transfer',
          amount: 850.0,
          fee: 0,
          status: 'Completed',
          description: 'Office Co-working Space Share',
          createdAt: new Date(now - 6 * 24 * 3600 * 1000),
          updatedAt: new Date(now - 6 * 24 * 3600 * 1000),
        },
        {
          transactionId: 'TXN-7A23C88D',
          senderAccount: '1008492041',
          senderName: 'Alexander Vance',
          senderEmail: 'customer@vaultly.bank',
          receiverAccount: 'ATM-VLT-04',
          receiverName: 'ATM Cash Withdrawal',
          receiverEmail: 'atm@vaultly.bank',
          type: 'Withdrawal',
          amount: 400.0,
          fee: 0,
          status: 'Completed',
          description: 'Cash Withdrawal at Metro ATM #4',
          createdAt: new Date(now - 10 * 24 * 3600 * 1000),
          updatedAt: new Date(now - 10 * 24 * 3600 * 1000),
        },
        {
          transactionId: 'TXN-2E90F44C',
          senderAccount: 'SYSTEM',
          senderName: 'Vanguard Global Assets',
          senderEmail: 'dividends@vanguard.com',
          receiverAccount: '1008492041',
          receiverName: 'Alexander Vance',
          receiverEmail: 'customer@vaultly.bank',
          type: 'Deposit',
          amount: 1250.0,
          fee: 0,
          status: 'Completed',
          description: 'Quarterly Investment Dividend',
          createdAt: new Date(now - 15 * 24 * 3600 * 1000),
          updatedAt: new Date(now - 15 * 24 * 3600 * 1000),
        },
        {
          transactionId: 'TXN-9C55D21E',
          senderAccount: '1008492041',
          senderName: 'Alexander Vance',
          senderEmail: 'customer@vaultly.bank',
          receiverAccount: '1009841205',
          receiverName: 'Alexander Vance',
          receiverEmail: 'customer@vaultly.bank',
          type: 'Transfer',
          amount: 2000.0,
          fee: 0,
          status: 'Completed',
          description: 'Internal Transfer to Business Account',
          createdAt: new Date(now - 20 * 24 * 3600 * 1000),
          updatedAt: new Date(now - 20 * 24 * 3600 * 1000),
        },
      ];

      await transactionsCollection.insertMany(sampleTxns);
    }

    // 5. Sample Loan for Customer
    const existingLoan = await loansCollection.findOne({
      userEmail: 'customer@vaultly.bank',
    });
    if (!existingLoan && customerUserId) {
      await loansCollection.insertOne({
        loanId: 'LN-40291',
        userId: customerUserId.toString(),
        userEmail: 'customer@vaultly.bank',
        userName: 'Alexander Vance',
        accountNumber: '1008492041',
        loanType: 'Personal Loan',
        requestedAmount: 12000.0,
        interestRate: 5.5,
        durationMonths: 24,
        monthlyInstallment: 529.18,
        monthlyIncome: 7500.0,
        employmentStatus: 'Employed',
        description: 'Home Office Renovation & Modernization',
        status: 'Active',
        remainingBalance: 9525.26,
        paidAmount: 3175.08,
        repayments: [
          {
            paymentId: 'PAY-891A',
            amount: 529.18,
            paymentDate: new Date(Date.now() - 60 * 24 * 3600 * 1000),
            accountNumber: '1008492041',
            remainingAfter: 11470.82,
          },
          {
            paymentId: 'PAY-892B',
            amount: 529.18,
            paymentDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
            accountNumber: '1008492041',
            remainingAfter: 10941.64,
          },
        ],
        approvedAt: new Date(Date.now() - 75 * 24 * 3600 * 1000),
        disbursedAt: new Date(Date.now() - 75 * 24 * 3600 * 1000),
        createdAt: new Date(Date.now() - 75 * 24 * 3600 * 1000),
        updatedAt: new Date(),
      });
    }

    // 6. Pending Staff Account
    const existingPendingStaff = await usersCollection.findOne({
      email: 'pending.staff@vaultly.bank',
    });
    if (!existingPendingStaff) {
      const hashedPassword = await bcrypt.hash('Staff@1234', 10);
      await usersCollection.insertOne({
        name: 'Marcus Brody',
        email: 'pending.staff@vaultly.bank',
        password: hashedPassword,
        role: 'Bank Staff',
        status: 'Pending Approval',
        employeeId: 'EMP-9901',
        branchCode: 'VLT-LA-02',
        phone: '+1 (555) 200-9901',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    seeded = true;
  } catch (err) {
    console.error('Error during demo accounts seeding:', err);
  }
}
