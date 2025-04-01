"use client"

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, Settings2 } from "lucide-react"

interface PlatformSettings {
  allowNewRegistrations: boolean
  requireMentorApproval: boolean
  maxSessionsPerWeek: number
  sessionDuration: number
  maintenanceMode: boolean
  siteName: string
  contactEmail: string
}

export default function PlatformSettings() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<PlatformSettings>({
    allowNewRegistrations: true,
    requireMentorApproval: true,
    maxSessionsPerWeek: 5,
    sessionDuration: 60,
    maintenanceMode: false,
    siteName: "MentorBridge",
    contactEmail: "support@mentorbridge.com"
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings")
        if (!response.ok) {
          throw new Error("Failed to fetch settings")
        }
        const data = await response.json()
        setSettings(data)
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error",
          description: "Failed to load platform settings",
          variant: "destructive"
        })
      }
    }

    fetchSettings()
  }, [toast])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Success",
        description: "Platform settings updated successfully"
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to update platform settings",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    router.push("/login")
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">
            Manage your platform configuration and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic platform configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                placeholder="Enter site name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="Enter contact email"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Registration Settings
            </CardTitle>
            <CardDescription>
              Control user registration and approval process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow New Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable new user registrations
                </p>
              </div>
              <Switch
                checked={settings.allowNewRegistrations}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, allowNewRegistrations: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Mentor Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Require admin approval for new mentor accounts
                </p>
              </div>
              <Switch
                checked={settings.requireMentorApproval}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, requireMentorApproval: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Session Settings
            </CardTitle>
            <CardDescription>
              Configure session-related settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxSessions">Maximum Sessions per Week</Label>
              <Input
                id="maxSessions"
                type="number"
                min="1"
                value={settings.maxSessionsPerWeek}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  maxSessionsPerWeek: parseInt(e.target.value) 
                })}
                className="max-w-[200px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDuration">Session Duration (minutes)</Label>
              <Input
                id="sessionDuration"
                type="number"
                min="15"
                step="15"
                value={settings.sessionDuration}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  sessionDuration: parseInt(e.target.value) 
                })}
                className="max-w-[200px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              System-wide configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable maintenance mode to temporarily disable the platform
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, maintenanceMode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 