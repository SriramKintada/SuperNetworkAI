"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Save } from "lucide-react"

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "Sarah",
    lastName: "Chen",
    title: "Product Manager",
    company: "TechCorp",
    location: "San Francisco, CA",
    bio: "Passionate about building innovative products that solve real problems.",
    website: "https://sarahchen.com",
    twitter: "@sarahchen",
    linkedin: "linkedin.com/in/sarahchen",
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Save profile data
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8 max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
            <p className="text-muted-foreground">Update your professional information</p>
          </div>

          {/* Profile Form */}
          <Card className="p-8 space-y-6">
            {/* Name */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" />
              </div>
            </div>

            {/* Professional Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Professional Title</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Product Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <Input name="company" value={formData.company} onChange={handleChange} placeholder="Company name" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Social Links */}
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4">Social Links</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter</label>
                  <Input name="twitter" value={formData.twitter} onChange={handleChange} placeholder="@username" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn</label>
                  <Input
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" className="bg-transparent">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
