"use client"

import { useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Lock } from "lucide-react"

export default function JoinCommunityPage() {
  const [inviteCode, setInviteCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleJoinWithCode = () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code")
      return
    }

    // Validate invite code format
    if (inviteCode.length < 6) {
      setError("Invalid invite code format")
      return
    }

    // Simulate joining community
    setSuccess(true)
    setError("")
    setTimeout(() => {
      // Redirect to community page
      window.location.href = "/communities"
    }, 2000)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6 md:p-8 max-w-md mx-auto flex flex-col justify-center min-h-screen">
          {/* Header */}
          <Link href="/communities" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
            <ArrowLeft className="w-5 h-5" />
            Back to Communities
          </Link>

          <div className="mb-8">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Join Private Community</h1>
            <p className="text-muted-foreground">Enter the invite code to join a private community</p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-900 font-medium">Successfully joined the community!</p>
              <p className="text-sm text-green-800 mt-2">Redirecting...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Invite Code</label>
                <Input
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase())
                    setError("")
                  }}
                  className="font-mono font-semibold text-center text-lg tracking-widest"
                />
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              </div>

              <Button onClick={handleJoinWithCode} className="w-full bg-accent hover:bg-accent/90">
                Join Community
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Don't have an invite code?{" "}
                <Link href="/communities" className="text-primary hover:underline">
                  Browse public communities
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
