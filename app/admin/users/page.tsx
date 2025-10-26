"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, MoreVertical } from "lucide-react"

export default function AdminUsersPage() {
  const users = [
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah@techcorp.com",
      status: "active",
      joinDate: "2024-01-15",
      communities: 3,
    },
    {
      id: "2",
      name: "Alex Rodriguez",
      email: "alex@startupxyz.com",
      status: "active",
      joinDate: "2024-01-20",
      communities: 2,
    },
    {
      id: "3",
      name: "Jordan Kim",
      email: "jordan@designstudio.com",
      status: "suspended",
      joinDate: "2024-02-01",
      communities: 1,
    },
    {
      id: "4",
      name: "Emma Thompson",
      email: "emma@growthco.com",
      status: "active",
      joinDate: "2024-02-05",
      communities: 4,
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage platform users and permissions</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search users by name or email..." className="pl-10" />
            </div>
          </div>

          {/* Users Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Communities</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
                      <td className="px-6 py-4 font-medium">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.communities}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.joinDate}</td>
                      <td className="px-6 py-4">
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
