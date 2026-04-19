import { NextResponse } from 'next/server';
import { runQuery, getQuery } from '@/lib/db';
import { getSession } from '@/lib/session';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const taskIdString = formData.get('taskId'); // task ID, or 'generic'
    const isPublic = formData.get('isPublic') === 'true' ? 1 : 0;
    const file = formData.get('video');
    const location = formData.get('location');
    const intensity = formData.get('intensity');
    const description = formData.get('description');

    let finalTaskId = taskIdString;
    let auraReward = 10; // default for generic

    // If it's a generic task, we need to create it in the database first to save it
    if (taskIdString === 'generic') {
      const result = await runQuery(
        'INSERT INTO tasks (location, intensity, description, quest_type, aura_reward) VALUES (?, ?, ?, ?, ?)',
        [location || 'unknown', intensity || 1, description || 'A wild task', 'side', auraReward]
      );
      finalTaskId = result.id;
    } else {
      const taskObj = await getQuery('SELECT aura_reward FROM tasks WHERE id = ?', [taskIdString]);
      if (taskObj && taskObj.aura_reward) {
        auraReward = taskObj.aura_reward;
      }
    }

    let videoPath = null;

    if (file && file.size > 0) {
      // Save file
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(file.name) || '.mp4';
      const fileName = `${session.user.id}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      
      videoPath = `/uploads/${fileName}`;
    }

    // Insert user_task
    const result = await runQuery(
      'INSERT INTO user_tasks (user_id, task_id, status, video_path, is_public) VALUES (?, ?, ?, ?, ?)',
      [session.user.id, finalTaskId, 'completed', videoPath, isPublic]
    );

    // Grant Aura
    await runQuery('UPDATE users SET aura = aura + ? WHERE id = ?', [auraReward, session.user.id]);

    return NextResponse.json({ success: true, userTaskId: result.id, videoPath, auraGained: auraReward }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
