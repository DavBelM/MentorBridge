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
import { Search } from "lucide-react"

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
  const [socket, setSocket] = useState<Socket | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user?.id) return

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
      query: {
        userId: session.user.id
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [session])
  
  // Setup message listeners
  useEffect(() => {
    if (!socket || !activeThread || !session?.user?.id) return

    const handleNewMessage = (message: Message) => {
      // Only add message if it belongs to active thread
      if (message.threadId === activeThread) {
        setMessages(prev => [...prev, message])
      }
      
      // Update threads list to reflect the new message
      setThreads(prev => prev.map(thread => {
        if (thread.id === message.threadId) {
          return {
            ...thread,
            lastMessage: {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              createdAt: message.createdAt
            },
            unreadCount: thread.id !== activeThread && message.senderId !== Number(session.user?.id) 
              ? thread.unreadCount + 1 
              : thread.unreadCount,
            updatedAt: message.createdAt
          }
        }
        return thread
      }))
    }

    socket.on('newMessage', handleNewMessage)
    
    // Join thread room
    socket.emit('joinThread', activeThread)

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.emit('leaveThread', activeThread)
    }
  }, [socket, activeThread, threads, session])

  // Fetch threads
  useEffect(() => {
    async function fetchThreads() {
      if (!session?.user?.id) return
      
      try {
        setIsLoading(true)
        const response = await fetch('/api/messages/threads')
        
        if (!response.ok) {
          throw new Error('Failed to fetch message threads')
        }
        
        const data = await response.json()
        setThreads(data)
      } catch (error) {
        console.error('Error fetching message threads:', error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchThreads()
  }, [session, toast])
  
  // Check for menteeId in query params to open specific thread
  useEffect(() => {
    const menteeId = searchParams.get('menteeId')
    if (menteeId && !activeThread) {
      createOrFindThread(Number(menteeId))
    }
  }, [searchParams])
  
  // Fetch messages when active thread changes
  useEffect(() => {
    async function fetchMessages() {
      if (!activeThread) return
      
      try {
        const response = await fetch(`/api/messages/threads/${activeThread}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages')
        }
        
        const data = await response.json()
        setMessages(data)
        
        // Mark thread as read
        if (socket) {
          socket.emit('markThreadAsRead', activeThread)
          
          // Update local threads data
          setThreads(prev => prev.map(thread => 
            thread.id === activeThread 
              ? {...thread, unreadCount: 0} 
              : thread
          ))
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive",
        })
      }
    }
    
    fetchMessages()
  }, [activeThread, socket])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Create or find thread when user clicks on a mentee
  const createOrFindThread = async (menteeId: number) => {
    try {
      const response = await fetch('/api/messages/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menteeId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create conversation thread')
      }
      
      const data = await response.json()
      
      // Check if thread already exists in our list
      const threadExists = threads.find(t => t.id === data.id)
      
      if (!threadExists) {
        setThreads(prev => [data, ...prev])
      }
      
      setActiveThread(data.id)
      setSelectedContact({
        id: data.contact.id,
        name: data.contact.fullname,
        avatar: data.contact.profile?.profilePicture || null
      })
    } catch (error) {
      console.error('Error creating thread:', error)
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      })
    }
  }
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeThread || !socket) return
    
    const tempId = Date.now()
    const pendingMessage = {
      id: tempId,
      content: newMessage,
      senderId: Number(session?.user?.id),
      threadId: activeThread,
      createdAt: new Date().toISOString(),
      pending: true
    }
    
    // Add to UI immediately
    setMessages(prev => [...prev, pendingMessage])
    setNewMessage("")
    
    try {
      // Send via socket
      socket.emit('sendMessage', {
        content: newMessage,
        threadId: activeThread
      })
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Show error and mark message as failed
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
      
      setMessages(prev => prev.map(message => 
        message.id === tempId
          ? { ...message, content: message.content + ' (Failed to send)' }
          : message
      ))
    }
  }
  
  const handleThreadSelect = (threadId: number) => {
    const thread = threads.find(t => t.id === threadId)
    if (!thread) return
    
    setActiveThread(threadId)
    setSelectedContact({
      id: thread.contact.id,
      name: thread.contact.fullname,
      avatar: thread.contact.profile?.profilePicture || null
    })
  }
  
  // Filter threads based on search query
  const filteredThreads = threads.filter(thread => 
    thread.contact.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Threads List */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search mentees..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredThreads.length > 0 ? (
              <div>
                {filteredThreads.map((thread) => (
                  <div 
                    key={thread.id}
                    className={`flex items-center p-4 cursor-pointer hover:bg-muted/50 ${
                      activeThread === thread.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleThreadSelect(thread.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={thread.contact.profile?.profilePicture || ""} />
                      <AvatarFallback>{thread.contact.fullname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-sm">{thread.contact.fullname}</h3>
                        {thread.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(thread.lastMessage.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {thread.lastMessage ? thread.lastMessage.content : 'Start a conversation'}
                        </p>
                        {thread.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No conversation threads found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start a conversation with a mentee from your connections
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Messages */}
        <div className="md:col-span-2 border rounded-lg flex flex-col h-full">
          {activeThread && selectedContact ? (
            <>
              <div className="p-4 border-b flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedContact.avatar || ""} />
                  <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="ml-2 font-medium">{selectedContact.name}</h2>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isMine = message.senderId === Number(session?.user?.id)
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          isMine 
                            ? 'bg-primary text-primary-foreground ml-12' 
                            : 'bg-muted mr-12'
                        } ${message.pending ? 'opacity-70' : ''}`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-right mt-1 opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>Send</Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="w-[90%] max-w-md">
                <CardHeader>
                  <h3 className="text-lg font-medium">Your Messages</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center mb-4">
                    Select a conversation to start messaging or initiate a new conversation from your mentees list.
                  </p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => router.push('/dashboard/mentor/mentees')}
                  >
                    View My Mentees
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}