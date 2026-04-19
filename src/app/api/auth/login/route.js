import { NextResponse } from 'next/server';
import { getQuery } from '@/lib/db';
import { getSession } from '@/lib/session';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const user = await getQuery('SELECT id, username, password FROM users WHERE username = ?', [username]);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashedPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const session = await getSession();
    session.user = { id: user.id, username: user.username };
    await session.save();

    return NextResponse.json({ user: session.user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
