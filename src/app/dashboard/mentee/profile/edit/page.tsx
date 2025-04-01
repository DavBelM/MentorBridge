"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDropzone } from "react-dropzone"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"

// Common fields for both roles
const baseSchema = {
  bio: z.string().max(500, "Bio must be less than 500 characters.").optional(),
  location: z.string().min(2, "Please enter your location.").optional(),
  linkedin: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  twitter: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  profilePicture: z.instanceof(File).optional(),
}

// Mentor-specific fields
const mentorSchema = z.object({
  ...baseSchema,
  experience: z.string().min(2, "Please enter your experience.").optional(),
  skills: z.string().min(2, "Please enter your skills.").optional(),
  availability: z.string().min(2, "Please indicate your availability.").optional(),
});

// Mentee-specific fields
const menteeSchema = z.object({
  ...baseSchema,
  interests: z.string().optional(),
  learningGoals: z.string().optional(),
});

export default function EditProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  console.log("User object:", user);
  console.log("User role:", user?.role);

  // Determine which schema to use based on user role
  const schema = user?.role === "MENTOR" ? mentorSchema : menteeSchema
  
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: user?.profile?.bio || "",
      location: user?.profile?.location || "",
      linkedin: user?.profile?.linkedin || "",
      twitter: user?.profile?.twitter || "",
      ...(user?.role === "MENTOR" ? {
        experience: user?.profile?.experience || "",
        skills: user?.profile?.skills || "",
        availability: user?.profile?.availability || "",
      } : {
        interests: user?.profile?.interests || "",
        learningGoals: user?.profile?.learningGoals || "",
      }),
    },
  })

  // Set up file dropzone for profile picture
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        form.setValue("profilePicture", file)
        setFilePreview(URL.createObjectURL(file))
      }
    },
  })

  // Set preview if user already has a profile picture
  useEffect(() => {
    if (user?.profile?.profilePicture) {
      setFilePreview(user.profile.profilePicture)
    }
  }, [user])

  async function onSubmit(data: any) {
    setIsLoading(true)
    console.log("Form submitted with data:", data);
    console.log("Current user from context:", user);
    
    try {
      const formData = new FormData()
      
      // Append form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
          console.log(`Appending file ${key}:`, value.name);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
          console.log(`Appending field ${key}:`, value);
        }
      })
      
      console.log("Sending request to /api/profile");
      
      // Change the URL to match your API endpoint
      const response = await fetch('/api/profile', {
        method: 'PUT',
        body: formData,
      })
      
      // Log response status for debugging
      console.log("Response status:", response.status);
      
      // Get full response text for debugging
      const responseText = await response.text();
      console.log("Response body:", responseText);
      
      // Try to parse as JSON if possible
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // Not JSON or empty response
        console.log("Response is not valid JSON");
      }
      
      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to update profile');
      }
      
      toast({
        title: "Profile updated successfully",
        description: "Your profile changes have been saved.",
      })
      
      // Use the correct path for redirection
      router.push('/dashboard/mentee/profile');
    } catch (error) {
      // rest of your error handling...
    }
  }

  return (
    
      <DashboardTransition>
        <DashboardHeader
          heading="Edit Profile"
          text="Update your profile information and preferences."
        >
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </DashboardHeader>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile details visible to other users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Picture */}
                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={() => (
                    <FormItem>
                      <FormLabel>Profile Picture</FormLabel>
                      <div
                        {...getRootProps()}
                        className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <input {...getInputProps()} />
                        {filePreview ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={filePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-full mb-2"
                            />
                            <p className="text-sm text-muted-foreground">
                              Click or drag to replace
                            </p>
                          </div>
                        ) : (
                          <div className="py-4">
                            <p>Drop an image here or click to select</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              PNG, JPG or JPEG up to 5MB
                            </p>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell others about yourself..."
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description about yourself that will be visible on your profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Nairobi, Kenya" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/username" {...field} />
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
                        <FormLabel>Twitter URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Mentor-specific fields */}
                {user?.role === "MENTOR" && (
                  <>
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills & Expertise</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. React, Product Management, UX Design (comma separated)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            List your skills and areas of expertise (comma separated)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Experience</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief summary of your professional background..."
                              {...field}
                              rows={3}
                            />
                          </FormControl>
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
                            <Input 
                              placeholder="e.g. Weekday evenings, Monday: 6:00 PM - 8:00 PM" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            When are you available for mentoring sessions?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Mentee-specific fields */}
                {user?.role === "MENTEE" && (
                  <>
                    <FormField
                      control={form.control}
                      name="interests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interests</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Web Development, Data Science, Design (comma separated)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            What topics are you interested in learning about? (comma separated)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="learningGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Learning Goals</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What do you hope to achieve through mentorship?"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

{/* <div className="text-red-500 mb-4">
  <p>Form state: {form.formState.isValid ? "Valid" : "Invalid"}</p>
  {Object.keys(form.formState.errors).length > 0 && (
    <div>
      <p>Form has errors:</p>
      <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre>
    </div>
  )}
</div> */}
<Button 
  type="button"
  onClick={() => {
    console.log("Manual submit with overridden validation");
    
    // First set default values using form.setValue to update the form state
    if (!form.getValues().interests || form.getValues().interests.length < 2) {
      form.setValue("interests", "General interests");
    }
    
    if (!form.getValues().learningGoals || form.getValues().learningGoals.length < 10) {
      form.setValue("learningGoals", "Learning to improve my skills through mentorship");
    }
    
    // Get the updated values after setting defaults
    const values = form.getValues();
    console.log("Submitting with values:", values);
    console.log("Form validation errors:", form.formState.errors);
    
    // Submit with the updated values
    onSubmit(values);
  }}
  disabled={isLoading}
>
  {isLoading ? "Saving..." : "Save Changes"}
</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DashboardTransition>
   
  )
}