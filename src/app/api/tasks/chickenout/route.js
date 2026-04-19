import { NextResponse } from 'next/server';
import { runQuery, getQuery } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, intensity, location, description } = body;

    let finalTaskId = taskId;
    let auraPenalty = 10; // default for generic (intensity 1)

    if (taskId === 'generic') {
      // Calculate generic penalty from intensity roughly matching the reward ladder
      if (intensity == 2) auraPenalty = 30;
      else if (intensity == 3) auraPenalty = 50;
      else if (intensity == 4) auraPenalty = 80;
      else if (intensity == 5) auraPenalty = 100;

      const result = await runQuery(
        'INSERT INTO tasks (location, intensity, description, quest_type, aura_reward) VALUES (?, ?, ?, ?, ?)',
        [location || 'unknown', intensity || 1, description || 'A wild task', 'side', auraPenalty]
      );
      finalTaskId = result.id;
    } else {
      const taskObj = await getQuery('SELECT aura_reward FROM tasks WHERE id = ?', [taskId]);
      if (taskObj && taskObj.aura_reward) {
        auraPenalty = taskObj.aura_reward;
      }
    }

    // Insert user_task with 'failed' status
    await runQuery(
      'INSERT INTO user_tasks (user_id, task_id, status, is_public) VALUES (?, ?, ?, ?)',
      [session.user.id, finalTaskId, 'failed', 0]
    );

    // Deduct Aura
    await runQuery('UPDATE users SET aura = aura - ? WHERE id = ?', [auraPenalty, session.user.id]);

    return NextResponse.json({ success: true, auraLost: auraPenalty }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
