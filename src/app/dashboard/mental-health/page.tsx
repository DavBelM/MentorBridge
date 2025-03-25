"use client"

import { useChat } from "ai/react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Send } from "lucide-react"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import ReactMarkdown from 'react-markdown'

export default function MentalHealthPage() {
  const { messages: rawMessages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [displayMessages, setDisplayMessages] = useState<typeof rawMessages>([])
  
  // Process messages to remove SSE formatting
  useEffect(() => {
    if (rawMessages && rawMessages.length > 0) {
      const processedMessages = rawMessages.map(msg => {
        // Check if content contains SSE format data
        if (typeof msg.content === 'string' && msg.content.startsWith('data:')) {
          // Extract just the content from the last SSE chunk
          const parts = msg.content.split('data:');
          const lastPart = parts[parts.length - 2]; // Last data chunk before [DONE]
          
          if (lastPart) {
            try {
              const parsed = JSON.parse(lastPart.trim());
              return {
                ...msg,
                content: parsed.content || msg.content
              };
            } catch (e) {
              return msg;
            }
          }
        }
        return msg;
      });
      
      setDisplayMessages(processedMessages);
    } else {
      setDisplayMessages(rawMessages);
    }
  }, [rawMessages]);

  return (
      <DashboardTransition>
        <DashboardHeader
          heading="Mental Health Support"
          text="Chat with our AI assistant for motivational support and stress management tips."
        />

        <div className="grid gap-6">
          <Card className="h-[calc(100vh-250px)]">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {displayMessages.length === 0 && (
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
                      <p className="text-sm text-muted-foreground">Ask me anything about managing stress, anxiety, or building healthy habits.</p>
                    </div>
                  </motion.div>
                )}

                {displayMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {message.role === 'user' ? (
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <div className="text-sm markdown-content">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <Input 
                  value={input} 
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardTransition>
  )
}