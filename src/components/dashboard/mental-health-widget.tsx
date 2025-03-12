"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Brain, Send } from "lucide-react"

export function MentalHealthWidget() {
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content:
        "Hello! How are you feeling today? I'm here to provide motivational support and help with stress management.",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    // Add user message to chat
    const userMessage = { role: "user", content: message }
    setChatHistory([...chatHistory, userMessage])
    setMessage("")
    setIsLoading(true)

    // In a real app, this would call the AI chatbot API
    // For now, we'll simulate a response
    setTimeout(() => {
      const botResponses = [
        "Remember that challenges are opportunities for growth. What specific situation is causing you stress?",
        "You're doing great! Taking small steps each day leads to big progress over time.",
        "It's important to celebrate your achievements, no matter how small they seem.",
        "Taking breaks is essential for productivity and mental well-being. Have you taken time for yourself today?",
        "Mindfulness can help reduce stress. Try taking a few deep breaths and focusing on the present moment.",
      ]

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]
      setChatHistory((prev) => [...prev, { role: "assistant", content: randomResponse }])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          Mental Health Support
        </CardTitle>
        <CardDescription>Chat with our AI assistant for motivational support.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce delay-75"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

