"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">SuperNetworkAI</h3>
            <p className="text-sm text-muted-foreground">AI-powered networking for finding your perfect match.</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2025 SuperNetworkAI. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
              Twitter
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
              LinkedIn
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-smooth">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
