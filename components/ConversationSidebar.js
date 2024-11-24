"use client";
import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Loader2, Trash2, Edit2, Check, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Input } from "@/components/ui/input";
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

export default function ConversationSidebar({ onSelectConversation, currentConversationId, onToggle }) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

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
              duration: 3000,
              style: {
                background: '#f3f4f6',
                color: '#374151',
              },
            });
          }
        } catch (error) {
          console.error('Error fetching conversations:', error);
          toast.error('Failed to load conversations', {
            duration: 4000,
            style: {
              background: '#f3f4f6',
              color: '#374151',
            },
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
    e.preventDefault();
    
    const deleteToast = toast.loading('Deleting conversation...', {
      style: {
        background: '#f3f4f6',
        color: '#374151',
      },
    });
    
    try {
      const response = await fetch(
        `/api/conversations?id=${conversationId}&userId=${session.user.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete conversation');
      }
      
      // Update local state
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      
      if (currentConversationId === conversationId) {
        onSelectConversation(null);
      }
      
      toast.success('Conversation deleted successfully', {
        id: deleteToast,
        duration: 3000,
        style: {
          background: '#f3f4f6',
          color: '#374151',
        },
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error(`Failed to delete conversation: ${error.message}`, {
        id: deleteToast,
        duration: 4000,
        style: {
          background: '#f3f4f6',
          color: '#374151',
        },
      });
    }
  };

  const startEditing = (e, conversation) => {
    e.stopPropagation();
    setEditingId(conversation._id);
    setEditTitle(conversation.title);
    toast('Editing conversation title...', {
      icon: '✏️',
      duration: 2000,
      style: {
        background: '#f3f4f6',
        color: '#374151',
      },
    });
  };

  const handleTitleUpdate = async (e, conversationId) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      toast.error('Title cannot be empty', {
        duration: 3000,
        style: {
          background: '#f3f4f6',
          color: '#374151',
        },
      });
      return;
    }

    const updateToast = toast.loading('Updating title...', {
      style: {
        background: '#f3f4f6',
        color: '#374151',
      },
    });
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: session.user.id,
          title: editTitle
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update title');
      }

      setConversations(prev =>
        prev.map(conv =>
          conv._id === conversationId
            ? { ...conv, title: editTitle }
            : conv
        )
      );
      setEditingId(null);
      setEditTitle('');

      toast.success('Title updated successfully', {
        id: updateToast,
        duration: 3000,
        style: {
          background: '#f3f4f6',
          color: '#374151',
        },
      });
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error(`Failed to update title: ${error.message}`, {
        id: updateToast,
        duration: 4000,
        style: {
          background: '#f3f4f6',
          color: '#374151',
        },
      });
    }
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
    toast('Edit cancelled', {
      icon: '❌',
      duration: 2000,
      style: {
        background: '#f3f4f6',
        color: '#374151',
      },
    });
  };

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);  // Emit the new state to the parent
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
    <div className={cn(
      "relative h-[calc(100vh-4rem)] border-r transition-all duration-300",
      isExpanded ? "w-80 lg:w-96" : "w-16"
    )}>
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-2 h-6 w-6 rounded-full border shadow-md p-0 hover:bg-background z-20"
        onClick={toggleSidebar}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      <ScrollArea className="h-full">
        <div className={cn(
          "flex flex-col gap-2 p-4",
          !isExpanded && "items-center"
        )}>
          {conversations.map((conversation) => (
            <div
              key={conversation._id}
              className={cn(
                "relative flex flex-col gap-1.5 rounded-lg transition-all cursor-pointer",
                "border-[1.5px] border-border/20",
                "shadow-[0_2px_4px_0_rgb(0,0,0,0.02),0_1px_6px_0_rgb(0,0,0,0.01)]",
                "bg-gradient-to-r from-card/90 to-background/95 backdrop-blur-sm",
                "hover:from-card hover:to-background hover:border-border/30",
                "hover:shadow-[0_4px_8px_0_rgb(0,0,0,0.04),0_2px_4px_0_rgb(0,0,0,0.02)]",
                currentConversationId === conversation._id ? 
                  "bg-accent/90 shadow-[0_4px_12px_0_rgb(0,0,0,0.05)] border-border/40" : 
                  "",
                "group",
                isExpanded ? "p-3" : "p-2 w-12 h-12 justify-center items-center"
              )}
              onClick={() => onSelectConversation(conversation)}
              title={!isExpanded ? conversation.title : undefined}
            >
              {isExpanded ? (
                <>
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
                </>
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {conversation.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          ))}

          {conversations.length === 0 && (
            <div className={cn(
              "text-sm text-muted-foreground text-center",
              isExpanded ? "py-4" : "w-12 py-2"
            )}>
              {isExpanded ? "No conversations yet" : "Empty"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}