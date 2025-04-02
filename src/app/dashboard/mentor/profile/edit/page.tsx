"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react" // Use this instead
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useDropzone } from "react-dropzone"
import { Upload, X } from "lucide-react"

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

type FormValues = z.infer<typeof mentorSchema>;

export default function EditMentorProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession() // Replace useAuth with useSession
  const [profileData, setProfileData] = useState(null) // To store profile data
  const [isLoading, setIsLoading] = useState(true)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      bio: "",
      location: "",
      linkedin: "",
      twitter: "",
      experience: "",
      skills: "",
      availability: "",
    },
  })

  // Fetch profile data when component mounts
  useEffect(() => {
    async function fetchProfileData() {
      if (session?.user) {
        try {
          setIsLoading(true);
          const response = await fetch("/api/profile");
          
          if (response.ok) {
            const data = await response.json();
            console.log("Profile data loaded:", data);
            
            setProfileData(data);
            
            // Set profile picture preview if it exists
            if (data?.profile?.profilePicture) {
              setFilePreview(data.profile.profilePicture);
            }
            
            // Convert skills array to string if needed
            let skillsStr = "";
            if (data?.profile?.skills) {
              skillsStr = Array.isArray(data.profile.skills) 
                ? data.profile.skills.join(", ") 
                : data.profile.skills;
            }
            
            // Add a small delay to ensure state updates first
            setTimeout(() => {
              // Reset form with existing values
              form.reset({
                bio: data?.profile?.bio || "",
                location: data?.profile?.location || "",
                linkedin: data?.profile?.linkedin || "",
                twitter: data?.profile?.twitter || "",
                experience: data?.profile?.experience || "",
                skills: skillsStr,
                availability: data?.profile?.availability || "",
              });
            }, 100);
          } else {
            toast({
              title: "Error",
              description: "Failed to load profile data", 
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    fetchProfileData();
  }, [session, toast]);

  // Set up file dropzone for profile picture
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        form.setValue("profilePicture", file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  // Clear file preview
  const handleClearFile = () => {
    form.setValue("profilePicture", undefined);
    setFilePreview(null);
  };

  // Submit form data
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("bio", data.bio || "");
      formData.append("location", data.location || "");
      formData.append("linkedin", data.linkedin || "");
      formData.append("twitter", data.twitter || "");
      formData.append("experience", data.experience || "");
      formData.append("skills", data.skills || "");
      formData.append("availability", data.availability || "");
      
      if (data.profilePicture) {
        formData.append("profilePicture", data.profilePicture);
      }
      
      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
      
      router.push("/dashboard/mentor/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a profile picture for your mentor profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {filePreview ? (
                    <div className="relative">
                      <img 
                        src={filePreview} 
                        alt="Profile preview" 
                        className="h-32 w-32 rounded-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleClearFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      {...getRootProps()} 
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary"
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop a file here, or click to select
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max file size: 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>This information will be displayed on your mentor profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about yourself..." 
                        {...field} 
                        className="min-h-32"
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description about yourself as a mentor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York, NY" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your current location.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Share your expertise and experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your professional experience..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your professional background and relevant experience.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills & Expertise</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., JavaScript, React, Node.js, Leadership" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      List your skills and areas of expertise.
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
                      <Input 
                        placeholder="e.g., Weekday evenings, Weekends" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      When you're generally available for mentoring sessions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connect your professional profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
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
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/yourhandle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push("/dashboard/mentor/profile")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}