"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { CheckCircle2, ArrowRight } from "lucide-react"

interface OnboardingStep {
  id: number
  title: string
  description: string
}

const STEPS: OnboardingStep[] = [
  { id: 1, title: "Profile Setup", description: "Tell us about yourself" },
  { id: 2, title: "Goals & Interests", description: "What are you looking for?" },
  { id: 3, title: "Communities", description: "Join relevant communities" },
  { id: 4, title: "Preferences", description: "Customize your experience" },
]

interface OnboardingStepsProps {
  onComplete: (formData: any) => void
}

export function OnboardingSteps({ onComplete }: OnboardingStepsProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    bio: "",
    title: "",
    company: "",
    goals: [] as string[],
    communities: [] as string[],
    notifications: true,
  })

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal],
    }))
  }

  const handleCommunityToggle = (community: string) => {
    setFormData((prev) => ({
      ...prev,
      communities: prev.communities.includes(community)
        ? prev.communities.filter((c) => c !== community)
        : [...prev.communities, community],
    }))
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-smooth ${
                  step.id < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id === currentStep
                      ? "bg-secondary text-secondary-foreground border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.id}
              </div>
              <p className="text-xs font-medium mt-2 text-center">{step.title}</p>
            </div>
          ))}
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-2">{STEPS[currentStep - 1].title}</h2>
        <p className="text-muted-foreground mb-6">{STEPS[currentStep - 1].description}</p>

        {/* Step 1: Profile Setup */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Professional Title</label>
              <Input
                placeholder="e.g., Founder, Product Manager, Designer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company</label>
              <Input
                placeholder="Your company or organization"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tell us about yourself..."
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 2: Goals & Interests */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Select all that apply:</p>
            {[
              "Finding a Cofounder",
              "Seeking Investment",
              "Hiring Talent",
              "Finding Clients",
              "Learning & Mentorship",
              "Strategic Partnerships",
            ].map((goal) => (
              <label
                key={goal}
                className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth"
              >
                <input
                  type="checkbox"
                  checked={formData.goals.includes(goal)}
                  onChange={() => handleGoalToggle(goal)}
                  className="w-4 h-4"
                />
                <span className="font-medium">{goal}</span>
              </label>
            ))}
          </div>
        )}

        {/* Step 3: Communities */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Join communities that interest you:</p>
            {[
              "Startups & Founders",
              "Tech & Innovation",
              "Business & Strategy",
              "Investors & Finance",
              "Design & Creative",
              "Marketing & Growth",
            ].map((community) => (
              <label
                key={community}
                className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth"
              >
                <input
                  type="checkbox"
                  checked={formData.communities.includes(community)}
                  onChange={() => handleCommunityToggle(community)}
                  className="w-4 h-4"
                />
                <span className="font-medium">{community}</span>
              </label>
            ))}
          </div>
        )}

        {/* Step 4: Preferences */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth">
              <input
                type="checkbox"
                checked={formData.notifications}
                onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified about new matches and community updates</p>
              </div>
            </label>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
              <p className="text-sm font-medium text-primary mb-2">You're all set!</p>
              <p className="text-sm text-muted-foreground">
                Your profile is ready. Start exploring communities and discovering meaningful connections.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex-1 bg-transparent"
          >
            Previous
          </Button>
          <Button onClick={handleNext} className="flex-1 gap-2">
            {currentStep === STEPS.length ? "Complete Onboarding" : "Next"}
            {currentStep < STEPS.length && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </Card>
    </div>
  )
}
