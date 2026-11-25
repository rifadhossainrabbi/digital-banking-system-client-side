import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
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
    const col = db.collection('notifications');

    const [notifications, unreadCount] = await Promise.all([
      col
        .find({ userEmail: email })
        .sort({ createdAt: -1 })
        .limit(25)
        .toArray(),
      col.countDocuments({ userEmail: email, read: false }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Error in GET /api/customer/notifications:', err);
    return NextResponse.json(
      { error: 'Failed to load notifications' },
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
    const { id, markAll } = body;

    const db = await getDatabase();
    const col = db.collection('notifications');

    if (markAll) {
      await col.updateMany(
        { userEmail: email, read: false },
        { $set: { read: true } },
      );
      return NextResponse.json({ success: true });
    }

    if (id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: any = ObjectId.isValid(id)
        ? { _id: new ObjectId(id), userEmail: email }
        : { _id: id, userEmail: email };
      await col.updateOne(filter, { $set: { read: true } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in PATCH /api/customer/notifications:', err);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 },
    );
  }
}
