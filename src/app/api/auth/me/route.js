import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  // Fetch latest aura and user details from DB
  const { getQuery } = require('@/lib/db');
  const dbUser = await getQuery('SELECT id, username, aura FROM users WHERE id = ?', [session.user.id]);

  if (!dbUser) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: dbUser }, { status: 200 });
}
