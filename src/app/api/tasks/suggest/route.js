import { NextResponse } from 'next/server';
import { allQuery } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location');
    const intensity = searchParams.get('intensity');

    if (!location || !intensity) {
      return NextResponse.json({ error: 'Location and intensity required' }, { status: 400 });
    }

    // Try to find a matching task
    const tasks = await allQuery(
      'SELECT id, location, intensity, description, quest_type, aura_reward FROM tasks WHERE LOWER(location) = LOWER(?) AND intensity = ?',
      [location, intensity]
    );

    if (tasks.length === 0) {
      // Create a generic fallback task
      const fallbackDescription = `Do something crazy and wild at the ${location} right now! (Intensity Level ${intensity})`;
      return NextResponse.json({ task: { id: 'generic', location, intensity, description: fallbackDescription, quest_type: 'side', aura_reward: 10 } }, { status: 200 });
    }

    // Pick a random task from matches
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
