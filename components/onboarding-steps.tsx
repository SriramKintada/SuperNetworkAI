"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface OnboardingStep {
  id: number
  title: string
  description: string
}

const STEPS: OnboardingStep[] = [
  { id: 0, title: "LinkedIn Import", description: "Import from LinkedIn (optional)" },
  { id: 1, title: "Profile Setup", description: "Tell us about yourself" },
  { id: 2, title: "Goals & Interests", description: "What are you looking for?" },
  { id: 3, title: "Communities", description: "Join relevant communities" },
  { id: 4, title: "Preferences", description: "Customize your experience" },
]

interface OnboardingStepsProps {
  onComplete: (formData: any) => void
}

export function OnboardingSteps({ onComplete }: OnboardingStepsProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    bio: "",
    title: "",
    company: "",
    location: "",
    skills: [] as string[],
    linkedin_url: "",
    goals: [] as string[],
    communities: [] as string[],
    notifications: true,
  })

  const handleLinkedinImport = async () => {
    if (!linkedinUrl.trim()) {
      setImportError("Please enter a LinkedIn URL")
      return
    }

    setIsImporting(true)
    setImportError(null)

    try {
      const { data, error } = await supabase.functions.invoke('hyper-service', {
        body: { linkedinUrl }
      })

      if (error) throw error

      // Check if data contains an error (Edge Function returned error in response body)
      if (data?.error) {
        throw new Error(data.error)
      }

      // Populate form data with LinkedIn data
      setFormData({
        ...formData,
        bio: data.bio || formData.bio,
        title: data.current_role || formData.title,
        company: data.current_company || formData.company,
        location: data.location || formData.location,
        skills: data.skills || formData.skills,
        linkedin_url: linkedinUrl,
      })

      // Auto-advance to next step
      setCurrentStep(1)
    } catch (error: any) {
      console.error('LinkedIn import error:', error)

      // Provide helpful error messages
      let errorMessage = 'Failed to import LinkedIn profile. '

      if (error.message?.includes('profile mismatch') || error.message?.includes('private')) {
        errorMessage = 'Unable to access this LinkedIn profile. It may be private, deleted, or the URL is incorrect. Please check your profile privacy settings or try "Skip & Fill Manually".'
      } else if (error.message?.includes('LinkedIn URL is required')) {
        errorMessage = 'Please enter a valid LinkedIn URL.'
      } else {
        errorMessage += error.message || 'Please try again or skip.'
      }

      setImportError(errorMessage)
    } finally {
      setIsImporting(false)
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
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
        <h2 className="text-2xl font-bold mb-2">{STEPS[currentStep].title}</h2>
        <p className="text-muted-foreground mb-6">{STEPS[currentStep].description}</p>

        {/* Step 0: LinkedIn Import */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Save time!</strong> Import your profile from LinkedIn and we'll automatically fill in your details using AI.
              </p>
            </div>

            {importError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">{importError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn Profile URL</label>
              <Input
                type="url"
                placeholder="https://www.linkedin.com/in/your-profile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                disabled={isImporting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your public LinkedIn URL (e.g., linkedin.com/in/yourname)
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleLinkedinImport}
                disabled={isImporting || !linkedinUrl.trim()}
                className="flex-1"
              >
                {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isImporting ? 'Importing...' : 'Import from LinkedIn'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={isImporting}
                className="flex-1"
              >
                Skip & Fill Manually
              </Button>
            </div>

            {isImporting && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-amber-800">
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                  Scraping your LinkedIn profile and extracting key details with AI... This may take 15-30 seconds.
                </p>
              </div>
            )}
          </div>
        )}

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
        {currentStep > 0 && (
          <div className="flex gap-4 mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1 bg-transparent"
            >
              Previous
            </Button>
            <Button onClick={handleNext} className="flex-1 gap-2">
              {currentStep === STEPS.length - 1 ? "Complete Onboarding" : "Next"}
              {currentStep < STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
