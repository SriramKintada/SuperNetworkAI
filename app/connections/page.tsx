"use client"

import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, MoreVertical } from "lucide-react"
import Link from "next/link"

export default function ConnectionsPage() {
  const connections = [
    {
      id: "1",
      name: "Sarah Chen",
      title: "Product Manager",
      company: "TechCorp",
      status: "connected",
      connectedDate: "2 days ago",
      goals: ["Finding a Cofounder"],
    },
    {
      id: "2",
      name: "Alex Rodriguez",
      title: "Full Stack Developer",
      company: "StartupXYZ",
      status: "connected",
      connectedDate: "1 week ago",
      goals: ["Hiring Talent"],
    },
    {
      id: "3",
      name: "Jordan Kim",
      title: "Designer & Founder",
      company: "DesignStudio",
      status: "pending",
      connectedDate: "Pending",
      goals: ["Finding a Cofounder"],
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Connections</h1>
            <p className="text-muted-foreground">Manage and connect with your network</p>
          </div>

          {/* Connections List */}
          <div className="space-y-4">
            {connections.map((connection) => (
              <Card key={connection.id} className="p-6 hover:shadow-md transition-smooth">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{connection.name}</h3>
                      <Badge variant={connection.status === "connected" ? "default" : "secondary"}>
                        {connection.status === "connected" ? "Connected" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {connection.title} at {connection.company}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {connection.goals.map((goal) => (
                        <Badge key={goal} variant="outline" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Connected {connection.connectedDate}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent" asChild>
                      <Link href={`/messages/${connection.id}`}>
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
