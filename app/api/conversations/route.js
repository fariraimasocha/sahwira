import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Conversation from '@/models/conversation';

export async function GET(req) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    
    // Get userId from query parameter
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .select('title updatedAt messages')
      .lean();

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { messages, userId } = await request.json();
    if (!messages || !messages.length) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await dbConnect();
    
    // Create a title from the first user message
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
    const title = firstUserMessage.slice(0, 50) + (firstUserMessage.length > 50 ? '...' : '');

    const conversation = await Conversation.create({
      userId,
      messages,
      title
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
