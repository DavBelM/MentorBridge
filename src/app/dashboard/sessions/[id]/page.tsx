// src/app/dashboard/sessions/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { get, patch } from "@/lib/api-client"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CalendarClock, Check, Clock, MapPin, Video, Edit, Trash } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type Session = {
  id: number
  title: string
  description: string | null
  startTime: string
  endTime: string
  status: string
  notes: string | null
  mentor: {
    id: number
    fullname: string
    profile: {
      profilePicture: string | null
    }
  }
  mentee: {
    id: number
    fullname: string
    profile: {
      profilePicture: string | null
    }
  }
}

export default function SessionDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = Number(params?.id)
  const { user } = useAuth()
  
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchSession() {
      setIsLoading(true)
      try {
        const { session } = await get<{ session: Session }>(`/api/sessions/${sessionId}`)
        setSession(session)
        setNotes(session.notes || "")
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  const isMentor = user?.role === 'MENTOR'
  
  // Check if session is in the past
  const isPastSession = session ? new Date(session.endTime) < new Date() : false
  
  // Format session time
  function formatSessionDate(startTime: string) {
    return format(new Date(startTime), 'EEEE, MMMM d, yyyy')
  }
  
  function formatSessionTime(startTime: string, endTime: string) {
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
  }
  
  // Get status badge variant
  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case 'scheduled':
        return 'outline';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  }
  
  // Complete session
  async function completeSession() {
    try {
      const { session: updatedSession } = await patch<{ session: Session }>(`/api/sessions/${sessionId}`, {
        status: 'completed',
        notes
      })
      setSession(updatedSession)
    } catch (error) {
      console.error('Error completing session:', error)
      alert('Failed to complete session')
    }
  }
  
  // Cancel session
  async function cancelSession() {
    try {
      const { session: updatedSession } = await patch<{ session: Session }>(`/api/sessions/${sessionId}`, {
        status: 'cancelled'
      })
      setSession(updatedSession)
    } catch (error) {
      console.error('Error cancelling session:', error)
      alert('Failed to cancel session')
    }
  }
  
  // Save notes
  async function saveNotes() {
    setIsSaving(true)
    try {
      const { session: updatedSession } = await patch<{ session: Session }>(`/api/sessions/${sessionId}`, {
        notes
      })
      setSession(updatedSession)
      alert('Notes saved successfully')
    } catch (error) {
      console.error('Error saving notes:', error)
      alert('Failed to save notes')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent className="py-6">
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-2/3"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-10 bg-muted rounded-full w-10"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Session Not Found</h1>
        <p>The session you are looking for doesn't exist or you don't have permission to view it.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/sessions')}>
          Back to Sessions
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{session.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getStatusBadgeVariant(session.status)}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
            <span className="text-muted-foreground">
              Session ID: {session.id}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          {session.status === 'scheduled' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/dashboard/sessions/${sessionId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this session?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The session will be marked as cancelled
                      and all participants will be notified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Session</AlertDialogCancel>
                    <AlertDialogAction onClick={cancelSession}>
                      Yes, Cancel Session
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          
          {session.status === 'scheduled' && isPastSession && (
            <Button onClick={completeSession}>
              <Check className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Session details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarClock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formatSessionDate(session.startTime)}</p>
                  <p>{formatSessionTime(session.startTime, session.endTime)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Video Conference</p>
                  <p className="text-sm text-muted-foreground">
                    A meeting link will be provided 30 minutes before the session
                  </p>
                </div>
              </div>
              
              {session.description && (
                <div className="pt-2">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {session.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Session notes */}
          <Card>
            <CardHeader>
              <CardTitle>Session Notes</CardTitle>
              <CardDescription>
                {session.status === 'completed' 
                  ? "Notes from this completed session"
                  : "Take notes during or after your session"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes"
                  placeholder="Enter session notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  disabled={session.status === 'cancelled'}
                />
              </div>
            </CardContent>
            {session.status !== 'cancelled' && (
              <CardFooter>
                <Button onClick={saveNotes} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Notes'}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
        
        {/* Participant info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{isMentor ? 'Mentee' : 'Mentor'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage 
                    src={isMentor 
                      ? session.mentee.profile?.profilePicture || ''
                      : session.mentor.profile?.profilePicture || ''
                    } 
                    alt={isMentor 
                      ? session.mentee.fullname
                      : session.mentor.fullname
                    } 
                  />
                  <AvatarFallback>
                    {(isMentor 
                      ? session.mentee.fullname
                      : session.mentor.fullname
                    ).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">
                    {isMentor ? session.mentee.fullname : session.mentor.fullname}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isMentor ? 'Mentee' : 'Mentor'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Send Message
                </Button>
                
                {session.status === 'scheduled' && !isPastSession && (
                  <Button variant="secondary" className="w-full">
                    Request Reschedule
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => router.push('/dashboard/sessions')}>
          Back to Sessions
        </Button>
        
        {session.status === 'scheduled' && !isPastSession && (
          <Button>
            Join Session
          </Button>
        )}
      </div>
    </div>
  )
}