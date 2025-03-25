"use client"
import { useChat } from "ai/react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Send } from "lucide-react"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { motion } from "framer-motion"

export default function MentalHealthPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  return (
    <DashboardShell>
      <DashboardTransition>
        <DashboardHeader
          heading="Mental Health Support"
          text="Chat with our AI assistant for motivational support and stress management tips."
        />

        <div className="grid gap-6">
          <Card className="h-[calc(100vh-250px)]">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center items-center h-full"
                  >
                    <div className="text-center space-y-4">
                      <div className="bg-primary/10 p-4 rounded-full inline-flex">
                        <Brain className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium">Mental Health Assistant</h3>
                      <p className="text-muted-foreground max-w-sm">
                        Chat with our AI assistant for support with stress management, motivation, 
                        and maintaining mental wellness during your mentorship journey.
                      </p>
                    </div>
                  </motion.div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted">
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <div className="relative flex-1">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="pr-10"
                  />
                </div>
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardTransition>
    </DashboardShell>
  )
}

