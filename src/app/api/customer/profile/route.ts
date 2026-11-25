import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
    const user = await db
      .collection('users')
      .findOne({ email }, { projection: { password: 0, transactionPin: 0 } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        kycVerified: Boolean(user.kycVerified),
        twoFactorEnabled: Boolean(user.twoFactorEnabled),
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Error in GET /api/customer/profile:', err);
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const body = await req.json();
    const {
      action,
      name,
      phone,
      twoFactorEnabled,
      currentPin,
      newPin,
      currentPassword,
      newPassword,
    } = body;

    const db = await getDatabase();
    const usersCol = db.collection('users');
    const user = await usersCol.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'change-pin') {
      if (!currentPin || !newPin || !/^\d{4,6}$/.test(String(newPin))) {
        return NextResponse.json(
          { error: 'New PIN must be 4 to 6 digits.' },
          { status: 400 },
        );
      }

      if (user.transactionPin) {
        const matches = await bcrypt.compare(
          String(currentPin),
          user.transactionPin,
        );
        if (!matches) {
          return NextResponse.json(
            { error: 'Current PIN is incorrect.' },
            { status: 403 },
          );
        }
      } else if (String(currentPin) !== '1234') {
        return NextResponse.json(
          { error: 'Current PIN is incorrect.' },
          { status: 403 },
        );
      }

      const hashedPin = await bcrypt.hash(String(newPin), 10);
      await usersCol.updateOne(
        { email },
        { $set: { transactionPin: hashedPin, updatedAt: new Date() } },
      );
      return NextResponse.json({
        success: true,
        message: 'Transaction PIN updated successfully.',
      });
    }

    if (action === 'change-password') {
      if (!user.password) {
        return NextResponse.json(
          { error: 'Google OAuth accounts do not use local passwords.' },
          { status: 400 },
        );
      }
      if (!currentPassword || !newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters.' },
          { status: 400 },
        );
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return NextResponse.json(
          { error: 'Current password is incorrect.' },
          { status: 403 },
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await usersCol.updateOne(
        { email },
        { $set: { password: hashedPassword, updatedAt: new Date() } },
      );
      return NextResponse.json({
        success: true,
        message: 'Password updated successfully.',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = { updatedAt: new Date() };
    if (typeof name === 'string' && name.trim()) {
      updates.name = name.trim();
      await db
        .collection('bank_accounts')
        .updateMany({ userEmail: email }, { $set: { userName: name.trim() } });
    }
    if (typeof phone === 'string') updates.phone = phone.trim();
    if (typeof twoFactorEnabled === 'boolean')
      updates.twoFactorEnabled = twoFactorEnabled;

    await usersCol.updateOne({ email }, { $set: updates });

    return NextResponse.json({
      success: true,
      message: 'Profile & security settings updated.',
    });
  } catch (err) {
    console.error('Error in PATCH /api/customer/profile:', err);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
