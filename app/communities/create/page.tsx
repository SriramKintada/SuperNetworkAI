"use client"

import { useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Lock, Globe, Copy, Check } from "lucide-react"

export default function CreateCommunityPage() {
  const [communityType, setCommunityType] = useState<"public" | "private" | null>(null)
  const [communityName, setCommunityName] = useState("")
  const [description, setDescription] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [copied, setCopied] = useState(false)

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    setInviteCode(code)
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreateCommunity = () => {
    if (!communityName || !description || !communityType) {
      alert("Please fill in all fields")
      return
    }
    if (communityType === "private" && !inviteCode) {
      alert("Please generate an invite code for private community")
      return
    }
    // Handle community creation
    alert(`Community "${communityName}" created successfully!`)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6 md:p-8 max-w-2xl">
          {/* Header */}
          <Link href="/communities" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Communities
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create a Community</h1>
            <p className="text-muted-foreground">Build a space for your network to connect and collaborate</p>
          </div>

          {/* Community Type Selection */}
          {!communityType ? (
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold text-foreground">Choose Community Type</h2>

              {/* Public Community */}
              <button
                onClick={() => setCommunityType("public")}
                className="w-full p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Public Community</h3>
                    <p className="text-sm text-muted-foreground">
                      Open to everyone. Anyone can discover and join your community.
                    </p>
                  </div>
                </div>
              </button>

              {/* Private Community */}
              <button
                onClick={() => setCommunityType("private")}
                className="w-full p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Private Community</h3>
                    <p className="text-sm text-muted-foreground">Invite-only. Members need an invite code to join.</p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <>
              {/* Community Details Form */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Community Name</label>
                  <Input
                    placeholder="e.g., AI Researchers, Startup Founders"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    placeholder="Describe your community's purpose and values..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                  />
                </div>

                {/* Community Type Badge */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    {communityType === "public" ? (
                      <>
                        <Globe className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">Public Community</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-accent" />
                        <span className="font-medium text-foreground">Private Community (Invite-Only)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Invite Code for Private Communities */}
                {communityType === "private" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Invite Code</label>
                    <div className="flex gap-2">
                      <Input value={inviteCode} readOnly placeholder="Generate an invite code" />
                      <Button
                        onClick={generateInviteCode}
                        variant="outline"
                        className="whitespace-nowrap bg-transparent"
                      >
                        Generate Code
                      </Button>
                    </div>
                    {inviteCode && (
                      <div className="mt-3 p-3 bg-accent/5 border border-accent/20 rounded-lg flex items-center justify-between">
                        <code className="font-mono font-semibold text-foreground">{inviteCode}</code>
                        <Button onClick={copyInviteCode} size="sm" variant="ghost" className="gap-2">
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
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setCommunityType(null)
                    setCommunityName("")
                    setDescription("")
                    setInviteCode("")
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleCreateCommunity} className="flex-1 bg-primary hover:bg-primary/90">
                  Create Community
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
