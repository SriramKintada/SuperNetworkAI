"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, MoreVertical } from "lucide-react"
import Link from "next/link"

export default function MessageThreadPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "other",
      text: "Hey! I saw your profile and I think we could collaborate.",
      timestamp: "2:30 PM",
    },
    { id: "2", sender: "user", text: "That sounds great! Let's schedule a call.", timestamp: "2:35 PM" },
    { id: "3", sender: "other", text: "Perfect! How about next Tuesday at 2 PM?", timestamp: "2:40 PM" },
  ])

  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: String(messages.length + 1),
          sender: "user",
          text: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
      setNewMessage("")
    }
  }

  const conversation = {
    name: "Sarah Chen",
    title: "Product Manager at TechCorp",
    avatar: "SC",
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/messages" className="md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">{conversation.name}</h1>
              <p className="text-sm text-muted-foreground">{conversation.title}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : ""}`}>
              {message.sender === "other" && (
                <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-semibold">{conversation.avatar}</span>
                </div>
              )}
              <div
                className={`rounded-lg p-3 max-w-xs md:max-w-md ${
                  message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 md:p-6 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} className="gap-2">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
