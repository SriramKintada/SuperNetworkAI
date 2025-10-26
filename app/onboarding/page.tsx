"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingSteps } from "@/components/onboarding-steps"
import { supabase } from "@/lib/supabase"

export default function OnboardingPage() {
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async (formData: any) => {
    setIsCompleting(true)
    setError(null)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("User not authenticated")

      // Create profile text for embedding
      const intentText = formData.goals.join(", ")
      const profileText = `${formData.title} at ${formData.company}. ${formData.bio}. Looking for: ${intentText}.`

      // Save profile to database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'User',
          email: user.email,
          photo_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          bio: formData.bio,
          current_role: formData.title,
          current_company: formData.company,
          intent_text: intentText,
          intent_structured: { looking_for: formData.goals, communities: formData.communities },
          profile_complete: true,
          onboarding_completed: true,
        })
        .select()
        .single()

      if (profileError) throw profileError

      // Generate embedding for the profile
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-embedding', {
        body: {
          profileId: profile.id
        }
      })

      if (functionError) {
        console.error("Embedding generation failed:", functionError)
        // Don't block onboarding if embedding fails - can be regenerated later
      }

      router.push("/dashboard")
    } catch (err: any) {
      console.error("Onboarding error:", err)
      setError(err.message || "Failed to complete onboarding. Please try again.")
      setIsCompleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-background to-cream-dark py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome to SuperNetworkAI</h1>
          <p className="text-lg text-muted-foreground">Let's set up your profile to find the perfect matches</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <OnboardingSteps onComplete={handleComplete} />

        {isCompleting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-card rounded-lg p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-spin">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
              </div>
              <p className="font-medium">Setting up your profile...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
