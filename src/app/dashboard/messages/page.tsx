"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { RefreshCcw } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { get, post } from '@/lib/api-client'

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

type PaginationInfo = {
  hasMore: boolean
  totalCount: number
  oldestMessageId: number | null
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [threads, setThreads] = useState<Thread[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeThread, setActiveThread] = useState<number | null>(null)
  const [isLoadingThreads, setIsLoadingThreads] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pagination, setPagination] = useState<PaginationInfo>({
    hasMore: false,
    totalCount: 0,
    oldestMessageId: null
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const threadId = searchParams?.get('thread') ? parseInt(searchParams.get('thread') as string, 10) : null
  
  // Refresh function
  const refreshData = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Fetch message threads
  useEffect(() => {
    async function fetchThreads() {
      setIsLoadingThreads(true)
      try {
        const response = await get<{ threads: Thread[] }>('/api/messages/threads')
        if (!response) {
          throw new Error('Failed to fetch threads')
        }
        setThreads(response.threads)
        
        // If there's a thread ID in the URL, set it as active
        if (threadId && threads.some((thread: Thread) => thread.id === threadId)) {
          setActiveThread(threadId)
        } else if (threads.length > 0 && !activeThread) {
          // Otherwise, select the first thread
          setActiveThread(threads[0].id)
        }
      } catch (error) {
        console.error('Error fetching threads:', error)
        toast({
          title: "Failed to load message threads",
          description: "Please try again later",
          variant: "destructive"
        })
      } finally {
        setIsLoadingThreads(false)
      }
    }
    
    fetchThreads()
    
    // Set up polling for threads (every 15 seconds)
    const interval = setInterval(fetchThreads, 15000)
    return () => clearInterval(interval)
  }, [threadId, refreshKey])
  
  // Fetch messages for active thread
  useEffect(() => {
    async function fetchMessages() {
      if (!activeThread) return
      
      setIsLoadingMessages(true)
      try {
        const response = await get<{ 
          messages: Message[],
          hasMore: boolean,
          totalCount: number
        }>(`/api/messages?connectionId=${activeThread}`)
        
        if (!response) {
          throw new Error('Failed to fetch messages')
        }
        
        setMessages(response.messages)
        setPagination({
          hasMore: response.hasMore,
          totalCount: response.totalCount,
          oldestMessageId: response.messages.length > 0 ? response.messages[0].id : null
        })
        
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
        toast({
          title: "Failed to load messages",
          description: "Please try again later",
          variant: "destructive"
        })
      } finally {
        setIsLoadingMessages(false)
      }
    }
    
    fetchMessages()
    
    // Set up polling for messages (every 5 seconds)
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [activeThread, refreshKey])
  
  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!activeThread || !pagination.oldestMessageId || !pagination.hasMore || isLoadingMoreMessages) return
    
    setIsLoadingMoreMessages(true)
    try {
      const response = await get<{ 
        messages: Message[],
        hasMore: boolean,
        totalCount: number
      }>(`/api/messages?connectionId=${activeThread}&before=${pagination.oldestMessageId}`)
      
      if (!response) {
        throw new Error('Failed to fetch more messages')
      }
      
      // Save scroll position
      const container = messagesContainerRef.current
      const scrollHeight = container?.scrollHeight || 0
      
      // Add older messages to the beginning
      setMessages(prev => [...response.messages, ...prev])
      setPagination({
        hasMore: response.hasMore,
        totalCount: pagination.totalCount,
        oldestMessageId: response.messages.length > 0 ? response.messages[0].id : pagination.oldestMessageId
      })
      
      // Restore scroll position to maintain current view
      if (container) {
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight
          container.scrollTop = newScrollHeight - scrollHeight
        }, 0)
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
      toast({
        title: "Failed to load more messages",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsLoadingMoreMessages(false)
    }
  }
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isLoadingMoreMessages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoadingMessages])
  
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
      setMessages(prev => [...prev, message])
      
      // Clear the input
      setNewMessage("")
      
      // Update the thread list
      setThreads(prev => prev.map(thread => 
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
              hasMessages: true
            } 
          : thread
      ))
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      })
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
            <CardHeader className="px-4 py-3 flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Conversations</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => refreshData()} 
                disabled={isLoadingThreads}
              >
                <RefreshCcw className={`h-4 w-4 ${isLoadingThreads ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            
            <div className="flex-1 overflow-auto">
              {isLoadingThreads ? (
                // Loading skeletons for threads
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border-b">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))
              ) : threads.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                threads.map(thread => (
                  <div 
                    key={thread.id}
                    className={`flex items-start gap-3 p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${activeThread === thread.id ? 'bg-muted' : ''}`}
                    onClick={() => setActiveThread(thread.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={thread.contact.profile.profilePicture || undefined} 
                        alt={thread.contact.fullname} 
                      />
                      <AvatarFallback>{thread.contact.fullname.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate">{thread.contact.fullname}</span>
                        {thread.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(thread.updatedAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          {thread.lastMessage ? thread.lastMessage.content : "No messages yet"}
                        </p>
                        {thread.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 px-1.5 text-xs">
                            {thread.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        
        {/* Message view */}
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)] flex flex-col">
            {activeThread && activeContact ? (
              <>
                <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={activeContact.profile.profilePicture || undefined} 
                        alt={activeContact.fullname} 
                      />
                      <AvatarFallback>{activeContact.fullname.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">{activeContact.fullname}</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => refreshData()} 
                    disabled={isLoadingMessages}
                  >
                    <RefreshCcw className={`h-4 w-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                  </Button>
                </CardHeader>
                
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {pagination.hasMore && (
                    <div className="text-center pb-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadMoreMessages}
                        disabled={isLoadingMoreMessages}
                      >
                        {isLoadingMoreMessages ? "Loading..." : "Load earlier messages"}
                      </Button>
                    </div>
                  )}
                  
                  {isLoadingMessages ? (
                    // Loading skeletons for messages
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] ${i % 2 === 0 ? 'bg-muted' : 'bg-primary text-primary-foreground'} rounded-lg p-3`}>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    ))
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <p className="mb-2">No messages yet</p>
                        <p className="text-sm">Start the conversation by sending a message below.</p>
                      </div>
                    </div>
                  ) : (
                    messages.map(message => {
                      const isOwnMessage = message.senderId === user?.id
                      return (
                        <div 
                          key={message.id} 
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isOwnMessage && (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage 
                                  src={message.sender.profile.profilePicture || undefined} 
                                  alt={message.sender.fullname} 
                                />
                                <AvatarFallback>{message.sender.fullname.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <div 
                                className={`${
                                  isOwnMessage 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                } rounded-lg p-3`}
                              >
                                <p className="break-words">{message.content}</p>
                              </div>
                              <p className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                {formatTimestamp(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input 
                      placeholder="Type your message..." 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      disabled={isSendingMessage}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || isSendingMessage}
                    >
                      {isSendingMessage ? "Sending..." : "Send"}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="mb-2">Select a conversation to view messages</p>
                  {threads.length === 0 && !isLoadingThreads && (
                    <p className="text-sm">No conversations available yet.</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}