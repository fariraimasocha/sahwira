"use client";
import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

export default function ConversationSidebar({ onSelectConversation, currentConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations();
    }
  }, [session?.user?.id]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/conversations?userId=${session.user.id}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Please sign in to view conversations</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="flex flex-col gap-2 p-4">
        {conversations.map((conversation) => (
          <Button
            key={conversation._id}
            variant="ghost"
            className={cn(
              "flex flex-col items-start gap-1 h-auto p-3 hover:bg-accent",
              currentConversationId === conversation._id && "bg-accent"
            )}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-center gap-2 w-full">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium truncate flex-1">
                {conversation.title}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(conversation.updatedAt), 'MMM d, yyyy')}
            </span>
          </Button>
        ))}

        {conversations.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            No conversations yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
