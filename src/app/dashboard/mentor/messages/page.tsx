"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { io, Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Send, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

export default function MentorMessagesPage() {
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  
  // Get active thread from URL
  useEffect(() => {
    const threadIdParam = searchParams.get("threadId")
    if (threadIdParam) {
      setActiveThread(parseInt(threadIdParam))
    }
  }, [searchParams])
  
  // Check for menteeId parameter (add this code after the threadId useEffect)
  useEffect(() => {
    const menteeIdParam = searchParams.get("menteeId")
    
    if (menteeIdParam && session?.user?.id) {
      async function findOrCreateThread() {
        try {
          setIsLoading(true)
          const response = await fetch('/api/messages/threads/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menteeId: menteeIdParam }),
          })
          
          if (!response.ok) throw new Error('Failed to find or create thread')
          
          const data = await response.json()
          if (data.threadId) {
            setActiveThread(data.threadId)
            
            // Update URL to use threadId parameter
            router.push(`/dashboard/mentor/messages?threadId=${data.threadId}`, { scroll: false })
            
            // Refresh threads to make sure this thread appears
            const threadsResponse = await fetch("/api/messages/threads")
            if (threadsResponse.ok) {
              const threadsData = await threadsResponse.json()
              setThreads(Array.isArray(threadsData) ? threadsData : [])
              
              // Find the thread to get contact info
              const thread = threadsData.find((t: Thread) => t.id === data.threadId)
              if (thread) {
                setSelectedContact({
                  id: thread.contact.id,
                  name: thread.contact.fullname,
                  avatar: thread.contact.profile?.profilePicture || null
                })
              }
            }
          }
        } catch (error) {
          console.error('Error finding or creating thread:', error)
          toast({
            title: 'Error',
            description: 'Could not start conversation with this mentee',
            variant: 'destructive',
          })
        } finally {
          setIsLoading(false)
        }
      }
      
      findOrCreateThread()
    }
  }, [searchParams, session, router, toast])
  
  // Fetch threads
  useEffect(() => {
    async function fetchThreads() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/messages/threads")
        if (!response.ok) throw new Error("Failed to fetch threads")
        
        const data = await response.json()
        
        // Ensure threads is always an array
        const threadsArray = Array.isArray(data) ? data : [];
        setThreads(threadsArray)
        
        // If there's a thread ID in the URL, set it as active
        const threadIdParam = searchParams.get("threadId")
        if (threadIdParam) {
          const threadId = parseInt(threadIdParam)
          setActiveThread(threadId)
          
          // Find the thread to get contact info
          const thread = threadsArray.find((t: Thread) => t.id === threadId)
          if (thread) {
            setSelectedContact({
              id: thread.contact.id,
              name: thread.contact.fullname,
              avatar: thread.contact.profile?.profilePicture || null
            })
          }
        }
      } catch (error) {
        console.error("Error fetching threads:", error)
        toast({
          title: "Error",
          description: "Failed to load message threads",
          variant: "destructive",
        })
        // Set to empty array on error
        setThreads([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchThreads()
  }, [searchParams, toast])
  
  // Fetch messages for active thread
  useEffect(() => {
    if (!activeThread) return
    
    async function fetchMessages() {
      try {
        const response = await fetch(`/api/messages/threads/${activeThread}`)
        if (!response.ok) throw new Error("Failed to fetch messages")
        
        const data = await response.json()
        setMessages(Array.isArray(data) ? data : [])
        
        // Mark thread as read
        if (activeThread !== null) {
          markThreadAsRead(activeThread)
        }
        
        // Update thread unread count in the thread list
        setThreads(prevThreads => 
          prevThreads.map(thread => 
            thread.id === activeThread 
              ? { ...thread, unreadCount: 0 } 
              : thread
          )
        )
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
        setMessages([])
      }
    }
    
    fetchMessages()
  }, [activeThread, toast])
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])
  
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
    socket.on("new_message", (data: Message) => {
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
  }, [socket, activeThread, threads])
  
  // Filter threads based on search
  const filteredThreads = Array.isArray(threads) 
    ? threads.filter(thread => 
        thread.contact.fullname.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  // Mark thread as read
  async function markThreadAsRead(threadId: number) {
    if(socket) {
      socket.emit("mark_thread_as_read", threadId)
    }
    try {
      await fetch(`/api/messages/threads/${threadId}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    }
    catch (error) {
      console.error("Error marking thread as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark thread as read",
        variant: "destructive",
      })
    }
  }
  
  // Select a thread
  function selectThread(thread: Thread) {
    setActiveThread(thread.id)
    setSelectedContact({
      id: thread.contact.id,
      name: thread.contact.fullname,
      avatar: thread.contact.profile?.profilePicture || null
    })
    
    // Update URL to include thread ID
    router.push(`/dashboard/mentor/messages?threadId=${thread.id}`, { scroll: false })
  }
  
  // Send a message
  // Replace the HTTP sendMessage with this socket version
async function sendMessage(e: React.FormEvent) {
  e.preventDefault()
  if (!newMessage.trim() || !activeThread || !socket) return
  
  // Optimistically add message to the UI
  const tempId = Date.now()
  const tempMessage: Message = {
    id: tempId,
    content: newMessage,
    senderId: session?.user?.id ? Number(session.user.id) : 0,
    threadId: activeThread,
    createdAt: new Date().toISOString(),
    pending: true
  }
  
  setMessages(prev => [...prev, tempMessage])
  setNewMessage("")
  
  try {
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
      variant: "destructive",
    })
    
    // Remove the pending message
    setMessages(messages => messages.filter(msg => msg.id !== tempId))
  }
}
  
  // Format time for display
  function formatMessageTime(dateString: string) {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }
  
  // Get initials for avatar fallback
  function getInitials(name: string) {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
  }
  
  // Return component JSX here
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Thread list */}
        <Card className="col-span-1 md:col-span-1">
          <CardHeader className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              // Loading state for thread list
              <div className="space-y-2 p-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 p-2">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="space-y-1 flex-1">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredThreads.length > 0 ? (
              <div className="h-[calc(100vh-280px)] overflow-y-auto">
                {filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`flex items-start p-3 gap-3 cursor-pointer hover:bg-muted transition-colors ${
                      thread.id === activeThread ? "bg-muted" : ""
                    }`}
                    onClick={() => selectThread(thread)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={thread.contact.profile?.profilePicture || undefined} />
                      <AvatarFallback>
                        {getInitials(thread.contact.fullname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">{thread.contact.fullname}</p>
                        {thread.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {thread.lastMessage ? thread.lastMessage.content : "No messages yet"}
                      </p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No conversations yet</p>
                <p className="text-xs text-muted-foreground">
                  When mentees connect with you, your conversations will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Message area */}
        <Card className="col-span-1 md:col-span-2 flex flex-col">
          {activeThread && selectedContact ? (
            <>
              {/* Message content here */}
              <CardHeader className="px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedContact.avatar || undefined} />
                    <AvatarFallback>{getInitials(selectedContact.name)}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isSentByMe = message.senderId === (session?.user?.id ? Number(session.user.id) : undefined)
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            isSentByMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          } ${message.pending ? "opacity-70" : ""}`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isSentByMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                            {formatMessageTime(message.createdAt)}
                            {message.pending && " (Sending...)"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              
              <div className="p-3 border-t">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${selectedContact.name}...`}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        if (newMessage.trim()) {
                          sendMessage(e)
                        }
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="max-w-sm text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">Select a conversation</h3>
                <p className="text-muted-foreground mb-6">
                  Choose a mentee from the list to view your conversation history
                </p>
                <Button variant="outline" onClick={() => router.push("/dashboard/mentor/mentees")}>
                  View My Mentees
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}