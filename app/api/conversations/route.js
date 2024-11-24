import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Conversation from '../../models/Conversation'

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

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const conversationId = url.searchParams.get('id');
    const userId = url.searchParams.get('userId');

    if (!conversationId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await dbConnect();
    const result = await Conversation.deleteOne({ _id: conversationId, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { conversationId, userId, title } = await request.json();

    if (!conversationId || !userId || !title) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await dbConnect();
    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      { $set: { title } },
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}
