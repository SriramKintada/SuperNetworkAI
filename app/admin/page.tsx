"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, TrendingUp, AlertCircle } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: "2,543", icon: Users, trend: "+12%" },
    { label: "Active Communities", value: "48", icon: BarChart3, trend: "+5" },
    { label: "Connections Made", value: "8,234", icon: TrendingUp, trend: "+23%" },
    { label: "Flagged Content", value: "12", icon: AlertCircle, trend: "-3" },
  ]

  const recentActivity = [
    { id: 1, type: "user_signup", message: "New user registered: john.doe@example.com", time: "2 minutes ago" },
    {
      id: 2,
      type: "community_created",
      message: "New community created: AI & Machine Learning",
      time: "15 minutes ago",
    },
    { id: 3, type: "content_flagged", message: "Content flagged for review in Startups community", time: "1 hour ago" },
    { id: 4, type: "user_verified", message: "User verified: sarah.chen@techcorp.com", time: "2 hours ago" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-2">{stat.value}</p>
                  <p className="text-xs text-primary font-medium">{stat.trend}</p>
                </Card>
              )
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm">{activity.message}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* System Health */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">System Health</h2>
              <div className="space-y-4">
                {[
                  { name: "API Response Time", status: "healthy", value: "145ms" },
                  { name: "Database", status: "healthy", value: "99.9% uptime" },
                  { name: "Email Service", status: "healthy", value: "All systems" },
                  { name: "Search Index", status: "warning", value: "Reindexing..." },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.value}</p>
                    </div>
                    <Badge variant={item.status === "healthy" ? "default" : "secondary"} className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
