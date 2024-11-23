import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';

export async function POST(req) {
  try {
    await dbConnect();
    const { tasks } = await req.json();

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'Invalid tasks data' }, { status: 400 });
    }

    // Validate tasks according to schema
    const invalidTasks = tasks.filter(task => {
      const hasRequiredFields = task.userId && task.task;
      const validPriority = ['High', 'Medium', 'Low'].includes(task.priority);
      const validStatus = ['pending', 'in_progress', 'completed'].includes(task.status);
      
      return !hasRequiredFields || !validPriority || !validStatus;
    });

    if (invalidTasks.length > 0) {
      return NextResponse.json({ 
        error: 'Invalid task data', 
        details: 'Tasks must have userId, task, valid priority and status'
      }, { status: 400 });
    }

    const createdTasks = await Task.create(tasks);
    return NextResponse.json({ tasks: createdTasks });
  } catch (error) {
    console.error('Error creating tasks:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.message 
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    
    // Get userId from query parameter
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get other query parameters
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const sort = url.searchParams.get('sort') || '-createdAt'; // Default sort by newest

    // Build query
    const query = { userId };
    if (status && ['pending', 'in_progress', 'completed'].includes(status)) {
      query.status = status;
    }
    if (priority && ['High', 'Medium', 'Low'].includes(priority)) {
      query.priority = priority;
    }

    const tasks = await Task.find(query)
      .sort(sort)
      .lean()
      .exec();

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
