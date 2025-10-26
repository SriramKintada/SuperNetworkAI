"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Save, Lock, Globe, Eye } from "lucide-react"

export default function PrivacySettingsPage() {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public", // public, private, community-specific
    showEmail: false,
    showPhone: false,
    allowMessages: "everyone", // everyone, connections-only, disabled
    showActivity: "connections",
    allowProfileSearch: true,
  })

  const [communityPrivacy, setCommunityPrivacy] = useState([
    { id: "1", name: "Startups & Founders", visibility: "public" },
    { id: "2", name: "Tech & Innovation", visibility: "community-specific" },
    { id: "3", name: "Business & Strategy", visibility: "private" },
  ])

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Globe className="w-4 h-4" />
      case "private":
        return <Lock className="w-4 h-4" />
      case "community-specific":
        return <Eye className="w-4 h-4" />
      default:
        return null
    }
  }

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "Public"
      case "private":
        return "Private"
      case "community-specific":
        return "Community Only"
      default:
        return visibility
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8 max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Privacy Settings</h1>
            <p className="text-muted-foreground">Control who can see your profile and contact you</p>
          </div>

          {/* Profile Visibility */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Profile Visibility
            </h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="public"
                    checked={privacySettings.profileVisibility === "public"}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Public</p>
                    <p className="text-sm text-muted-foreground">Anyone can view your profile</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="community-specific"
                    checked={privacySettings.profileVisibility === "community-specific"}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Community-Specific</p>
                    <p className="text-sm text-muted-foreground">Only visible to members of your communities</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="private"
                    checked={privacySettings.profileVisibility === "private"}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Private</p>
                    <p className="text-sm text-muted-foreground">Only visible to your connections</p>
                  </div>
                </label>
              </div>
            </div>
          </Card>

          {/* Messaging Preferences */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Messaging Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">Who can message you?</label>
                <div className="space-y-2">
                  {[
                    { value: "everyone", label: "Everyone" },
                    { value: "connections-only", label: "Connections Only" },
                    { value: "disabled", label: "Disabled" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 p-2 cursor-pointer">
                      <input
                        type="radio"
                        name="allowMessages"
                        value={option.value}
                        checked={privacySettings.allowMessages === option.value}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, allowMessages: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Community-Specific Privacy */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Community-Specific Privacy</h2>
            <p className="text-sm text-muted-foreground mb-4">Set different visibility levels for each community</p>
            <div className="space-y-3">
              {communityPrivacy.map((community) => (
                <div
                  key={community.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <span className="font-medium">{community.name}</span>
                  <select
                    value={community.visibility}
                    onChange={(e) => {
                      setCommunityPrivacy(
                        communityPrivacy.map((c) => (c.id === community.id ? { ...c, visibility: e.target.value } : c)),
                      )
                    }}
                    className="px-3 py-1 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="community-specific">Community Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              ))}
            </div>
          </Card>

          {/* Other Settings */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Other Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth">
                <input
                  type="checkbox"
                  checked={privacySettings.showEmail}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium">Show Email Address</p>
                  <p className="text-sm text-muted-foreground">Display your email on your profile</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth">
                <input
                  type="checkbox"
                  checked={privacySettings.allowProfileSearch}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, allowProfileSearch: e.target.checked })}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium">Allow Profile Search</p>
                  <p className="text-sm text-muted-foreground">Allow others to find you in search results</p>
                </div>
              </label>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Privacy Settings"}
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
