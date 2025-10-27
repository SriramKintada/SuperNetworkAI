"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Save, Lock, Globe, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function PrivacySettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "community_only", // public, private, community_only
    showEmail: false,
    showPhone: false,
    allowMessages: "everyone", // everyone, connections-only, disabled
    showActivity: "connections",
    allowProfileSearch: true,
  })

  const [communityPrivacy, setCommunityPrivacy] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load profile settings
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('visibility, show_in_search')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError

      if (profile) {
        setPrivacySettings(prev => ({
          ...prev,
          profileVisibility: profile.visibility || 'community_only',
          allowProfileSearch: profile.show_in_search !== false,
        }))
      }

      // Load user's communities
      const { data: communities, error: communitiesError } = await supabase
        .from('community_members')
        .select(`
          community_id,
          communities (
            id,
            name
          )
        `)
        .eq('user_id', user.id)

      if (!communitiesError && communities) {
        const communityList = communities.map(cm => ({
          id: cm.community_id,
          name: cm.communities?.name || 'Unknown Community',
          visibility: profile?.visibility || 'community_only'
        }))
        setCommunityPrivacy(communityList)
      }

      setIsLoading(false)
    } catch (error: any) {
      console.error('Error loading settings:', error)
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update profile settings
      const { error } = await supabase
        .from('profiles')
        .update({
          visibility: privacySettings.profileVisibility,
          show_in_search: privacySettings.allowProfileSearch,
        })
        .eq('user_id', user.id)

      if (error) throw error

      setSaveMessage({ type: 'success', text: 'Privacy settings saved successfully!' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error: any) {
      console.error('Error saving settings:', error)
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save settings' })
    } finally {
      setIsSaving(false)
    }
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

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 overflow-auto flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-spin">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
            </div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </main>
      </div>
    )
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

          {/* Success/Error Message */}
          {saveMessage && (
            <div className={`mb-6 p-4 rounded-lg border ${
              saveMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {saveMessage.text}
            </div>
          )}

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
                    value="community_only"
                    checked={privacySettings.profileVisibility === "community_only"}
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
