// Create this file at src/components/matching/active-connection-card.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Connection {
  id: string
  mentee: {
    id: string
    name: string
    profile?: {
      bio?: string
      profilePicture?: string
      skills?: string[]
    }
  }
  status: string
}

export function ActiveConnectionCard({ connection }: { connection: Connection }) {
  const handleStartChat = () => {
    // Implement chat feature
    console.log("Start chat with:", connection.mentee.name)
  }

  const handleScheduleSession = () => {
    // Implement session scheduling
    console.log("Schedule session with:", connection.mentee.name)
  }
  
  // Function to get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={connection.mentee.profile?.profilePicture} />
            <AvatarFallback>{getInitials(connection.mentee.name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{connection.mentee.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Active Mentee</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {connection.mentee.profile?.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {connection.mentee.profile.bio}
          </p>
        )}
        
        {connection.mentee.profile?.skills && connection.mentee.profile.skills.length > 0 && (
          <div className="mt-2">
            <h4 className="font-medium text-sm mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {connection.mentee.profile.skills.slice(0, 3).map((skill, i) => (
                <Badge key={i} variant="secondary">{skill}</Badge>
              ))}
              {connection.mentee.profile.skills.length > 3 && (
                <Badge variant="outline">+{connection.mentee.profile.skills.length - 3} more</Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleStartChat}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={handleScheduleSession}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}