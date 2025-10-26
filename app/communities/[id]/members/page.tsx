"use client"

import { useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, MessageSquare, UserCheck, Clock } from "lucide-react"

export default function CommunityMembersPage({ params }: { params: { id: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "pending">("all")

  const members = [
    {
      id: "1",
      name: "Alex Chen",
      role: "Admin",
      joinedDate: "2023-01-15",
      status: "active",
      avatar: "AC",
    },
    {
      id: "2",
      name: "Priya Sharma",
      role: "Member",
      joinedDate: "2023-06-20",
      status: "active",
      avatar: "PS",
    },
    {
      id: "3",
      name: "James Wilson",
      role: "Member",
      joinedDate: "2024-01-10",
      status: "pending",
      avatar: "JW",
    },
    {
      id: "4",
      name: "Emma Davis",
      role: "Moderator",
      joinedDate: "2023-03-05",
      status: "active",
      avatar: "ED",
    },
  ]

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || member.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <Link
            href={`/communities/${params.id}`}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Community
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Community Members</h1>
            <p className="text-muted-foreground">Browse and manage community members</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {(["all", "active", "pending"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status === "all" ? "All Members" : status === "active" ? "Active" : "Pending"}
                </Button>
              ))}
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-primary text-sm">{member.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{member.name}</p>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                        {member.role}
                      </span>
                      {member.status === "pending" && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      {member.status === "active" && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(member.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                  {member.status === "pending" && (
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No members found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
