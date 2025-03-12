"use client"
import { useChat } from "ai/react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Send } from "lucide-react"

export default function MentalHealthPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Mental Health Support"
        text="Chat with our AI assistant for motivational support and stress management tips."
      />

      <div className="grid gap-6">
        <Card className="h-[calc(100vh-250px)]">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center space-y-4">
                    <div className="bg-primary/10 p-4 rounded-full inline-flex">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg">Mental Health Assistant</h3>
                    <p className="text-muted-foreground max-w-md">
                      Chat with our AI assistant for motivational support, stress management tips, and self-care advice.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role !== "user" && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI Assistant" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 ml-2">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI Assistant" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce delay-75"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

