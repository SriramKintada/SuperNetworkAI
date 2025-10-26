"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingSteps } from "@/components/onboarding-steps"

export default function OnboardingPage() {
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    // TODO: Save onboarding data
    setTimeout(() => {
      router.push("/dashboard")
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-background to-cream-dark py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome to SuperNetworkAI</h1>
          <p className="text-lg text-muted-foreground">Let's set up your profile to find the perfect matches</p>
        </div>

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
