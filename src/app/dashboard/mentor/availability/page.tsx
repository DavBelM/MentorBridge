"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, parse, addMinutes, isBefore, isAfter, addHours } from "date-fns"
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react"

type AvailabilitySlot = {
  id: number
  day: string
  startTime: string
  endTime: string
  isRecurring: boolean
}

type ScheduledSession = {
  id: number
  title: string
  startTime: string
  endTime: string
  status: string
  menteeId: number
  mentee: {
    fullname: string
    profile: {
      profilePicture: string | null
    }
  }
}

interface SlotFormValues {
    day: string;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
}

const slotFormSchema = z.object({
    day: z.string({
        required_error: "Please select a day",
    }),
    startTime: z.string({
        required_error: "Please select a start time",
    }),
    endTime: z.string({
        required_error: "Please select an end time",
    }),
    isRecurring: z.boolean().default(true),
}).refine((data) => {
    if (!data.startTime || !data.endTime) return true;
    
    const start: Date = parse(data.startTime, "HH:mm", new Date());
    const end: Date = parse(data.endTime, "HH:mm", new Date());
    
    return isAfter(end, start);
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});

export default function AvailabilityPage() {
  const { toast } = useToast()
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("weekly")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // Form for creating availability slots
  const form = useForm<z.infer<typeof slotFormSchema>>({
    resolver: zodResolver(slotFormSchema),
    defaultValues: {
      day: "",
      startTime: "09:00",
      endTime: "10:00",
      isRecurring: true,
    },
  })
  
  // Fetch availability data
  useEffect(() => {
    async function fetchAvailabilityData() {
      setIsLoading(true)
      try {
        // Fetch availability slots
        const slotsResponse = await fetch("/api/availability/slots")
        if (!slotsResponse.ok) throw new Error("Failed to fetch availability slots")
        const slotsData = await slotsResponse.json()
        setAvailabilitySlots(slotsData)
        
        // Fetch scheduled sessions
        const sessionsResponse = await fetch("/api/sessions")
        if (!sessionsResponse.ok) throw new Error("Failed to fetch scheduled sessions")
        const sessionsData = await sessionsResponse.json()
        setScheduledSessions(sessionsData)
      } catch (error) {
        console.error("Error fetching availability data:", error)
        toast({
          title: "Error",
          description: "Failed to load availability data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAvailabilityData()
  }, [toast])
  
  // Create a new availability slot
  const onSubmit = async (values: z.infer<typeof slotFormSchema>) => {
    try {
      const response = await fetch("/api/availability/slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
      
      if (!response.ok) throw new Error("Failed to create availability slot")
      
      const newSlot = await response.json()
      setAvailabilitySlots([...availabilitySlots, newSlot])
      
      toast({
        title: "Success",
        description: "Availability slot created successfully",
      })
      
      // Reset form and close dialog
      form.reset()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating availability slot:", error)
      toast({
        title: "Error",
        description: "Failed to create availability slot",
        variant: "destructive",
      })
    }
  }
  
  // Delete an availability slot
  const deleteSlot = async (id: number) => {
    try {
      const response = await fetch(`/api/availability/slots/${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to delete availability slot")
      
      setAvailabilitySlots(availabilitySlots.filter(slot => slot.id !== id))
      
      toast({
        title: "Success",
        description: "Availability slot deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting availability slot:", error)
      toast({
        title: "Error",
        description: "Failed to delete availability slot",
        variant: "destructive",
      })
    }
  }
  
  // Get sessions for the selected date
  const getSessionsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    
    return scheduledSessions.filter(session => {
      const sessionDate = format(new Date(session.startTime), "yyyy-MM-dd")
      return sessionDate === dateStr
    })
  }
  
  // Day name mapping
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  
  // Time slot options
  const timeSlots: string[] = []
  const startTime = parse("00:00", "HH:mm", new Date())
  for (let i = 0; i < 48; i++) {
    const time = addMinutes(startTime, i * 30)
    timeSlots.push(format(time, "HH:mm"))
  }
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Availability Management</h1>
          <p className="text-muted-foreground mt-1">
            Set your recurring availability and view scheduled sessions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Availability
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Availability Slot</DialogTitle>
              <DialogDescription>
                Set a time slot when you're available for mentoring sessions.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dayNames.map((day, index) => (
                            <SelectItem key={index} value={day.toLowerCase()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Start time" />
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
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="End time" />
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
                </div>
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Recurring Weekly</FormLabel>
                        <FormDescription>
                          This slot will repeat every week
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save Availability</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {dayNames.map((day, index) => {
              const daySlots = availabilitySlots.filter(
                slot => slot.day.toLowerCase() === day.toLowerCase()
              )
              
              return (
                <Card key={index} className={index === new Date().getDay() ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {isLoading ? (
                      <div className="space-y-2">
                        <div className="h-14 bg-muted rounded animate-pulse" />
                        <div className="h-14 bg-muted rounded animate-pulse" />
                      </div>
                    ) : daySlots.length > 0 ? (
                      <div className="space-y-2">
                        {daySlots.map((slot) => (
                          <div key={slot.id} className="p-2 border rounded-md flex justify-between items-center">
                            <div>
                              <div className="font-medium">
                                {slot.startTime} - {slot.endTime}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {slot.isRecurring ? "Weekly" : "One-time"}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSlot(slot.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No availability set</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => {
                        form.setValue("day", day.toLowerCase())
                        setIsCreateDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Slot
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>
                  View your scheduled sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "No date selected"}
                </CardTitle>
                <CardDescription>
                  Scheduled mentoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : selectedDate ? (
                  <>
                    {getSessionsForDate(selectedDate).length > 0 ? (
                      <div className="space-y-4">
                        {getSessionsForDate(selectedDate).map((session) => (
                          <div key={session.id} className="p-4 border rounded-md flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="font-medium">{session.title}</div>
                              <div className="text-sm flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {format(new Date(session.startTime), "h:mm a")} - {format(new Date(session.endTime), "h:mm a")}
                              </div>
                              <div className="text-sm">
                                With: {session.mentee.fullname}
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${
                              session.status === "CONFIRMED" 
                                ? "bg-green-100 text-green-800" 
                                : session.status === "PENDING" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {session.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-medium text-lg mb-2">No sessions scheduled</h3>
                        <p className="text-muted-foreground">
                          You don't have any sessions scheduled for this day.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Please select a date to view scheduled sessions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}