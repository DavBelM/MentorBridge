"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { post } from '@/lib/api-client'

type ConnectionRequestButtonProps = {
  mentorId: number
  onSuccess?: () => void
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}

export function ConnectionRequestButton({
  mentorId,
  onSuccess,
  variant = 'default',
  size = 'default'
}: ConnectionRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const sendRequest = async () => {
    setIsLoading(true)
    try {
      await post('/api/connections', { mentorId })
      
      toast({
        title: "Connection request sent",
        description: "Your request has been sent to the mentor",
      })
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error sending connection request:', error)
      
      // Handle the case where connection already exists
      if (error.message?.includes('Connection already exists')) {
        toast({
          title: "Connection already exists",
          description: "You have already sent a request to this mentor",
        })
        return
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={sendRequest}
      disabled={isLoading}
    >
      {isLoading ? "Sending..." : "Connect"}
    </Button>
  )
}