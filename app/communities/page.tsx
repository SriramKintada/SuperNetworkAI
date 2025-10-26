"use client"

import { useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { CommunityCard } from "@/components/community-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"

// Mock data - replace with API call
const COMMUNITIES = [
  {
    id: "100x-engineers",
    name: "100x Engineers",
    description: "A community of elite engineers building the future of technology",
    memberCount: 1200,
    location: "Global",
    topIntents: ["Cofounder", "Advisor", "Teammate"],
    image: "/engineers-community.jpg",
    type: "public" as const,
  },
  {
    id: "iiser-pune",
    name: "IISER Pune",
    description: "Alumni and current members of Indian Institute of Science Education and Research",
    memberCount: 450,
    location: "Pune, India",
    topIntents: ["Cofounder", "Client", "Advisor"],
    image: "/iiser-community.jpg",
    type: "private" as const,
  },
  {
    id: "ai-research",
    name: "AI Research Club",
    description: "Researchers and practitioners focused on cutting-edge AI and machine learning",
    memberCount: 230,
    location: "Global",
    topIntents: ["Cofounder", "Collaborator", "Mentor"],
    image: "/ai-research-community.jpg",
    type: "public" as const,
  },
  {
    id: "yc-batch-s24",
    name: "YC Batch S24",
    description: "Y Combinator Summer 2024 batch founders and team members",
    memberCount: 890,
    location: "Global",
    topIntents: ["Cofounder", "Investor", "Advisor"],
    image: "/yc-community.jpg",
    type: "private" as const,
  },
  {
    id: "fintech-india",
    name: "Fintech India",
    description: "Building the future of financial technology in India",
    memberCount: 560,
    location: "India",
    topIntents: ["Cofounder", "Client", "Teammate"],
    image: "/fintech-community.jpg",
    type: "public" as const,
  },
  {
    id: "design-collective",
    name: "Design Collective",
    description: "Product designers, UX researchers, and design leaders",
    memberCount: 340,
    location: "Global",
    topIntents: ["Cofounder", "Collaborator", "Mentor"],
    image: "/design-community.jpg",
    type: "public" as const,
  },
]

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIntents, setSelectedIntents] = useState<string[]>([])
  const [communityTypeFilter, setCommunityTypeFilter] = useState<"all" | "public" | "private">("all")
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(["100x-engineers"])

  const filteredCommunities = COMMUNITIES.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesIntents =
      selectedIntents.length === 0 || selectedIntents.some((intent) => community.topIntents.includes(intent))

    const matchesType = communityTypeFilter === "all" || community.type === communityTypeFilter

    return matchesSearch && matchesIntents && matchesType
  })

  const handleJoinCommunity = (communityId: string) => {
    setJoinedCommunities((prev) => [...prev, communityId])
  }

  const allIntents = Array.from(new Set(COMMUNITIES.flatMap((c) => c.topIntents)))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Browse Communities</h1>
              <p className="text-muted-foreground">Join communities to connect with like-minded professionals</p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link href="/communities/create">
                <Plus className="w-5 h-5" />
                Create Community
              </Link>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Community Type Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground self-center">Type:</span>
              {(["all", "public", "private"] as const).map((type) => (
                <Button
                  key={type}
                  variant={communityTypeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCommunityTypeFilter(type)}
                  className="capitalize"
                >
                  {type === "all" ? "All" : type}
                </Button>
              ))}
            </div>

            {/* Intent Filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground self-center">Filter by intent:</span>
              {allIntents.map((intent) => (
                <Button
                  key={intent}
                  variant={selectedIntents.includes(intent) ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSelectedIntents((prev) =>
                      prev.includes(intent) ? prev.filter((i) => i !== intent) : [...prev, intent],
                    )
                  }
                >
                  {intent}
                </Button>
              ))}
              {selectedIntents.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIntents([])}
                  className="text-muted-foreground"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-sm text-muted-foreground">
            {filteredCommunities.length} communit{filteredCommunities.length === 1 ? "y" : "ies"} found
          </div>

          {/* Communities Grid */}
          {filteredCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  {...community}
                  isJoined={joinedCommunities.includes(community.id)}
                  onJoin={() => handleJoinCommunity(community.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No communities found matching your criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedIntents([])
                  setCommunityTypeFilter("all")
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Join with Invite Code CTA */}
          <div className="mt-12 p-6 bg-accent/5 border border-accent/20 rounded-lg text-center">
            <p className="text-foreground font-medium mb-2">Have an invite code?</p>
            <p className="text-sm text-muted-foreground mb-4">Join a private community with an invite code</p>
            <Button asChild variant="outline">
              <Link href="/communities/join">Join with Invite Code</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
