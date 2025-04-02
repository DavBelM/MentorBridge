"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { format, parseISO, isAfter, formatDistanceToNow } from "date-fns"
import { ArrowLeft, Calendar, Clock, MapPin, Globe, Video, MessageSquare, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type Session = {
  id: number
  title: string
  description: string | null
  startTime: string
  endTime: string
  status: string
  location: string | null
  notes: string | null
  feedback: string | null
  mentee: {
    id: number
    fullname: string
    email: string
    profile: {
      profilePicture: string | null
    }
  }
}

export default function SessionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [sessionData, setSessionData] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [sessionNotes, setSessionNotes] = useState("")
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [isSavingFeedback, setIsSavingFeedback] = useState(false)
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false)
  const [isCompletingSession, setIsCompletingSession] = useState(false)
  
  useEffect(() => {
    async function fetchSessionDetails() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/sessions/${sessionId}`)
        if (!response.ok) throw new Error("Failed to fetch session details")
        const data = await response.json()
        setSessionData(data)
        setSessionNotes(data.notes || "")
        setFeedbackText(data.feedback || "")
      } catch (error) {
        console.error("Error fetching session details:", error)
        toast({
          title: "Error",
          description: "Failed to load session details",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session?.user?.id && sessionId) {
      fetchSessionDetails()
    }
  }, [session, sessionId, toast])
  
  const handleCancelSession = async () => {
    setIsCancelling(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "CANCELLED",
          cancellationReason,
        }),
      })
      
      if (!response.ok) throw new Error("Failed to cancel session")
      
      toast({
        title: "Session Cancelled",
        description: "The session has been cancelled successfully",
      })
      
      // Update the local state
      setSessionData(prev => prev ? { ...prev, status: "CANCELLED" } : null)
      setConfirmCancelOpen(false)
    } catch (error) {
      console.error("Error cancelling session:", error)
      toast({
        title: "Error",
        description: "Failed to cancel session. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCancelling(false)
    }
  }
  
  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: sessionNotes,
        }),
      })
      
      if (!response.ok) throw new Error("Failed to save notes")
      
      toast({
        title: "Notes Saved",
        description: "Your session notes have been saved",
      })
      
      // Update the local state
      setSessionData(prev => prev ? { ...prev, notes: sessionNotes } : null)
      setNotesDialogOpen(false)
    } catch (error) {
      console.error("Error saving notes:", error)
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSavingNotes(false)
    }
  }
  
  const handleSaveFeedback = async () => {
    setIsSavingFeedback(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/feedback`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback: feedbackText,
        }),
      })
      
      if (!response.ok) throw new Error("Failed to save feedback")
      
      toast({
        title: "Feedback Saved",
        description: "Your feedback has been saved",
      })
      
      // Update the local state
      setSessionData(prev => prev ? { ...prev, feedback: feedbackText } : null)
      setFeedbackDialogOpen(false)
    } catch (error) {
      console.error("Error saving feedback:", error)
      toast({
        title: "Error",
        description: "Failed to save feedback. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSavingFeedback(false)
    }
  }
  
  const handleCompleteSession = async () => {
    setIsCompletingSession(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      })
      
      if (!response.ok) throw new Error("Failed to mark session as complete")
      
      toast({
        title: "Session Completed",
        description: "The session has been marked as complete",
      })
      
      // Update the local state
      setSessionData(prev => prev ? { ...prev, status: "COMPLETED" } : null)
      setConfirmCompleteOpen(false)
      
      // Open feedback dialog
      setFeedbackDialogOpen(true)
    } catch (error) {
      console.error("Error completing session:", error)
      toast({
        title: "Error",
        description: "Failed to mark session as complete. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCompletingSession(false)
    }
  }
  
  const handleMessageMentee = () => {
    if (sessionData?.mentee.id) {
      router.push(`/dashboard/mentor/messages?userId=${sessionData.mentee.id}`)
    }
  }
  
  // Helper function to format date
  const formatSessionTime = (startTime: string, endTime: string) => {
    const start = parseISO(startTime)
    const end = parseISO(endTime)
    
    return `${format(start, "EEEE, MMMM d, yyyy")} · ${format(start, "h:mm a")} - ${format(end, "h:mm a")}`
  }
  
  // Get status badge with appropriate color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge className="bg-blue-500">Upcoming</Badge>
      case "COMPLETED":
        return <Badge variant="secondary">Completed</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>
      case "DECLINED":
        return <Badge variant="destructive">Declined</Badge>
      case "PENDING":
        return <Badge variant="outline">Pending Approval</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  
  // Helper to get the right icon for location
  const getLocationIcon = (location: string | null) => {
    if (!location) return <MapPin className="h-5 w-5 text-muted-foreground" />
    
    if (location.includes("zoom") || location.includes("meet") || location.includes("teams")) {
      return <Video className="h-5 w-5 text-blue-500" />
    } else if (location.includes("http")) {
      return <Globe className="h-5 w-5 text-purple-500" />
    } else {
      return <MapPin className="h-5 w-5 text-green-500" />
    }
  }
  
  // Check if the session can be cancelled (only if it's in the future and not already cancelled)
  const canCancel = sessionData && 
    (sessionData.status === "SCHEDULED" || sessionData.status === "PENDING") && 
    isAfter(parseISO(sessionData.startTime), new Date())
  
  // Check if the session can be marked as complete (only if it's scheduled and in the past)
  const canComplete = sessionData && 
    sessionData.status === "SCHEDULED" && 
    !isAfter(parseISO(sessionData.endTime), new Date())
  
  // Check if session is pending approval
  const isPending = sessionData && sessionData.status === "PENDING"
  
  if (isLoading) {
    return <SessionDetailsSkeleton />
  }
  
  if (!sessionData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push("/dashboard/mentor/sessions")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Session Not Found</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Session not found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              The session you are looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push("/dashboard/mentor/sessions")}>
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push("/dashboard/mentor/sessions")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Session Details</h1>
      </div>
      
      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{sessionData.title}</CardTitle>
                <CardDescription className="text-base flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatSessionTime(sessionData.startTime, sessionData.endTime)}
                </CardDescription>
              </div>
              {getStatusBadge(sessionData.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-6 mt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={sessionData.mentee.profile.profilePicture || ""} alt={sessionData.mentee.fullname} />
                  <AvatarFallback>{sessionData.mentee.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">With {sessionData.mentee.fullname}</h3>
                  <p className="text-sm text-muted-foreground">{sessionData.mentee.email}</p>
                </div>
              </div>
              
              <div className="ml-auto flex gap-2">
                <Button variant="outline" onClick={handleMessageMentee}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Location</h3>
                <div className="flex items-center gap-2 text-sm">
                  {getLocationIcon(sessionData.location)}
                  {sessionData.location ? (
                    sessionData.location.startsWith("http") ? (
                      <a 
                        href={sessionData.location} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Join Meeting Link
                      </a>
                    ) : (
                      <span>{sessionData.location}</span>
                    )
                  ) : (
                    <span className="text-muted-foreground">No location specified</span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Session Status</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {sessionData.status === "SCHEDULED" && isAfter(parseISO(sessionData.startTime), new Date()) && 
                      "Scheduled to start in " + formatDistanceToNow(parseISO(sessionData.startTime), { addSuffix: true })}
                    {sessionData.status === "SCHEDULED" && !isAfter(parseISO(sessionData.startTime), new Date()) && 
                      "Session in progress or awaiting completion"}
                    {sessionData.status === "COMPLETED" && "Completed"}
                    {sessionData.status === "CANCELLED" && "Cancelled"}
                    {sessionData.status === "DECLINED" && "Declined"}
                    {sessionData.status === "PENDING" && "Awaiting your approval"}
                  </span>
                </div>
              </div>
            </div>
            
            {sessionData.description && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm whitespace-pre-line">{sessionData.description}</p>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Your Notes</h3>
              {sessionData.notes ? (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm whitespace-pre-line">{sessionData.notes}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notes yet</p>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setNotesDialogOpen(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                {sessionData.notes ? "Edit Notes" : "Add Notes"}
              </Button>
            </div>
            
            {(sessionData.status === "COMPLETED" || canComplete) && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Feedback</h3>
                {sessionData.feedback ? (
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm whitespace-pre-line">{sessionData.feedback}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No feedback provided yet</p>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setFeedbackDialogOpen(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {sessionData.feedback ? "Edit Feedback" : "Add Feedback"}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div>
              {sessionData.status === "CANCELLED" && (
                <p className="text-sm text-muted-foreground">
                  This session has been cancelled
                </p>
              )}
              {sessionData.status === "DECLINED" && (
                <p className="text-sm text-muted-foreground">
                  This session has been declined
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/mentor/sessions")}
              >
                Back to Sessions
              </Button>
              
              {isPending && (
                <>
                  <Button 
                    variant="destructive"
                    onClick={() => handleCancelSession()}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => handleCompleteSession()}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              
              {canCancel && !isPending && (
                <Button 
                  variant="destructive"
                  onClick={() => setConfirmCancelOpen(true)}
                >
                  Cancel Session
                </Button>
              )}
              
              {canComplete && (
                <Button 
                  variant="default"
                  onClick={() => setConfirmCompleteOpen(true)}
                >
                  Mark as Complete
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Cancel Confirmation Dialog */}
      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium">
              Reason for cancellation (optional)
            </label>
            <Textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Let your mentee know why you're cancelling"
              className="mt-2"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmCancelOpen(false)}
            >
              Keep Session
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSession}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Complete Confirmation Dialog */}
      <Dialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Session as Complete</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this session as complete?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmCompleteOpen(false)}
            >
              Not Yet
            </Button>
            <Button 
              variant="default" 
              onClick={handleCompleteSession}
              disabled={isCompletingSession}
            >
              {isCompletingSession ? "Updating..." : "Yes, Mark as Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Notes</DialogTitle>
            <DialogDescription>
              Add or edit your notes for this session. These are private to you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Add your notes here..."
              className="min-h-[200px]"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setNotesDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
            >
              {isSavingNotes ? "Saving..." : "Save Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Feedback</DialogTitle>
            <DialogDescription>
              Provide feedback for this session. This will be visible to your mentee.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What went well? What could be improved? Any specific advice for your mentee?"
              className="min-h-[200px]"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setFeedbackDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveFeedback}
              disabled={isSavingFeedback}
            >
              {isSavingFeedback ? "Saving..." : "Save Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 

function SessionDetailsSkeleton() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Skeleton className="h-9 w-16 mr-2" /> {/* Back button */}
        <Skeleton className="h-8 w-40" /> {/* Page title */}
      </div>
      
      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-8 w-64 mb-2" /> {/* Session title */}
                <Skeleton className="h-5 w-80" /> {/* Date and time */}
              </div>
              <Skeleton className="h-6 w-24" /> {/* Status badge */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-6 mt-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" /> {/* Mentee avatar */}
                <div>
                  <Skeleton className="h-6 w-44 mb-1" /> {/* Mentee name */}
                  <Skeleton className="h-4 w-32" /> {/* Mentee email */}
                </div>
              </div>
              
              <div className="ml-auto">
                <Skeleton className="h-10 w-28" /> {/* Message button */}
              </div>
            </div>
            
            <div className="my-6 h-[1px] bg-muted" /> {/* Separator */}
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Skeleton className="h-5 w-24 mb-2" /> {/* Location label */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" /> {/* Location icon */}
                  <Skeleton className="h-5 w-40" /> {/* Location value */}
                </div>
              </div>
              
              <div>
                <Skeleton className="h-5 w-32 mb-2" /> {/* Status label */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" /> {/* Status icon */}
                  <Skeleton className="h-5 w-48" /> {/* Status value */}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Skeleton className="h-5 w-28 mb-2" /> {/* Description label */}
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            
            <div className="mt-6">
              <Skeleton className="h-5 w-16 mb-2" /> {/* Notes label */}
              <Skeleton className="h-24 w-full mb-2 rounded-md" /> {/* Notes content */}
              <Skeleton className="h-9 w-28 mt-2" /> {/* Edit notes button */}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Skeleton className="h-10 w-32 mr-2" /> {/* Back button */}
            <Skeleton className="h-10 w-32" /> {/* Action button */}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}