import { NextResponse } from 'next/server';
import { allQuery } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const history = await allQuery(`
      SELECT ut.id, ut.video_path, ut.created_at, ut.is_public, t.location, t.intensity, t.description
      FROM user_tasks ut
      JOIN tasks t ON ut.task_id = t.id
      WHERE ut.user_id = ?
      ORDER BY ut.created_at DESC
    `, [session.user.id]);

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
