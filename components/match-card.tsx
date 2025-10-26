"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, X } from "lucide-react"

interface MatchCardProps {
  id: string
  name: string
  title: string
  company: string
  bio: string
  goals: string[]
  matchScore: number
  onConnect: (id: string) => void
  onPass: (id: string) => void
}

export function MatchCard({ id, name, title, company, bio, goals, matchScore, onConnect, onPass }: MatchCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {title} at {company}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{matchScore}%</div>
          <p className="text-xs text-muted-foreground">Match</p>
        </div>
      </div>

      <p className="text-muted-foreground mb-4 line-clamp-2">{bio}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {goals.map((goal) => (
          <Badge key={goal} variant="secondary">
            {goal}
          </Badge>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent" onClick={() => onPass(id)}>
          <X className="w-4 h-4" />
          Pass
        </Button>
        <Button size="sm" className="flex-1 gap-2" onClick={() => onConnect(id)}>
          <Heart className="w-4 h-4" />
          Connect
        </Button>
      </div>
    </Card>
  )
}
