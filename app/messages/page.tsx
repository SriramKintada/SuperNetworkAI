"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Search, Send } from "lucide-react"

export default function MessagesPage() {
  const [conversations, setConversations] = useState([
    {
      id: "1",
      name: "Sarah Chen",
      title: "Product Manager",
      lastMessage: "That sounds great! Let's schedule a call.",
      timestamp: "2 hours ago",
      unread: true,
      avatar: "SC",
    },
    {
      id: "2",
      name: "Alex Rodriguez",
      title: "Full Stack Developer",
      lastMessage: "I'm interested in your project idea",
      timestamp: "1 day ago",
      unread: false,
      avatar: "AR",
    },
    {
      id: "3",
      name: "Jordan Kim",
      title: "Designer & Founder",
      lastMessage: "Would love to connect and discuss",
      timestamp: "3 days ago",
      unread: false,
      avatar: "JK",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-full md:w-96 border-r border-border flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-border">
              <h1 className="text-2xl font-bold mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-4 border-b border-border text-left hover:bg-muted/50 transition-smooth ${
                      selectedConversation === conversation.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">{conversation.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className={`font-semibold truncate ${conversation.unread ? "text-foreground" : ""}`}>
                            {conversation.name}
                          </h3>
                          {conversation.unread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.title}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">{conversation.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-1">{conversation.timestamp}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="hidden md:flex flex-1 flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-border">
                  {conversations.find((c) => c.id === selectedConversation) && (
                    <div>
                      <h2 className="text-xl font-bold">
                        {conversations.find((c) => c.id === selectedConversation)?.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {conversations.find((c) => c.id === selectedConversation)?.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-auto p-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                    <div className="bg-muted rounded-lg p-3 max-w-xs">
                      <p className="text-sm">Hey! I saw your profile and I think we could collaborate.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-primary-foreground">That sounds great! Let's schedule a call.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0" />
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                    <div className="bg-muted rounded-lg p-3 max-w-xs">
                      <p className="text-sm">Perfect! How about next Tuesday at 2 PM?</p>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-border">
                  <div className="flex gap-2">
                    <Input placeholder="Type your message..." className="flex-1" />
                    <Button size="sm" className="gap-2">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
