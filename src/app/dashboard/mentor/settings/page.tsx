"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, Check, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  
  // Form states
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [sessionNotifications, setSessionNotifications] = useState(true)
  const [mentorshipNotifications, setMentorshipNotifications] = useState(true)
  const [marketingNotifications, setMarketingNotifications] = useState(false)
  
  // Session states
  const [sessions, setSessions] = useState([
    { id: 1, device: "Chrome on Windows", lastActive: "Now", current: true },
    { id: 2, device: "Mobile App on iPhone", lastActive: "Yesterday", current: false },
    { id: 3, device: "Firefox on Mac", lastActive: "3 days ago", current: false },
  ])
  
  // Validation states
  const [emailError, setEmailError] = useState("")
  const [passwordScore, setPasswordScore] = useState(0)
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })
  
  // Email validation
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }
  
  // Password validation
  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }
    
    setPasswordRequirements(requirements)
    
    // Calculate score (0-100)
    const score = Object.values(requirements).filter(Boolean).length * 20
    setPasswordScore(score)
    
    return score >= 60 // At least 3 requirements met
  }
  
  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }
  
  // Handle account update
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (emailError) {
      return
    }
    
    setIsUpdating(true)
    
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update settings")
      }
      
      toast({
        title: "Account updated",
        description: "Your account settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update account settings.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }
  
  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      })
      return
    }
    
    if (!validatePassword(newPassword)) {
      toast({
        title: "Password too weak",
        description: "Please make sure your password meets the requirements.",
        variant: "destructive",
      })
      return
    }
    
    setIsChangingPassword(true)
    
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to change password")
      }
      
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      })
      
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordScore(0)
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }
  
  // Handle account deactivation
  const handleDeactivateAccount = async () => {
    setIsDeactivating(true)
    
    try {
      const response = await fetch('/api/users/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to deactivate account")
      }
      
      toast({
        title: "Account deactivated",
        description: "Your account has been deactivated. You will be logged out.",
      })
      
      // Log the user out
      setTimeout(() => {
        logout()
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deactivate account.",
        variant: "destructive",
      })
    } finally {
      setIsDeactivating(false)
      setShowDeactivateDialog(false)
    }
  }
  
  // Handle session logout
  const handleLogoutSession = async (sessionId: number) => {
    // In a real app, call an API to invalidate the session
    // await fetch('/api/users/sessions/' + sessionId, { method: 'DELETE' })
    
    // For demo, we'll just update the UI
    setSessions(sessions.filter(session => session.id !== sessionId))
    
    toast({
      title: "Session ended",
      description: "The session has been logged out successfully.",
    })
  }
  
  // Handle notification updates
  const handleNotificationUpdate = async () => {
    // In a real app, send the preferences to the server
    // await fetch('/api/users/notifications', {
    //   method: 'PATCH',
    //   body: JSON.stringify({
    //     emailNotifications,
    //     sessionNotifications,
    //     mentorshipNotifications,
    //     marketingNotifications
    //   })
    // })
    
    toast({
      title: "Preferences updated",
      description: "Your notification preferences have been saved.",
    })
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Update your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className={emailError ? "border-red-500" : ""}
                  />
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={user?.username || ""} 
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Username cannot be changed after account creation
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isUpdating || !!emailError}
                >
                  {isUpdating ? "Updating..." : "Update Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    
                    {/* Password strength indicator */}
                    {newPassword && (
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Password strength</span>
                          <span>{passwordScore >= 80 ? "Strong" : passwordScore >= 60 ? "Good" : passwordScore >= 40 ? "Fair" : "Weak"}</span>
                        </div>
                        <Progress value={passwordScore} className="h-2" />
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                          <div className="flex items-center gap-2">
                            {passwordRequirements.length ? 
                              <Check size={16} className="text-green-500" /> : 
                              <X size={16} className="text-red-500" />}
                            <span>At least 8 characters</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {passwordRequirements.uppercase ? 
                              <Check size={16} className="text-green-500" /> : 
                              <X size={16} className="text-red-500" />}
                            <span>Uppercase letter</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {passwordRequirements.lowercase ? 
                              <Check size={16} className="text-green-500" /> : 
                              <X size={16} className="text-red-500" />}
                            <span>Lowercase letter</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {passwordRequirements.number ? 
                              <Check size={16} className="text-green-500" /> : 
                              <X size={16} className="text-red-500" />}
                            <span>Number</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {passwordRequirements.special ? 
                              <Check size={16} className="text-green-500" /> : 
                              <X size={16} className="text-red-500" />}
                            <span>Special character</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={confirmPassword && confirmPassword !== newPassword ? "border-red-500" : ""}
                    />
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-sm text-red-500">Passwords don't match</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isChangingPassword || !currentPassword || !newPassword || confirmPassword !== newPassword || passwordScore < 60}
                  >
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage devices where you're logged in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">{session.device}</p>
                        <p className="text-sm text-muted-foreground">
                          Last active: {session.lastActive}
                          {session.current && " (current session)"}
                        </p>
                      </div>
                      {!session.current && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleLogoutSession(session.id)}
                        >
                          Log Out
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-destructive">
              <CardHeader className="text-destructive">
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Once you deactivate your account, all your data will be permanently removed.
                    This action cannot be undone.
                  </p>
                  
                  <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        Deactivate Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="text-destructive" size={20} />
                          Deactivate Account
                        </DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm font-medium">Type "delete" to confirm:</p>
                        <Input 
                          className="mt-2"
                          id="confirm-delete"
                          placeholder="delete"
                          onChange={(e) => {
                            const isConfirmed = e.target.value.toLowerCase() === 'delete';
                            setIsDeactivating(!isConfirmed);
                          }}
                        />
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowDeactivateDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          disabled={isDeactivating}
                          onClick={handleDeactivateAccount}
                        >
                          I understand, deactivate my account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">New Session Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                  <Switch 
                    checked={sessionNotifications} 
                    onCheckedChange={setSessionNotifications} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Mentorship Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Notifications about mentorship requests and messages
                    </p>
                  </div>
                  <Switch 
                    checked={mentorshipNotifications} 
                    onCheckedChange={setMentorshipNotifications} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Marketing and Promotions</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and special offers
                    </p>
                  </div>
                  <Switch 
                    checked={marketingNotifications} 
                    onCheckedChange={setMarketingNotifications} 
                  />
                </div>
                
                <Button onClick={handleNotificationUpdate}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}