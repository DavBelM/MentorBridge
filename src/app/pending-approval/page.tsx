"use client"

"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function PendingApprovalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.isApproved) {
      router.push("/dashboard/mentor")
    }
  }, [status, session, router])

  const handleSubmitForApproval = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/mentor/submit-for-approval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to submit for approval")
      }

      toast({
        title: "Success",
        description: "Your profile has been submitted for approval",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your profile for approval",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>
            Your mentor profile is currently pending approval from an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>To complete your mentor profile and get approved, please:</p>
            <ol className="list-decimal list-inside mt-2 space-y-2">
              <li>Fill out your complete profile information</li>
              <li>Add your expertise and experience</li>
              <li>Set your availability and preferences</li>
              <li>Submit your profile for review</li>
            </ol>
          </div>
          <Button
            onClick={handleSubmitForApproval}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Profile for Approval"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 