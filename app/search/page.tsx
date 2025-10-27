"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MatchCard } from "@/components/match-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SearchIcon, Filter } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const { data, error } = await supabase.functions.invoke('search-profiles', {
        body: {
          query: searchQuery,
          limit: 20
        }
      })

      if (error) throw error

      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const mockMatches = [
    {
      id: "1",
      name: "Sarah Chen",
      title: "Product Manager",
      company: "TechCorp",
      bio: "Building innovative products with a focus on user experience. Looking for technical co-founder.",
      goals: ["Finding a Cofounder", "Seeking Investment"],
      matchScore: 92,
    },
    {
      id: "2",
      name: "Alex Rodriguez",
      title: "Full Stack Developer",
      company: "StartupXYZ",
      bio: "Passionate about building scalable systems. Interested in joining early-stage startups.",
      goals: ["Hiring Talent", "Strategic Partnerships"],
      matchScore: 88,
    },
    {
      id: "3",
      name: "Jordan Kim",
      title: "Designer & Founder",
      company: "DesignStudio",
      bio: "Design-focused founder looking to collaborate with developers and marketers.",
      goals: ["Finding a Cofounder", "Learning & Mentorship"],
      matchScore: 85,
    },
    {
      id: "4",
      name: "Emma Thompson",
      title: "Marketing Director",
      company: "GrowthCo",
      bio: "Growth marketing expert seeking partnerships with innovative startups.",
      goals: ["Strategic Partnerships", "Seeking Investment"],
      matchScore: 82,
    },
  ]

  const goals = [
    "Finding a Cofounder",
    "Seeking Investment",
    "Hiring Talent",
    "Finding Clients",
    "Learning & Mentorship",
    "Strategic Partnerships",
  ]

  const handleConnect = (id: string) => {
    console.log("Connected with:", id)
  }

  const handlePass = (id: string) => {
    console.log("Passed on:", id)
  }

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]))
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Your Network</h1>
            <p className="text-muted-foreground">Discover people aligned with your goals</p>
          </div>

          {/* Search and Filters */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Search Bar */}
            <div className="md:col-span-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder='Try: "technical cofounder who knows RAG" or "designer looking for startups"'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                    disabled={isSearching}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="gap-2"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {/* Filter Button */}
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Search Results Info */}
          {hasSearched && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {isSearching
                  ? 'Searching with AI-powered semantic search...'
                  : `Found ${searchResults.length} ${searchResults.length === 1 ? 'match' : 'matches'} for "${searchQuery}"`}
              </p>
            </div>
          )}

          {/* Goal Filters */}
          {!hasSearched && (
            <Card className="p-6 mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Goals
              </h3>
              <div className="flex flex-wrap gap-2">
                {goals.map((goal) => (
                  <Button
                    key={goal}
                    variant={selectedGoals.includes(goal) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleGoal(goal)}
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Matches Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {hasSearched ? (
              searchResults.length > 0 ? (
                searchResults.map((match) => {
                  // Handle both current_role and headline field names
                  const title = match.headline || match.current_role || 'Member'
                  const company = match.current_company || ''

                  return (
                    <MatchCard
                      key={match.id}
                      id={match.id}
                      name={match.name}
                      title={title}
                      company={company}
                      bio={match.bio || ''}
                      goals={match.intent_structured?.looking_for || []}
                      matchScore={Math.round((1 - (match.distance || 0)) * 100)}
                      onConnect={handleConnect}
                      onPass={handlePass}
                    />
                  )
                })
              ) : (
                <div className="col-span-2 text-center py-12">
                  <p className="text-muted-foreground mb-2">No matches found</p>
                  <p className="text-sm text-muted-foreground">Try a different search query</p>
                </div>
              )
            ) : (
              mockMatches.map((match) => (
                <MatchCard key={match.id} {...match} onConnect={handleConnect} onPass={handlePass} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
