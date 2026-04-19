import { NextResponse } from 'next/server';
import { allQuery } from '@/lib/db';

export async function GET() {
  try {
    const feed = await allQuery(`
      SELECT ut.id, ut.video_path, ut.created_at, u.username, t.location, t.intensity, t.description
      FROM user_tasks ut
      JOIN users u ON ut.user_id = u.id
      JOIN tasks t ON ut.task_id = t.id
      WHERE ut.is_public = 1 AND ut.video_path IS NOT NULL
      ORDER BY ut.created_at DESC
      LIMIT 50
    `);

    return NextResponse.json({ feed }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
