import { NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/db';
import { getSession } from '@/lib/session';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Check if user exists
    const existing = await getQuery('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Create user
    const result = await runQuery('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    // Create session
    const session = await getSession();
    session.user = { id: result.id, username };
    await session.save();

    return NextResponse.json({ user: session.user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
