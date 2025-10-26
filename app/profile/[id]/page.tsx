"use client"

import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, MessageSquare, Share2, Lock, Globe, Eye } from "lucide-react"
import Link from "next/link"

export default function ProfilePage({ params }: { params: { id: string } }) {
  const profile = {
    id: params.id,
    name: "Sarah Chen",
    title: "Product Manager",
    company: "TechCorp",
    location: "San Francisco, CA",
    bio: "Passionate about building innovative products that solve real problems. 5+ years of experience in product management at fast-growing startups. Currently looking for a technical co-founder to launch my next venture.",
    goals: ["Finding a Cofounder", "Seeking Investment", "Learning & Mentorship"],
    communities: ["Startups & Founders", "Tech & Innovation", "Business & Strategy"],
    skills: ["Product Strategy", "User Research", "Go-to-Market", "Team Building"],
    experience: [
      { company: "TechCorp", title: "Senior Product Manager", years: "2021 - Present" },
      { company: "StartupXYZ", title: "Product Manager", years: "2019 - 2021" },
      { company: "BigTech", title: "Associate Product Manager", years: "2018 - 2019" },
    ],
    matchScore: 92,
    connectionStatus: "not_connected",
    privacyStatus: "public",
  }

  const getPrivacyIcon = (status: string) => {
    switch (status) {
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

  const getPrivacyLabel = (status: string) => {
    switch (status) {
      case "public":
        return "Public Profile"
      case "private":
        return "Private Profile"
      case "community-specific":
        return "Community Only"
      default:
        return status
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Back Button */}
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{profile.name}</h1>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getPrivacyIcon(profile.privacyStatus)}
                    {getPrivacyLabel(profile.privacyStatus)}
                  </Badge>
                </div>
                <p className="text-xl text-muted-foreground mb-2">
                  {profile.title} at {profile.company}
                </p>
                <p className="text-muted-foreground">{profile.location}</p>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-4xl font-bold text-primary mb-2">{profile.matchScore}%</div>
                <p className="text-sm text-muted-foreground mb-4">Match Score</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent" asChild>
                    <Link href={`/messages/${profile.id}`}>
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Link>
                  </Button>
                  <Button size="sm" className="gap-2">
                    <Heart className="w-4 h-4" />
                    Connect
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* About */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              </Card>

              {/* Experience */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Experience</h2>
                <div className="space-y-4">
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} className="pb-4 border-b border-border last:border-0 last:pb-0">
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">{exp.years}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Skills */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Goals */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Looking For</h3>
                <div className="space-y-2">
                  {profile.goals.map((goal) => (
                    <div key={goal} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">{goal}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Communities */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Communities</h3>
                <div className="space-y-2">
                  {profile.communities.map((community) => (
                    <div key={community} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      <span className="text-sm">{community}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <Card className="p-6">
                <div className="space-y-2">
                  <Button className="w-full gap-2">
                    <Heart className="w-4 h-4" />
                    Connect
                  </Button>
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <Share2 className="w-4 h-4" />
                    Share Profile
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
