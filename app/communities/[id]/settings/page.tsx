"use client"

import { useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Lock, Globe, Copy, Check, Trash2 } from "lucide-react"

export default function CommunitySettingsPage({ params }: { params: { id: string } }) {
  const [communityType, setCommunityType] = useState<"public" | "private">("public")
  const [inviteCode, setInviteCode] = useState("ABC123XYZ")
  const [copied, setCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const regenerateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    setInviteCode(code)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6 md:p-8 max-w-2xl">
          {/* Header */}
          <Link
            href={`/communities/${params.id}`}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Community
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Community Settings</h1>
            <p className="text-muted-foreground">Manage your community preferences and access</p>
          </div>

          {/* Community Type Section */}
          <div className="bg-white border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Community Type</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-primary/5">
                <input
                  type="radio"
                  name="type"
                  value="public"
                  checked={communityType === "public"}
                  onChange={(e) => setCommunityType(e.target.value as "public" | "private")}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Public</p>
                    <p className="text-sm text-muted-foreground">Anyone can discover and join</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/5">
                <input
                  type="radio"
                  name="type"
                  value="private"
                  checked={communityType === "private"}
                  onChange={(e) => setCommunityType(e.target.value as "public" | "private")}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-medium text-foreground">Private (Invite-Only)</p>
                    <p className="text-sm text-muted-foreground">Members need an invite code</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Invite Code Section (for Private Communities) */}
          {communityType === "private" && (
            <div className="bg-white border border-border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Invite Code</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Share this code with people you want to invite to your community.
              </p>
              <div className="flex gap-2 mb-4">
                <Input value={inviteCode} readOnly className="font-mono font-semibold" />
                <Button onClick={copyInviteCode} variant="outline" className="whitespace-nowrap gap-2 bg-transparent">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Button onClick={regenerateInviteCode} variant="outline" className="w-full bg-transparent">
                Regenerate Code
              </Button>
            </div>
          )}

          {/* Join Requests Section */}
          <div className="bg-white border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Join Requests</h2>
            <div className="space-y-3">
              {[
                { name: "Sarah Johnson", email: "sarah@example.com", time: "2 hours ago" },
                { name: "Mike Chen", email: "mike@example.com", time: "1 day ago" },
              ].map((request, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{request.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.email} • {request.time}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Accept
                    </Button>
                    <Button size="sm" variant="outline">
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
            <p className="text-sm text-red-800 mb-4">Deleting your community is permanent and cannot be undone.</p>
            {!showDeleteConfirm ? (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Community
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-red-900">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <Button onClick={() => setShowDeleteConfirm(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700">Delete Community</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
