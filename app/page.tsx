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
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block mb-6 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <span className="text-sm font-medium text-secondary">AI-Powered Community Networking</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Know Everyone in Your <span className="text-primary">Community</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                Stop missing out on hidden opportunities. Discover everyone in your WhatsApp and Telegram groups—the quiet experts, potential cofounders, investors, and clients you never knew existed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#problem">See the Problem</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="py-20 md:py-32 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">The Hidden Opportunity Problem</h2>
                <p className="text-lg text-muted-foreground">
                  You're already in the right communities—but you're only scratching the surface
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <Card className="p-8 border-red-200 bg-red-50/50">
                  <div className="text-4xl mb-4">😓</div>
                  <h3 className="text-xl font-semibold mb-3 text-red-900">You Only Know the Loud Ones</h3>
                  <p className="text-muted-foreground">
                    In your WhatsApp groups and Telegram channels, you only get to know the <strong>most active members</strong>.
                    The quiet ones—who might be perfect cofounders, investors, or clients—remain invisible.
                  </p>
                </Card>

                <Card className="p-8 border-red-200 bg-red-50/50">
                  <div className="text-4xl mb-4">🕵️</div>
                  <h3 className="text-xl font-semibold mb-3 text-red-900">Missing Hidden Gems</h3>
                  <p className="text-muted-foreground">
                    That <strong>inactive person</strong> in your 500-member community? They could be a technical cofounder,
                    an angel investor, or your next big client. But you'll never know because they don't post much.
                  </p>
                </Card>

                <Card className="p-8 border-red-200 bg-red-50/50">
                  <div className="text-4xl mb-4">⏰</div>
                  <h3 className="text-xl font-semibold mb-3 text-red-900">No Time to Network Individually</h3>
                  <p className="text-muted-foreground">
                    You'd love to know everyone in your community, but who has time to DM <strong>hundreds of people individually</strong>?
                    It's impossible to scale personal networking.
                  </p>
                </Card>

                <Card className="p-8 border-red-200 bg-red-50/50">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-3 text-red-900">Can't Find the Right People</h3>
                  <p className="text-muted-foreground">
                    Need someone with <strong>"fintech experience who's looking for cofounders"</strong>? Good luck searching
                    through chat histories or guessing who fits that description.
                  </p>
                </Card>
              </div>

              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground mb-4">
                  You're sitting on a goldmine of connections—but you can't access them.
                </p>
                <p className="text-lg text-muted-foreground">
                  Until now.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="solution" className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-block mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-sm font-medium text-primary">The Solution</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">Unlock Everyone in Your Community</h2>
                <p className="text-lg text-muted-foreground">
                  SuperNetworkAI helps your entire community create rich profiles—so you can finally discover the quiet experts hiding in plain sight
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="p-6 border-primary/20 bg-primary/5">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold mb-2">1. Everyone Creates a Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Members share their skills, goals, and what they're looking for—no more guessing or searching through chat history.
                  </p>
                </Card>

                <Card className="p-6 border-primary/20 bg-primary/5">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold mb-2">2. AI-Powered Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Type: "technical cofounder who knows AI"—instantly see everyone who matches, ranked by relevance.
                  </p>
                </Card>

                <Card className="p-6 border-primary/20 bg-primary/5">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-lg font-semibold mb-2">3. Connect Without Friction</h3>
                  <p className="text-sm text-muted-foreground">
                    No awkward cold DMs. See who's a match, why they're a match, and connect with confidence.
                  </p>
                </Card>
              </div>

              <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Search Your Community OR the Entire Public Network</h3>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Private Communities</h4>
                        <p className="text-sm text-muted-foreground">
                          Search within your WhatsApp/Telegram group members only. Keep it exclusive.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Public Network</h4>
                        <p className="text-sm text-muted-foreground">
                          Expand your reach. Search across all public profiles to find anyone, anywhere.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Platform Features</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to unlock your community's full potential
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-8 hover:shadow-lg transition-smooth">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Natural Language Search</h3>
                <p className="text-muted-foreground">
                  Type what you're looking for in plain English: <strong>"technical cofounder who knows AI"</strong> or <strong>"designer looking for startups"</strong>.
                  Our AI understands context, not just keywords.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-smooth">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Private Community Networks</h3>
                <p className="text-muted-foreground">
                  Create exclusive communities for your WhatsApp or Telegram group. Only members can see each other's profiles.
                  Keep your network private while making everyone discoverable.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-smooth">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Match Explanations</h3>
                <p className="text-muted-foreground">
                  Don't just see matches—understand <strong>why</strong> they're a match. Our AI explains the connection:
                  "Sarah has 8 years of AI/ML experience and is actively seeking a business cofounder."
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-smooth">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Privacy Control</h3>
                <p className="text-muted-foreground">
                  Choose who sees your profile: <strong>Public</strong> (everyone), <strong>Community-Only</strong> (your groups),
                  or <strong>Private</strong> (invisible to search). You control your visibility.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-smooth border-primary/20">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">LinkedIn Quick Import</h3>
                <p className="text-muted-foreground">
                  Paste your LinkedIn URL and our AI extracts your bio, skills, experience, and goals in seconds.
                  No manual data entry required.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-smooth border-primary/20">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Public Network Discovery</h3>
                <p className="text-muted-foreground">
                  Not finding what you need in your private communities? Search the entire public network to discover
                  people beyond your immediate circles.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground">Get your community discoverable in 3 simple steps</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {[
                  {
                    step: "1",
                    title: "Create Your Profile (2 minutes)",
                    description: "Share your skills, experience, and what you're looking for. Or paste your LinkedIn URL and let AI do the work for you.",
                  },
                  {
                    step: "2",
                    title: "Join or Create a Community",
                    description: "Join your WhatsApp/Telegram group's private community with an invite code. Or create a public profile to be discovered by anyone.",
                  },
                  {
                    step: "3",
                    title: "Search & Connect",
                    description: "Type what you need in natural language: \"technical cofounder who knows blockchain\". Get instant matches with AI explanations of why they're a fit.",
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

              <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                <h4 className="text-lg font-semibold mb-3 text-center">💡 Pro Tip</h4>
                <p className="text-muted-foreground text-center">
                  Get your entire WhatsApp or Telegram group to create profiles. The more members join, the more valuable your private community network becomes.
                  Finally see everyone—not just the loud ones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Stop Missing Hidden Opportunities</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              That quiet person in your WhatsApp group could be your next cofounder, investor, or client.
              Make everyone in your community discoverable—starting today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                <Link href="#problem">See the Problem Again</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
