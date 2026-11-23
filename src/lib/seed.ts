import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/db';

let seeded = false;

export async function seedDemoAccounts() {
  if (seeded) return;

  try {
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const bankAccountsCollection = db.collection('bank_accounts');

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

    // Customer's Bank Account
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 4. Pending Staff Account (for testing pending approval logic)
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
