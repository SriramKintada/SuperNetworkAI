"use client"

import { useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, MapPin, Share2, Settings } from "lucide-react"

// Mock data - replace with API call
const COMMUNITY_DETAILS: Record<string, any> = {
  "100x-engineers": {
    id: "100x-engineers",
    name: "100x Engineers",
    description: "A community of elite engineers building the future of technology",
    fullDescription:
      "100x Engineers is an exclusive community of top-tier software engineers, architects, and technical leaders. We focus on connecting exceptional talent with opportunities to build transformative products. Our members are passionate about solving hard problems and pushing the boundaries of what's possible in technology.",
    memberCount: 1200,
    activeMembers: 340,
    location: "Global",
    founded: "2023",
    topIntents: ["Cofounder", "Advisor", "Teammate"],
    skills: ["Python", "Go", "Rust", "TypeScript", "System Design", "ML/AI", "DevOps"],
    image: "/engineers-community.jpg",
    stats: [
      { label: "Total Members", value: "1,200" },
      { label: "Active (7d)", value: "340" },
      { label: "Connections Made", value: "89" },
      { label: "Founded", value: "2023" },
    ],
    recentActivity: [
      { user: "Alex Chen", action: "joined the community", time: "2 hours ago" },
      { user: "Priya Sharma", action: "made a connection", time: "5 hours ago" },
      { user: "James Wilson", action: "updated their profile", time: "1 day ago" },
    ],
  },
  "iiser-pune": {
    id: "iiser-pune",
    name: "IISER Pune",
    description: "Alumni and current members of Indian Institute of Science Education and Research",
    fullDescription:
      "IISER Pune is a vibrant community of alumni and current members of the Indian Institute of Science Education and Research. We connect brilliant minds in science, technology, and entrepreneurship to collaborate on innovative projects and ventures.",
    memberCount: 450,
    activeMembers: 120,
    location: "Pune, India",
    founded: "2022",
    topIntents: ["Cofounder", "Client", "Advisor"],
    skills: ["Physics", "Chemistry", "Biology", "Data Science", "Entrepreneurship"],
    image: "/iiser-community.jpg",
    stats: [
      { label: "Total Members", value: "450" },
      { label: "Active (7d)", value: "120" },
      { label: "Connections Made", value: "34" },
      { label: "Founded", value: "2022" },
    ],
    recentActivity: [
      { user: "Rajesh Kumar", action: "joined the community", time: "3 hours ago" },
      { user: "Neha Patel", action: "posted about research", time: "1 day ago" },
    ],
  },
}

export default function CommunityDetailPage({ params }: { params: { id: string } }) {
  const community = COMMUNITY_DETAILS[params.id]
  const [isJoined, setIsJoined] = useState(false)

  if (!community) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Community not found</h1>
            <Button asChild>
              <Link href="/communities">Back to Communities</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        {/* Hero Section */}
        <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
          <img
            src={community.image || "/placeholder.svg"}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />

          {/* Back Button */}
          <Link
            href="/communities"
            className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>

          {/* Header Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h1 className="text-4xl font-bold text-white mb-2">{community.name}</h1>
            <p className="text-white/90">{community.description}</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            {!isJoined ? (
              <Button onClick={() => setIsJoined(true)} className="bg-accent hover:bg-accent/90 text-white">
                Join Community
              </Button>
            ) : (
              <Button disabled className="bg-primary/20 text-primary">
                Joined
              </Button>
            )}
            <Button variant="outline" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">{community.fullDescription}</p>
              </section>

              {/* Top Skills */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Top Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {community.skills.map((skill: string) => (
                    <span key={skill} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Top Intents */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">What Members Are Looking For</h2>
                <div className="grid grid-cols-3 gap-4">
                  {community.topIntents.map((intent: string) => (
                    <div key={intent} className="p-4 bg-white border border-border rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Looking for</p>
                      <p className="font-semibold text-foreground">{intent}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Activity */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {community.recentActivity.map((activity: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold text-foreground">{activity.user}</span>
                          <span className="text-muted-foreground"> {activity.action}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="bg-white border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Community Stats</h3>
                {community.stats.map((stat: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <span className="font-semibold text-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Location */}
              <div className="bg-white border border-border rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground">{community.location}</p>
                  </div>
                </div>
              </div>

              {/* Browse Members */}
              {isJoined && (
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href={`/communities/${community.id}/members`}>Browse Members</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
