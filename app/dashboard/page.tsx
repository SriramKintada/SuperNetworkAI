"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats] = useState({
    matches: 12,
    connections: 8,
    messages: 3,
    communities: 5,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      // Check if profile is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

      if (!profile || !profile.onboarding_completed) {
        router.push('/onboarding')
        return
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-spin">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const recentMatches = [
    {
      id: "1",
      name: "Sarah Chen",
      title: "Product Manager",
      company: "TechCorp",
      matchScore: 92,
      goals: ["Finding a Cofounder", "Seeking Investment"],
    },
    {
      id: "2",
      name: "Alex Rodriguez",
      title: "Full Stack Developer",
      company: "StartupXYZ",
      matchScore: 88,
      goals: ["Hiring Talent", "Strategic Partnerships"],
    },
    {
      id: "3",
      name: "Jordan Kim",
      title: "Designer & Founder",
      company: "DesignStudio",
      matchScore: 85,
      goals: ["Finding a Cofounder", "Learning & Mentorship"],
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-muted-foreground">Here's what's happening in your network</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "New Matches", value: stats.matches, icon: Zap },
              { label: "Connections", value: stats.connections, icon: Users },
              { label: "Unread Messages", value: stats.messages, icon: TrendingUp },
              { label: "Communities", value: stats.communities, icon: Users },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Recent Matches */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Matches</h2>
              <Button variant="ghost" asChild>
                <Link href="/search" className="gap-2">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {recentMatches.map((match) => (
                <Card key={match.id} className="p-6 hover:shadow-md transition-smooth">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{match.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {match.title} at {match.company}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {match.goals.map((goal) => (
                          <Badge key={goal} variant="secondary" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-primary mb-2">{match.matchScore}%</div>
                      <Button size="sm">Connect</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 bg-primary text-primary-foreground">
              <h3 className="text-lg font-semibold mb-2">Explore Communities</h3>
              <p className="mb-4 opacity-90">Join new communities to expand your network</p>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/communities">Browse Communities</Link>
              </Button>
            </Card>

            <Card className="p-6 bg-secondary text-secondary-foreground">
              <h3 className="text-lg font-semibold mb-2">Update Your Profile</h3>
              <p className="mb-4 opacity-90">Keep your profile fresh to get better matches</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings/profile">Edit Profile</Link>
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
