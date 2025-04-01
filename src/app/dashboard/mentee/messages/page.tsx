"use client"

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Send, Search, Clock } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { io, Socket } from "socket.io-client"

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
  } | null
  unreadCount: number
  updatedAt: string
  hasMessages: boolean
}

type Message = {
  id: number
  content: string
  senderId: number
  threadId: number
  createdAt: string
  pending?: boolean
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [threads, setThreads] = useState<Thread[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeThread, setActiveThread] = useState<number | null>(null)
  const [selectedContact, setSelectedContact] = useState<{id: number, name: string, avatar: string | null} | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize socket connection
  useEffect(() => {
    if (session?.user?.id) {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
        query: { userId: session.user.id },
      })
      
      setSocket(socketInstance)
      
      return () => {
        socketInstance.disconnect()
      }
    }
  }, [session])
  
  // Setup message listeners
  useEffect(() => {
    if (!socket) return
    
    // Listen for new messages
    interface MessageData {
      id: number
      content: string
      senderId: number
      threadId: number
      createdAt: string
    }

    socket.on("new_message", (data: MessageData) => {
      // If the message is for the active thread, add it to messages
      if (data.threadId === activeThread) {
        setMessages(prev => [...prev, data])
      }
      
      // Update the thread list to show new message info
      setThreads(prev => {
        return prev.map(thread => {
          if (thread.id === data.threadId) {
            return {
              ...thread,
              lastMessage: {
                id: data.id,
                content: data.content,
                senderId: data.senderId,
                createdAt: data.createdAt,
              },
              unreadCount: thread.id !== activeThread ? thread.unreadCount + 1 : 0,
              updatedAt: data.createdAt,
            }
          }
          return thread
        })
      })
      
      // Show notification for new message if not from active thread
      if (data.threadId !== activeThread && data.senderId !== session?.user?.id) {
        const sender = threads.find(t => t.id === data.threadId)?.contact.fullname
        toast({
          title: `New message from ${sender || 'your contact'}`,
          description: data.content.length > 50 ? `${data.content.substring(0, 50)}...` : data.content,
        })
      }
    })
    
    // Listen for read receipts
    socket.on("message_read", (threadId: number) => {
      if (threadId) {
      setThreads(prev => {
        return prev.map(thread => {
        if (thread.id === threadId) {
          return { ...thread, unreadCount: 0 }
        }
        return thread
        })
      })
      }
    })
    
    return () => {
      socket.off("new_message")
      socket.off("message_read")
    }
  }, [socket, activeThread, threads, session, toast])

  // Fetch threads
  useEffect(() => {
    async function fetchThreads() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/messages/threads")
        if (!response.ok) throw new Error("Failed to fetch threads")
        const data = await response.json()
        
        // Add this debugging to see the actual structure
        console.log("API response:", data)
        
        // Check if data is an array or if it has a threads property
        setThreads(Array.isArray(data) ? data : data.threads || [])
      } catch (error) {
        console.error("Error fetching threads:", error)
        toast({
          title: "Error",
          description: "Failed to load your conversations",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session?.user?.id) {
      fetchThreads()
    }
  }, [session, toast])
  
  // Check for userId in query params to open specific thread
  useEffect(() => {
    const userId = searchParams.get("userId")
    if (userId) {
      // Create or find thread for this user
      createOrFindThread(parseInt(userId))
    }
  }, [searchParams])
  
  // Fetch messages when active thread changes
  useEffect(() => {
    if (!activeThread) return
    
    async function fetchMessages() {
      try {
        const response = await fetch(`/api/messages/threads/${activeThread}`)
        if (!response.ok) throw new Error("Failed to fetch messages")
        const data = await response.json()
        setMessages(data.messages)
        
        // Mark thread as read
        if (socket) {
          socket.emit("mark_read", activeThread)
        }
        
        // Update local thread data to clear unread count
        setThreads(prev => {
          return prev.map(thread => {
            if (thread.id === activeThread) {
              return { ...thread, unreadCount: 0 }
            }
            return thread
          })
        })
        
        // Set selected contact info
        const thread = threads.find(t => t.id === activeThread)
        if (thread) {
          setSelectedContact({
            id: thread.contact.id,
            name: thread.contact.fullname,
            avatar: thread.contact.profile.profilePicture
          })
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }
    
    fetchMessages()
  }, [activeThread, socket])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  
  // Create or find thread when user clicks on a contact
  const createOrFindThread = async (userId: number) => {
    try {
      const response = await fetch("/api/messages/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: userId }),
      })
      
      if (!response.ok) throw new Error("Failed to create thread")
      
      const thread = await response.json()
      
      // Check if thread already exists in our list
      const existingThread = threads.find(t => t.id === thread.id)
      if (!existingThread) {
        setThreads(prev => [thread, ...prev])
      }
      
      // Set active thread
      setActiveThread(thread.id)
    } catch (error) {
      console.error("Error creating thread:", error)
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      })
    }
  }
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeThread || !socket) return
    
    try {
      // Optimistically add message to UI
      const optimisticId = Date.now()
      const optimisticMessage = {
        id: optimisticId,
        content: newMessage,
        senderId: session?.user?.id || 0,
        threadId: activeThread,
        createdAt: new Date().toISOString(),
        pending: true
      }
      
      setMessages(prev => [...prev, optimisticMessage])
      setNewMessage("")
      
      // Emit message through socket
      socket.emit("send_message", {
        content: newMessage,
        threadId: activeThread,
        receiverId: selectedContact?.id
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }
  
  const handleThreadSelect = (threadId: number) => {
    setActiveThread(threadId)
  }
  
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "h:mm a")
  }
  
  const filteredThreads = threads.filter(thread => 
    thread.contact.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Thread list */}
        <Card className="col-span-1 overflow-hidden flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle>Conversations</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[160px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations found
              </div>
            ) : (
              <div>
                {filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`flex items-center p-4 hover:bg-accent cursor-pointer ${
                      activeThread === thread.id ? "bg-accent" : ""
                    }`}
                    onClick={() => handleThreadSelect(thread.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={thread.contact.profile.profilePicture || ""} alt={thread.contact.fullname} />
                        <AvatarFallback>{thread.contact.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {thread.unreadCount > 0 && (
                        <Badge 
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                          variant="destructive"
                        >
                          {thread.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="ml-4 flex-1 overflow-hidden">
                      <div className="flex justify-between">
                        <h3 className="font-medium truncate">{thread.contact.fullname}</h3>
                        {thread.lastMessage?.createdAt && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(thread.lastMessage.createdAt), "MMM d")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {thread.lastMessage ? thread.lastMessage.content : "No messages yet"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Message area */}
        <Card className="col-span-2 flex flex-col overflow-hidden">
          {!activeThread ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <h3 className="font-medium mb-2">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">
                Choose a contact from the list to start chatting
              </p>
            </div>
          ) : (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-2">
                    <AvatarImage src={selectedContact?.avatar || ""} alt={selectedContact?.name || "Contact"} />
                    <AvatarFallback>{selectedContact?.name?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
                  </Avatar>
                  <CardTitle>{selectedContact?.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-sm text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = message.senderId === session?.user?.id
                    return (
                      <div 
                        key={message.id} 
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            isCurrentUser 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          }`}
                        >
                          <p>{message.content}</p>
                          <div 
                            className={`text-xs mt-1 flex items-center ${
                              isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {message.pending ? (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Sending...
                              </span>
                            ) : (
                              formatMessageTime(message.createdAt)
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <CardFooter className="p-3 border-t">
                <form 
                  className="flex w-full items-center space-x-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                >
                  <Input 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}