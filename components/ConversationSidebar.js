"use client";
import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Loader2, Trash2, Edit2, Check, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

export default function ConversationSidebar({ onSelectConversation, currentConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      const fetchConversations = async () => {
        const loadingToast = toast.loading('Loading conversations...');
        try {
          const response = await fetch(`/api/conversations?userId=${session.user.id}`);
          if (!response.ok) throw new Error('Failed to fetch conversations');
          const data = await response.json();
          setConversations(data);
          toast.dismiss(loadingToast);
          if (data.length === 0) {
            toast('No conversations found', {
              icon: '💭',
              duration: 3000
            });
          }
        } catch (error) {
          console.error('Error fetching conversations:', error);
          toast.error('Failed to load conversations', {
            duration: 4000
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchConversations();
    }
  }, [session?.user?.id]);

  const handleDelete = async (e, conversationId) => {
    e.stopPropagation();
    
    // Custom confirm toast
    const confirmDelete = () => {
      return new Promise((resolve) => {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <p className="font-medium">Delete this conversation?</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ), { duration: 5000 });
      });
    };

    const shouldDelete = await confirmDelete();
    if (!shouldDelete) return;

    const deleteToast = toast.loading('Deleting conversation...');
    try {
      const response = await fetch(
        `/api/conversations?id=${conversationId}&userId=${session.user.id}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) throw new Error('Failed to delete conversation');
      
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      toast.success('Conversation deleted', {
        id: deleteToast,
        duration: 3000
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation', {
        id: deleteToast,
        duration: 4000
      });
    }
  };

  const startEditing = (e, conversation) => {
    e.stopPropagation();
    setEditingId(conversation._id);
    setEditTitle(conversation.title);
    toast('Editing title...', {
      icon: '✏️',
      duration: 2000
    });
  };

  const handleTitleUpdate = async (e, conversationId) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      toast.error('Title cannot be empty', {
        duration: 3000
      });
      return;
    }

    const updateToast = toast.loading('Updating title...');
    try {
      const response = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: session.user.id,
          title: editTitle.trim()
        }),
      });

      if (!response.ok) throw new Error('Failed to update title');
      
      const updatedConversation = await response.json();
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversationId ? updatedConversation : conv
        )
      );
      setEditingId(null);
      toast.success('Title updated', {
        id: updateToast,
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title', {
        id: updateToast,
        duration: 4000
      });
    }
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
    toast('Edit cancelled', {
      icon: '❌',
      duration: 2000
    });
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
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="flex flex-col gap-2 p-4">
        {conversations.map((conversation) => (
          <div
            key={conversation._id}
            className={cn(
              "relative flex flex-col gap-1.5 p-3 rounded-lg transition-all cursor-pointer",
              "border-[1.5px] border-border/20",
              "shadow-[0_2px_4px_0_rgb(0,0,0,0.02),0_1px_6px_0_rgb(0,0,0,0.01)]",
              "bg-gradient-to-r from-card/90 to-background/95 backdrop-blur-sm",
              "hover:from-card hover:to-background hover:border-border/30",
              "hover:shadow-[0_4px_8px_0_rgb(0,0,0,0.04),0_2px_4px_0_rgb(0,0,0,0.02)]",
              currentConversationId === conversation._id ? 
                "bg-accent/90 shadow-[0_4px_12px_0_rgb(0,0,0,0.05)] border-border/40" : 
                "",
              "group"
            )}
            onClick={() => onSelectConversation(conversation)}
          >
            {editingId === conversation._id ? (
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="h-7 text-sm"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={e => handleTitleUpdate(e, conversation._id)}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={cancelEditing}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="text-sm font-medium truncate">
                  {conversation.title}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={e => startEditing(e, conversation)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={e => handleDelete(e, conversation._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{format(new Date(conversation.updatedAt), 'MMM d, yyyy')}</span>
              <span>{conversation.messages.length} messages</span>
            </div>
          </div>
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