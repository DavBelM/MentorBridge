"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ConnectionRequestProps {
  mentorId: string
  mentorName: string
  onSuccess?: () => void
}

export function ConnectionRequest({
  mentorId,
  mentorName,
  onSuccess,
}: ConnectionRequestProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send connection request")
      }

      toast({
        title: "Request sent",
        description: `Your connection request has been sent to ${mentorName}`,
      })
      setMessage("")
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Message to {mentorName}
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Introduce yourself and explain why you'd like to connect..."
          className="min-h-[100px]"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Connection Request
      </Button>
    </form>
  )
} 