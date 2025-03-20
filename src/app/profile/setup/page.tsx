"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import ProfileSetupLayout from "./layout"

const baseSchema = {
  bio: z.string().min(10, "Bio must be at least 10 characters."),
  location: z.string().min(2, "Please enter your location."),
  linkedin: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  profilePicture: z.instanceof(File).optional(),
}

const mentorSchema = z.object({
  ...baseSchema,
  experience: z.string().min(2, "Please enter your experience."),
  skills: z.string().min(2, "Please enter your skills."),
  availability: z.string().optional(),
})

const menteeSchema = z.object({
  ...baseSchema,
  interests: z.string().min(2, "Please enter at least one interest."),
  learningGoals: z.string().min(10, "Please describe your learning goals."),
})

export default function ProfileSetupPage() {
  const router = useRouter()
  const [role, setRole] = useState<"MENTOR" | "MENTEE" | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const schema = role === "MENTOR" ? mentorSchema : menteeSchema

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: "",
      location: "",
      linkedin: "",
      twitter: "",
      profilePicture: undefined,
      ...(role === "MENTOR"
        ? { experience: "", skills: "", availability: "" }
        : { interests: "", learningGoals: "" }),
    },
  })

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      form.setValue("profilePicture", file)
      setFilePreview(URL.createObjectURL(file))
    },
  })

  async function onSubmit(data: any) {
    setIsLoading(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Complete Your Profile</h1>
          <p className="text-sm text-muted-foreground">
            Help us personalize your experience by providing a few more details.
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex justify-center space-x-4">
          <Button variant={role === "MENTOR" ? "default" : "outline"} onClick={() => setRole("MENTOR")}>
            I am a Mentor
          </Button>
          <Button variant={role === "MENTEE" ? "default" : "outline"} onClick={() => setRole("MENTEE")}>
            I am a Mentee
          </Button>
        </div>

        {role && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about yourself..." {...field} />
                    </FormControl>
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
                      <Input placeholder="e.g., Nairobi, Kenya" {...field} />
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
                          <Input placeholder="e.g., JavaScript, Leadership" {...field} />
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
                          <Input placeholder="e.g., Weekdays after 5 PM" {...field} />
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
                          <Input placeholder="e.g., AI, Web Development" {...field} />
                        </FormControl>
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
                          <Textarea placeholder="What do you hope to learn?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}
