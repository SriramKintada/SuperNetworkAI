"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Settings, Trash2 } from "lucide-react"

export default function CommunitySettingsPage() {
  const [communities, setCommunities] = useState([
    {
      id: "1",
      name: "Startups & Founders",
      role: "Member",
      joinedDate: "2 months ago",
      settings: {
        notifications: "all",
        visibility: "public",
        showInProfile: true,
      },
    },
    {
      id: "2",
      name: "Tech & Innovation",
      role: "Moderator",
      joinedDate: "3 months ago",
      settings: {
        notifications: "important",
        visibility: "community-specific",
        showInProfile: true,
      },
    },
    {
      id: "3",
      name: "Business & Strategy",
      role: "Member",
      joinedDate: "1 month ago",
      settings: {
        notifications: "none",
        visibility: "private",
        showInProfile: false,
      },
    },
  ])

  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  const handleLeaveCommunity = (id: string) => {
    setCommunities(communities.filter((c) => c.id !== id))
  }

  const handleUpdateCommunitySettings = (id: string, key: string, value: any) => {
    setCommunities(communities.map((c) => (c.id === id ? { ...c, settings: { ...c.settings, [key]: value } } : c)))
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Community Settings</h1>
            <p className="text-muted-foreground">Manage your community memberships and preferences</p>
          </div>

          {/* Communities List */}
          <div className="space-y-4">
            {communities.map((community) => (
              <Card key={community.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{community.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{community.role}</Badge>
                      <span className="text-sm text-muted-foreground">Joined {community.joinedDate}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedCommunity(selectedCommunity === community.id ? null : community.id)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>

                {/* Expandable Settings */}
                {selectedCommunity === community.id && (
                  <div className="border-t border-border pt-4 space-y-4">
                    {/* Notifications */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Notifications</label>
                      <select
                        value={community.settings.notifications}
                        onChange={(e) => handleUpdateCommunitySettings(community.id, "notifications", e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                      >
                        <option value="all">All notifications</option>
                        <option value="important">Important only</option>
                        <option value="none">None</option>
                      </select>
                    </div>

                    {/* Visibility */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Profile Visibility in Community</label>
                      <select
                        value={community.settings.visibility}
                        onChange={(e) => handleUpdateCommunitySettings(community.id, "visibility", e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                      >
                        <option value="public">Public</option>
                        <option value="community-specific">Community Members Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    {/* Show in Profile */}
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth">
                      <input
                        type="checkbox"
                        checked={community.settings.showInProfile}
                        onChange={(e) => handleUpdateCommunitySettings(community.id, "showInProfile", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-sm">Show in Profile</p>
                        <p className="text-xs text-muted-foreground">Display this community on your profile</p>
                      </div>
                    </label>

                    {/* Leave Community */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-2"
                        onClick={() => handleLeaveCommunity(community.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Leave Community
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex gap-3 mt-8">
            <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" className="bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
