import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Task from '@/models/Task';
import Conversation from '../../../../models/Conversation';

export async function GET(request) {
  try {
    // Check if user is admin
    const url = new URL(request.url);
    const userEmail = url.searchParams.get('email');

    if (userEmail !== 'fariraimasocha@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get counts
    const userCount = await User.countDocuments();
    const taskCount = await Task.countDocuments();
    const conversationCount = await Conversation.countDocuments();

    // Get daily stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await Promise.all([
      Task.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            tasks: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]),
      Conversation.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            conversations: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ])
    ]);

    // Combine daily stats
    const [taskStats, conversationStats] = dailyStats;
    const combinedStats = {};

    taskStats.forEach(stat => {
      if (!combinedStats[stat._id]) {
        combinedStats[stat._id] = { date: stat._id, tasks: 0, conversations: 0 };
      }
      combinedStats[stat._id].tasks = stat.tasks;
    });

    conversationStats.forEach(stat => {
      if (!combinedStats[stat._id]) {
        combinedStats[stat._id] = { date: stat._id, tasks: 0, conversations: 0 };
      }
      combinedStats[stat._id].conversations = stat.conversations;
    });

    return NextResponse.json({
      stats: {
        users: userCount,
        tasks: taskCount,
        conversations: conversationCount
      },
      dailyStats: Object.values(combinedStats)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
