"use client";
import { useState } from "react";
import Copilot from "@/components/Copilot";
import ConversationSidebar from "@/components/ConversationSidebar";

export default function CopilotPage() {
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
  };

  const handleSidebarToggle = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className={`${isSidebarExpanded ? 'w-80' : 'w-16'} transition-all duration-300 border-r bg-muted/10`}>
        <ConversationSidebar
          onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversation?._id}
          onToggle={handleSidebarToggle}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="container py-8">
          <Copilot
            conversation={currentConversation}
            onConversationUpdate={() => {
              // Refresh the sidebar when a new conversation is created
              const sidebarComponent = document.querySelector('conversation-sidebar');
              if (sidebarComponent) {
                sidebarComponent.fetchConversations();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}