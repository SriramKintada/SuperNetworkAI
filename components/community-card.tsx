"use client"

import Link from "next/link"
import { Users, MapPin, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CommunityCardProps {
  id: string
  name: string
  description: string
  memberCount: number
  location?: string
  image?: string
  topIntents?: string[]
  isJoined?: boolean
  onJoin?: () => void
  type?: "public" | "private"
}

export function CommunityCard({
  id,
  name,
  description,
  memberCount,
  location,
  image,
  topIntents,
  isJoined = false,
  onJoin,
  type = "public",
}: CommunityCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      {/* Community Image */}
      {image && (
        <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden relative">
          <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                type === "private" ? "bg-accent/90 text-white" : "bg-primary/90 text-white"
              }`}
            >
              {type === "private" ? "Private" : "Public"}
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-foreground mb-1">{name}</h3>
          {location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-1 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-medium">{memberCount.toLocaleString()}</span>
            <span className="text-muted-foreground">members</span>
          </div>
          {topIntents && topIntents.length > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">{topIntents[0]}</span>
            </div>
          )}
        </div>

        {/* Top Intents Tags */}
        {topIntents && topIntents.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {topIntents.slice(0, 3).map((intent) => (
              <span
                key={intent}
                className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
              >
                {intent}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href={`/communities/${id}`}>View Community</Link>
          </Button>
          {!isJoined && (
            <Button onClick={onJoin} className="flex-1 bg-accent hover:bg-accent/90">
              {type === "private" ? "Request" : "Join"}
            </Button>
          )}
          {isJoined && (
            <Button disabled className="flex-1 bg-primary/20 text-primary">
              Joined
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
