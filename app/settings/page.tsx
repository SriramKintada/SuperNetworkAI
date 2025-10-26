"use client"

import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { ChevronRight, Lock, Users, Bell } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const settingsGroups = [
    {
      title: "Account",
      items: [
        {
          icon: Lock,
          label: "Privacy Settings",
          description: "Control who can see your profile and contact you",
          href: "/settings/privacy",
        },
        {
          icon: Users,
          label: "Community Settings",
          description: "Manage your community memberships and preferences",
          href: "/settings/communities",
        },
      ],
    },
    {
      title: "Profile",
      items: [
        {
          icon: Users,
          label: "Edit Profile",
          description: "Update your professional information",
          href: "/settings/profile",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          description: "Manage notification settings",
          href: "/settings/notifications",
        },
      ],
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          {/* Settings Groups */}
          <div className="space-y-8">
            {settingsGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-lg font-semibold mb-4 text-muted-foreground">{group.title}</h2>
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.href} href={item.href}>
                        <Card className="p-4 hover:shadow-md transition-smooth cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{item.label}</h3>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
