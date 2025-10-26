"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, MessageSquare, Settings, LogOut, Menu, X, Shield, TrendingUp, Flag } from "lucide-react"
import { useState } from "react"

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/communities", label: "Communities", icon: MessageSquare },
    { href: "/admin/moderation", label: "Moderation", icon: Flag },
    { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 hover:bg-muted rounded-lg transition-smooth"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-30 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sidebar-foreground">Admin</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full gap-2 justify-start bg-transparent" asChild>
            <Link href="/login">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
