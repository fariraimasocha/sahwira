import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';

export async function GET(req) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    
    // Get userId from query parameter
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get completed tasks count
    const completedTasks = await Task.countDocuments({
      userId,
      status: 'completed'
    });

    // Calculate points (10 points per completed task)
    const points = completedTasks * 10;

    return NextResponse.json({
      completedTasks,
      points
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
