import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';
import Task from '@/models/Task';

export async function GET() {
  try {
    await connectDB();
    console.log('Fetching leaderboard data...');

    // Get all users first
    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users`);

    // Get task counts using aggregation by email
    const taskCounts = await Task.aggregate([
      {
        $match: { 
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$userId', // userId is storing the email
          completedCount: { $sum: 1 }
        }
      }
    ]);

    console.log('Task counts by email:', taskCounts);

    // Map task counts to users using email
    const leaderboardData = users.map(user => {
      const userTasks = taskCounts.find(t => t._id === user.email);
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        completedTasks: userTasks ? userTasks.completedCount : 0
      };
    });

    // Sort by completed tasks (descending)
    const sortedLeaderboard = leaderboardData.sort((a, b) => b.completedTasks - a.completedTasks);

    console.log('Final leaderboard:', JSON.stringify(sortedLeaderboard, null, 2));

    return NextResponse.json(sortedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}
