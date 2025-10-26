import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Zap, Users, Brain, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream via-background to-background py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block mb-6 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <span className="text-sm font-medium text-secondary">AI-Powered Networking</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Find Your Perfect <span className="text-primary">Network</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                SuperNetworkAI uses advanced AI to match you with cofounders, advisors, clients, and teammates who align
                with your goals and vision.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how-it-works">Learn More</Link>
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl rounded-full" />
                <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-primary">10K+</div>
                      <p className="text-sm text-muted-foreground">Active Members</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">5K+</div>
                      <p className="text-sm text-muted-foreground">Connections Made</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">98%</div>
                      <p className="text-sm text-muted-foreground">Match Success</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to build meaningful professional relationships
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-8 hover:shadow-lg transition-smooth">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Matching</h3>
                <p className="text-muted-foreground">
                  Our advanced algorithms analyze your profile, goals, and preferences to find your ideal matches.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-smooth">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Intent-Driven Communities</h3>
                <p className="text-muted-foreground">
                  Join private communities focused on specific goals: startups, investments, hiring, and more.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-smooth">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Connections</h3>
                <p className="text-muted-foreground">
                  Get matched with relevant people instantly. No more endless scrolling or cold outreach.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-smooth">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
                <p className="text-muted-foreground">
                  Your data is encrypted and protected. Control exactly who sees your profile and information.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-32 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground">Get started in minutes and find your perfect network</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {[
                  {
                    step: "1",
                    title: "Create Your Profile",
                    description: "Tell us about yourself, your goals, and what you're looking for in a network.",
                  },
                  {
                    step: "2",
                    title: "Join Communities",
                    description: "Browse and join intent-driven communities that match your interests and goals.",
                  },
                  {
                    step: "3",
                    title: "Get AI Matches",
                    description: "Our AI analyzes profiles and suggests the best matches for meaningful connections.",
                  },
                  {
                    step: "4",
                    title: "Connect & Grow",
                    description: "Start conversations, build relationships, and grow your network with purpose.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground font-bold">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Find Your Network?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of professionals already building meaningful connections on SuperNetworkAI.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
