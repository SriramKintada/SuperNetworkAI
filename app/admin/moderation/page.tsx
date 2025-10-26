"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

export default function AdminModerationPage() {
  const flaggedContent = [
    {
      id: "1",
      type: "Profile",
      content: "Inappropriate profile bio",
      reporter: "user_123",
      status: "pending",
      date: "2024-02-10",
    },
    {
      id: "2",
      type: "Message",
      content: "Spam message in community chat",
      reporter: "user_456",
      status: "approved",
      date: "2024-02-09",
    },
    {
      id: "3",
      type: "Profile",
      content: "Suspicious account activity",
      reporter: "system",
      status: "rejected",
      date: "2024-02-08",
    },
    {
      id: "4",
      type: "Community Post",
      content: "Offensive language in post",
      reporter: "user_789",
      status: "pending",
      date: "2024-02-07",
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Content Moderation</h1>
            <p className="text-muted-foreground">Review and manage flagged content</p>
          </div>

          {/* Moderation Queue */}
          <div className="space-y-4">
            {flaggedContent.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <h3 className="font-semibold">{item.content}</h3>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Reported by: {item.reporter}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {item.status === "pending" ? (
                      <>
                        <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-2">
                          <XCircle className="w-4 h-4" />
                          Remove
                        </Button>
                      </>
                    ) : (
                      <Badge variant={item.status === "approved" ? "default" : "secondary"}>{item.status}</Badge>
                    )}
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
