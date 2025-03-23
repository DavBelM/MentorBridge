// src/app/dashboard/sessions/schedule/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { get, post } from "@/lib/api-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format, addHours } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Clock } from "lucide-react"

// Define the form schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  connectionId: z.string().min(1, "Please select a connection"),
  date: z.date({ required_error: "Please select a date" }),
  startTime: z.string().min(1, "Please select a start time"),
  duration: z.string().min(1, "Please select a duration"),
})

type Connection = {
  id: number
  mentor: {
    id: number
    fullname: string
  }
  mentee: {
    id: number
    fullname: string
  }
}

export default function ScheduleSessionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      connectionId: "",
      date: new Date(),
      startTime: "09:00",
      duration: "60",
    },
  })
  
  // Fetch connections
  useEffect(() => {
    async function fetchConnections() {
      setIsLoading(true)
      try {
        const { connections } = await get<{ connections: Connection[] }>('/api/connections?status=accepted')
        setConnections(connections)
      } catch (error) {
        console.error('Error fetching connections:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchConnections()
  }, [])
  
  const isMentor = user?.role === 'MENTOR'
  
  // Available time slots
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00"
  ]
  
  // Duration options
  const durationOptions = [
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
  ]
  
  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      const connection = connections.find(c => c.id === parseInt(values.connectionId))
      
      if (!connection) {
        throw new Error("Connection not found")
      }
      
      // Calculate start and end times
      const startTime = new Date(values.date)
      const [hours, minutes] = values.startTime.split(':')
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + parseInt(values.duration))
      
      // Create session
      type SessionResponse = {
        session: {
          id: string | number;
        }
      }
      
      const { session } = await post<SessionResponse>('/api/sessions/create', {
        mentorId: connection.mentor.id,
        menteeId: connection.mentee.id,
        title: values.title,
        description: values.description || "",
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
      
      // Redirect to session details page
      router.push(`/dashboard/sessions/${session.id}`)
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create session')
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Schedule a Session</h1>
          <p className="text-muted-foreground">
            Plan your next mentoring session
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>
              Fill in the details for your mentoring session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Connection selection */}
                <FormField
                  control={form.control}
                  name="connectionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection</FormLabel>
                      <Select 
                        disabled={isLoading || connections.length === 0} 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a connection" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {connections.map((connection) => (
                            <SelectItem 
                              key={connection.id} 
                              value={connection.id.toString()}
                            >
                              {isMentor 
                                ? `Mentee: ${connection.mentee.fullname}`
                                : `Mentor: ${connection.mentor.fullname}`
                              }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {connections.length === 0 && !isLoading && (
                        <FormDescription className="text-destructive">
                          You need to have an accepted connection to schedule a session
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Career Development Discussion" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Briefly describe the topics you want to cover in this session..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date picker */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Start time */}
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Duration */}
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {durationOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/sessions')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting || isLoading || connections.length === 0}
                  >
                    {isSubmitting ? 'Scheduling...' : 'Schedule Session'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}