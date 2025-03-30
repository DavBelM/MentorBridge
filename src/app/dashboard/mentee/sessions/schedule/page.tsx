"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format, addMinutes, setHours, setMinutes, parse } from "date-fns"
import { CalendarIcon, Clock, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Time slots available for booking
const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", 
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", 
  "18:00", "18:30", "19:00", "19:30",
];

// Duration options
const durationOptions = [
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "1 hour 30 minutes", value: 90 },
  { label: "2 hours", value: 120 },
];

// Location types
const locationTypes = [
  { 
    id: "virtual", 
    name: "Virtual Meeting", 
    description: "Meet online via video call" 
  },
  { 
    id: "in-person", 
    name: "In-Person", 
    description: "Meet face-to-face at a physical location" 
  },
];

// Virtual platforms
const virtualPlatforms = [
  { id: "zoom", name: "Zoom" },
  { id: "google-meet", name: "Google Meet" },
  { id: "microsoft-teams", name: "Microsoft Teams" },
  { id: "other", name: "Other" },
];

// Form schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string({
    required_error: "Please select a start time",
  }),
  duration: z.number({
    required_error: "Please select a duration",
  }),
  description: z.string().optional(),
  locationType: z.string({
    required_error: "Please select a location type",
  }),
  virtualPlatform: z.string().optional(),
  virtualLink: z.string().optional(),
  physicalLocation: z.string().optional(),
  mentorId: z.number({
    required_error: "Please select a mentor",
  }),
});

type Mentor = {
  id: number
  fullname: string
  profile: {
    profilePicture: string | null
    bio: string | null
    skills: string | null
  }
}

export default function ScheduleSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 60,
      locationType: "virtual",
      virtualPlatform: "zoom",
    },
  })
  
  // Effect to fetch available mentors
  useEffect(() => {
    async function fetchMentors() {
      try {
        const response = await fetch("/api/connections/mentors")
        if (!response.ok) throw new Error("Failed to fetch mentors")
        const data = await response.json()
        setMentors(data)
        
        // Check for mentorId in query params
        const mentorId = searchParams.get("mentorId")
        if (mentorId) {
          const mentor = data.find((m: Mentor) => m.id === parseInt(mentorId))
          if (mentor) {
            setSelectedMentor(mentor)
            form.setValue("mentorId", mentor.id)
          }
        }
      } catch (error) {
        console.error("Error fetching mentors:", error)
        toast({
          title: "Error",
          description: "Failed to load your mentors",
          variant: "destructive"
        })
      }
    }
    
    if (session?.user?.id) {
      fetchMentors()
    }
  }, [session, searchParams, form, toast])
  
  // Watch form values for conditional fields
  const locationType = form.watch("locationType")
  const mentorId = form.watch("mentorId")
  
  // Handle mentor selection
  useEffect(() => {
    if (mentorId) {
      const mentor = mentors.find(m => m.id === mentorId)
      setSelectedMentor(mentor || null)
    }
  }, [mentorId, mentors])
  
  // Show/hide virtual platform fields
  useEffect(() => {
    if (locationType === "virtual") {
      form.register("virtualPlatform")
      form.register("virtualLink")
    } else {
      form.register("physicalLocation")
    }
  }, [locationType, form])
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    
    // Calculate end time based on start time and duration
    const startDateTime = new Date(values.date)
    const [hours, minutes] = values.startTime.split(":").map(Number)
    startDateTime.setHours(hours, minutes, 0, 0)
    
    const endDateTime = addMinutes(startDateTime, values.duration)
    
    // Prepare location based on type
    let location = ""
    if (values.locationType === "virtual") {
      if (values.virtualPlatform === "other") {
        location = values.virtualLink || ""
      } else {
        location = `${values.virtualPlatform} (${values.virtualLink || "Link to be provided"})`
      }
    } else {
      location = values.physicalLocation || ""
    }
    
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          mentorId: values.mentorId,
          location,
        }),
      })
      
      if (!response.ok) throw new Error("Failed to create session")
      
      toast({
        title: "Success",
        description: "Session scheduled successfully",
      })
      
      router.push("/dashboard/mentee/sessions")
    } catch (error) {
      console.error("Error scheduling session:", error)
      toast({
        title: "Error",
        description: "Failed to schedule session. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push("/dashboard/mentee/sessions")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Schedule a Session</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Mentor Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select a Mentor</CardTitle>
              <CardDescription>Choose which mentor you want to schedule a session with</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="mentorId"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mentor" />
                      </SelectTrigger>
                      <SelectContent>
                        {mentors.map((mentor) => (
                          <SelectItem key={mentor.id} value={mentor.id.toString()}>
                            {mentor.fullname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedMentor && (
                <div className="mt-4 p-4 rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedMentor.profile?.profilePicture || ""} alt={selectedMentor.fullname} />
                      <AvatarFallback>{selectedMentor.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedMentor.fullname}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {selectedMentor.profile?.bio || "No bio available"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Provide information about your session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Career Guidance Discussion" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your session a clear, descriptive title
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What do you want to discuss in this session?" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about what you'd like to cover
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Date and Time */}
          <Card>
            <CardHeader>
              <CardTitle>Date and Time</CardTitle>
              <CardDescription>When would you like the session to take place?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
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
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
              </div>
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("date") && form.watch("startTime") && form.watch("duration") && (
                <div className="p-3 rounded-md bg-muted flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    Session will end at{" "}
                    {format(
                      addMinutes(
                        setMinutes(
                          setHours(
                            new Date(form.watch("date")),
                            parseInt(form.watch("startTime").split(":")[0])
                          ),
                          parseInt(form.watch("startTime").split(":")[1])
                        ),
                        form.watch("duration")
                      ),
                      "h:mm a"
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where will this session take place?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="locationType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Session Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {locationTypes.map((type) => (
                          <FormItem className="flex items-center space-x-3 space-y-0" key={type.id}>
                            <FormControl>
                              <RadioGroupItem value={type.id} />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              <div className="font-medium">{type.name}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              {locationType === "virtual" ? (
                <>
                  <FormField
                    control={form.control}
                    name="virtualPlatform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {virtualPlatforms.map((platform) => (
                              <SelectItem key={platform.id} value={platform.id}>
                                {platform.name}
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
                    name="virtualLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Link (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. https://zoom.us/j/123456789" {...field} />
                        </FormControl>
                        <FormDescription>
                          You can add this now or later
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="physicalLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Coffee Shop, 123 Main St" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a specific address or meeting place
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/dashboard/mentee/sessions")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Session"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}