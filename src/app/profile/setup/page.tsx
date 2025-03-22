"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, UploadCloud } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { post } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

// Schema definition based on your Prisma model
const baseSchema = {
  bio: z.string().min(10, "Bio must be at least 10 characters.").max(500, "Bio must be less than 500 characters."),
  location: z.string().min(2, "Please enter your location."),
  linkedin: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  twitter: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  profilePicture: z.instanceof(File).optional(),
}

const mentorSchema = z.object({
  ...baseSchema,
  experience: z.string().min(2, "Please enter your experience."),
  skills: z.string().min(2, "Please enter your skills."),
  availability: z.string().min(2, "Please indicate your availability."),
})

const menteeSchema = z.object({
  ...baseSchema,
  interests: z.string().min(2, "Please enter at least one interest."),
  learningGoals: z.string().min(10, "Please describe your learning goals."),
})

export default function ProfileSetupPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])
  
  // Use user's role from auth context if available
  const [role, setRole] = useState<string>(user?.role?.toUpperCase() || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  
  type ProfileFormValues = z.infer<typeof mentorSchema> | z.infer<typeof menteeSchema>
  
  // Choose the schema based on role
  const schema = role === "MENTOR" ? mentorSchema : menteeSchema
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      bio: "",
      location: "",
      linkedin: "",
      twitter: "",
      ...(role === "MENTOR"
        ? { experience: "", skills: "", availability: "" }
        : { interests: "", learningGoals: "" }),
    } as ProfileFormValues,
  })

  // Set up the file dropzone for profile picture
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxSize: 5 * 1024 * 1024, // 5 MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        form.setValue("profilePicture", file)
        setFilePreview(URL.createObjectURL(file))
      }
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      
      // Append all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })
      
      // No need to append userId - the API will get it from the token
      
      // Log the form data for debugging
      console.log("Submitting form data with fields:", Object.fromEntries(formData.entries()));

      // Call the API to save profile using the updated post function
      const result = await post('/api/profile', formData);
      console.log("Profile created:", result);
      
      toast({
        title: "Profile created successfully!",
        description: "You're all set to start using MentorBridge.",
        variant: "default",
      })

      // Role-based redirection
      if (role === "MENTOR") {
        router.push("/dashboard/mentor");
      } else {
        router.push("/dashboard/mentee");
      }
    } catch (error) {
      console.error('Error creating profile:', error)
      toast({
        title: "Failed to save profile",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Help us personalize your experience by sharing a bit about yourself
          </p>
        </div>

        <Card className="w-full shadow-lg border-border/60">
          <CardContent className="p-6 md:p-8">
            {!role ? (
              <div className="flex flex-col items-center space-y-8 py-6">
                <h2 className="text-xl font-semibold text-center">I want to join as:</h2>
                
                {/* Role selection buttons with improved responsive design */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                  <Button 
                    variant="outline" 
                    className={`px-8 py-16 border-2 shadow-sm hover:shadow-md transition-all ${role === "MENTOR" ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => setRole("MENTOR")}
                >
                  <div className="flex flex-col items-center text-center space-y-3 w-full">
                    <span className="text-xl font-bold">Mentor</span>
                    <span className="text-sm text-muted-foreground text-center">
                      Share your knowledge and <br/> <span>guide others on their journey</span>
                    </span>
                  </div>
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline" 
                  className={`px-8 py-16 border-2 shadow-sm hover:shadow-md transition-all ${
                    role === "MENTEE" ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setRole("MENTEE")}
                >
                  <div className="flex flex-col items-center text-center space-y-3 w-full">
                    <span className="text-xl font-bold">Mentee</span>
                    <span className="text-sm text-muted-foreground text-center">
                      Connect with mentors and <br/> <span>develop your skills and career</span>
                    </span>
                  </div>
                </Button>
              </div>
              {role && (
                <Button
                  onClick={() => form.reset()}
                  className="mt-4 px-8"
                  size="lg"
                >
                  Continue as {role.toLowerCase()}
                </Button>
              )}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col items-center mb-8">
                <div 
                  {...getRootProps()} 
                  className={`
                    cursor-pointer border-2 border-dashed rounded-full p-2
                    flex items-center justify-center hover:border-primary transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-input'}
                    hover:shadow-lg
                  `}
                >
                  <input {...getInputProps()} />
                  <Avatar className="h-36 w-36">
                    {filePreview ? (
                      <AvatarImage src={filePreview} alt="Profile picture" />
                    ) : (
                      <AvatarFallback className="bg-muted flex flex-col items-center justify-center">
                        <UploadCloud className="h-12 w-12 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Upload image</span>
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <FormDescription className="mt-3 text-center">
                  Click or drag and drop to upload your profile picture
                </FormDescription>
              </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about yourself, your background, and what motivates you..." 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Nairobi, Kenya" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/your-profile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter/X (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/yourusername" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {role === "MENTOR" && (
                    <>
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 5 years in Software Development" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., JavaScript, Leadership, Public Speaking" {...field} />
                            </FormControl>
                            <FormDescription>
                              Separate multiple skills with commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="availability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Availability</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Weekday evenings, Weekends" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  {role === "MENTEE" && (
                    <>
                      <FormField
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interests</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., AI, Web Development, Career Growth" {...field} />
                            </FormControl>
                            <FormDescription>
                              Separate multiple interests with commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="learningGoals"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Learning Goals</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="What do you hope to learn or achieve through mentorship?" 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-end gap-4 pt-8 mt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setRole("")}
                    className="w-full sm:w-auto"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  )
}