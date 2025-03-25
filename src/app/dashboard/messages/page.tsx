// src/app/dashboard/messages/page.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { get, post } from "@/lib/api-client"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { SendHorizontal, RefreshCw } from "lucide-react"

type Thread = {
  id: number
  contact: {
    id: number
    fullname: string
    profile: {
      profilePicture: string | null
    }
  }
  lastMessage: {
    id: number
    content: string
    senderId: number
    createdAt: string
  }
  unreadCount: number
  updatedAt: string
}

type Message = {
  id: number
  connectionId: number
  senderId: number
  content: string
  read: boolean
  createdAt: string
  sender: {
    id: number
    fullname: string
    profile: {
      profilePicture: string | null
    }
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const [threads, setThreads] = useState<Thread[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeThread, setActiveThread] = useState<number | null>(null)
  const [isLoadingThreads, setIsLoadingThreads] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const threadId = searchParams?.get('thread') ? parseInt(searchParams.get('thread') as string, 10) : null

  // Fetch message threads
  useEffect(() => {
    async function fetchThreads() {
      setIsLoadingThreads(true)
      try {
        const { threads } = await get<{ threads: Thread[] }>('/api/messages/threads')
        setThreads(threads)
        
        // If there's a thread ID in the URL, set it as active
        if (threadId && threads.some(thread => thread.id === threadId)) {
          setActiveThread(threadId)
        } else if (threads.length > 0 && !activeThread) {
          // Otherwise, select the first thread
          setActiveThread(threads[0].id)
        }
      } catch (error) {
        console.error('Error fetching threads:', error)
      } finally {
        setIsLoadingThreads(false)
      }
    }
    
    fetchThreads()
  }, [threadId])
  
  // Fetch messages for active thread
  useEffect(() => {
    async function fetchMessages() {
      if (!activeThread) return
      
      setIsLoadingMessages(true)
      try {
        const { messages } = await get<{ messages: Message[] }>(`/api/messages?connectionId=${activeThread}`)
        setMessages(messages)
        
        // Update thread read status in the UI
        setThreads(threads.map(thread => 
          thread.id === activeThread 
            ? { ...thread, unreadCount: 0 } 
            : thread
        ))
        
        // Update the URL with the active thread
        if (threadId !== activeThread) {
          router.push(`/dashboard/messages?thread=${activeThread}`)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setIsLoadingMessages(false)
      }
    }
    
    fetchMessages()
  }, [activeThread])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])
  
  // Send message
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newMessage.trim() || !activeThread) return
    
    setIsSendingMessage(true)
    try {
      const { message } = await post<{ message: Message }>('/api/messages', {
        connectionId: activeThread,
        content: newMessage.trim(),
      })
      
      // Add new message to the list
      setMessages([...messages, message])
      
      // Clear the input
      setNewMessage("")
      
      // Update the thread list
      setThreads(threads.map(thread => 
        thread.id === activeThread 
          ? { 
              ...thread, 
              lastMessage: {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                createdAt: message.createdAt,
              },
              updatedAt: message.createdAt,
            } 
          : thread
      ))
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setIsSendingMessage(false)
    }
  }
  
  // Format timestamp
  function formatTimestamp(timestamp: string) {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }
  
  // Get active contact
  const activeContact = activeThread 
    ? threads.find(thread => thread.id === activeThread)?.contact 
    : null
    
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thread list */}
        <div className="md:col-span-1">
          <Card className="h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            
            <div className="flex-1 overflow-auto">
              {isLoadingThreads ? (
                // Loading skeletons
                <div className="p-4 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : threads.length > 0 ? (
                <div>
                  {threads.map((thread) => (
                    <div key={thread.id}>
                      <button
                        className={`w-full text-left px-4 py-3 ${
                          activeThread === thread.id 
                            ? 'bg-muted' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setActiveThread(thread.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage 
                              src={thread.contact.profile?.profilePicture || ''} 
                              alt={thread.contact.fullname} 
                            />
                            <AvatarFallback>{thread.contact.fullname[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{thread.contact.fullname}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(thread.updatedAt)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-muted-foreground truncate">
                                {thread.lastMessage.senderId === user?.id ? 'You: ' : ''}
                                {thread.lastMessage.content}
                              </p>
                              
                              {thread.unreadCount > 0 && (
                                <Badge variant="default" className="ml-1">
                                  {thread.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                      <Separator />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No messages yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => router.push('/dashboard/connections')}
                  >
                    Start a conversation
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Message view */}
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)] flex flex-col">
            {activeThread && activeContact ? (
              <>
                {/* Header */}
                <CardHeader className="px-6 py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage 
                        src={activeContact.profile?.profilePicture || ''} 
                        alt={activeContact.fullname} 
                      />
                      <AvatarFallback>{activeContact.fullname[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <CardTitle className="text-lg">{activeContact.fullname}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {isLoadingMessages ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[70%] ${i % 2 === 0 ? '' : 'flex flex-col items-end'}`}>
                            <Skeleton className={`h-10 w-32 ${i % 2 === 0 ? 'rounded-l-none' : 'rounded-r-none'} mb-1`} />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length > 0 ? (
                    <div>
                      {messages.map((message) => {
                        const isOwnMessage = message.senderId === user?.id
                        
                        return (
                          <div 
                            key={message.id}
                            className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                              <div 
                                className={`p-3 rounded-lg ${
                                  isOwnMessage 
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p>{message.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTimestamp(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-muted-foreground mb-2">No messages yet</p>
                        <p className="text-sm">Send a message to start the conversation</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                {/* Message input */}
                <div className="p-4 border-t">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input 
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSendingMessage}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!newMessage.trim() || isSendingMessage}
                    >
                      {isSendingMessage ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <SendHorizontal className="h-5 w-5" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground mb-6">
                    Select a conversation from the list or start a new one
                  </p>
                  <Button onClick={() => router.push('/dashboard/connections')}>
                    View Connections
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}