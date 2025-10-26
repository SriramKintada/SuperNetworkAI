"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            SN
          </div>
          <span className="hidden font-semibold sm:inline-block">SuperNetworkAI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
