"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, Send, RefreshCw, Info } from "lucide-react"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useRef, useCallback } from "react"
import ReactMarkdown from 'react-markdown'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'

export default function MentalHealthPage() {
  const [messages, setMessages] = useState<{id: string, role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // State variables for typing animation
  const [typingMessage, setTypingMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [fullResponse, setFullResponse] = useState("");
  const typingSpeed = 8; // milliseconds per character (faster)

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingMessage]);

  // Focus input field on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Load chat history when component mounts
  useEffect(() => {
    const savedMessages = localStorage.getItem('mental-health-chat');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (e) {
        console.error('Failed to parse saved messages', e);
      }
    }
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('mental-health-chat', JSON.stringify(messages));
    }
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message to the list
    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and set loading
    setInput("");
    setIsLoading(true);
    
    try {
      // Send the request to the API
      const response = await fetch('/api/mental-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      // Store the full response but don't show it yet
      setFullResponse(data.content);
      setTypingMessage(""); // Start with empty typing message
      setIsTyping(true);
      
    } catch (error) {
      console.error('Error getting response:', error);
      // Add error message
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process your request right now. Please try again in a moment."
      }]);
      setIsLoading(false);
    }
  };

  // Effect to handle the typing animation
  useEffect(() => {
    if (!isTyping || !fullResponse) return;
    
    // If we've shown the full message, finish up
    if (typingMessage === fullResponse) {
      // Animation complete, add the full message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: fullResponse
      }]);
      setIsTyping(false);
      setIsLoading(false);
      return;
    }
    
    // Otherwise, show the next character
    const timeout = setTimeout(() => {
      setTypingMessage(fullResponse.substring(0, typingMessage.length + 1));
    }, typingSpeed);
    
    return () => clearTimeout(timeout);
  }, [typingMessage, fullResponse, isTyping]);

  // Reset conversation
  const handleReset = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('mental-health-chat');
    setIsLoading(false);
    setIsTyping(false);
    setTypingMessage("");
    setFullResponse("");
    inputRef.current?.focus();
  }, []);

  return (
    <DashboardTransition>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <DashboardHeader
          heading="Mental Health Support"
          text="Chat with our AI assistant for motivational support and stress management tips."
        />
        
        <div className="flex items-center justify-between px-3 sm:px-4 py-2">
          <div className="text-xs text-muted-foreground">
            {messages.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Conversation in progress</span>
              </div>
            )}
          </div>
          
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 px-3"
              onClick={handleReset}
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              New conversation
            </Button>
          )}
        </div>

        <div className="flex-1 grid relative overflow-hidden">
          <Card className="border-0 shadow-sm flex flex-col h-full">
            {/* Message history */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-6">
                <AnimatePresence>
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="h-full flex flex-col items-center justify-center text-center px-4 py-10"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Brain className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2">Mental Health Assistant</h2>
                      <p className="text-muted-foreground max-w-md mb-6">
                        I'm here to listen and support you. Ask me about stress management, anxiety, mood improvement, or healthy habits.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                        {[
                          "How can I manage stress during exams?", 
                          "What are some quick anxiety relief techniques?",
                          "How can I improve my sleep quality?",
                          "What are good habits for mental wellbeing?"
                        ].map((question) => (
                          <Button 
                            key={question} 
                            variant="outline" 
                            className="justify-start h-auto py-2 px-3 text-left text-sm whitespace-normal"
                            onClick={() => {
                              setInput(question);
                              inputRef.current?.focus();
                            }}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 max-w-[85%] sm:max-w-[75%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/70'
                      } shadow-sm`}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm break-words">{message.content}</p>
                      ) : (
                        <div className="text-sm markdown-content prose prose-sm dark:prose-invert prose-headings:font-medium prose-headings:text-primary prose-h2:text-base prose-h3:text-sm prose-p:my-1.5 prose-ul:my-1.5 prose-ul:pl-4 prose-li:my-0.5 prose-strong:text-primary/90 prose-strong:font-semibold">
                          <ReactMarkdown
                            components={{
                              code: ({ node, inline, className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const { style: _, ...rest } = props;
                                
                                return !inline && match ? (
                                  <div className="bg-muted/50 rounded-md mt-2 mb-3 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-1.5 bg-muted/80 text-xs text-muted-foreground">
                                      <span>{match[1]}</span>
                                    </div>
                                    <SyntaxHighlighter
                                      language={match[1]}
                                      style={oneLight as any}
                                      customStyle={{margin: 0, padding: '1rem'}}
                                      className="text-xs"
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code className={`${className} bg-muted/50 px-1 py-0.5 rounded text-xs`} {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            } as Components}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                        <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-medium">
                          U
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Typing animation */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-2xl px-3 py-2 sm:px-4 sm:py-3 max-w-[85%] sm:max-w-[75%] bg-muted/70 shadow-sm">
                      <div className="text-sm markdown-content prose prose-sm dark:prose-invert prose-headings:font-medium prose-headings:text-primary prose-h2:text-base prose-h3:text-sm prose-p:my-1.5 prose-ul:my-1.5 prose-ul:pl-4 prose-li:my-0.5 prose-strong:text-primary/90 prose-strong:font-semibold">
                        <ReactMarkdown>
                          {typingMessage}
                        </ReactMarkdown>
                        <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse"></span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Initial loading animation */}
                {isLoading && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-muted/70 shadow-sm">
                      <div className="flex space-x-1.5 items-center h-5">
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input area with slight blur effect on scroll */}
              <div className="border-t bg-card/80 backdrop-blur-sm p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full flex-shrink-0"
                      onClick={handleReset}
                      title="Start a new conversation"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="sr-only">New Chat</span>
                    </Button>
                  )}
                  <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 bg-muted/50 rounded-full pl-4 pr-1.5 py-1.5">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="flex-1 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || !input.trim()}
                      className={`h-8 w-8 rounded-full flex-shrink-0 ${
                        input.trim() ? 'bg-primary hover:bg-primary/90' : 'bg-muted-foreground/20'
                      }`}
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </form>
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground/70 flex items-center justify-center gap-1">
                  <Info className="h-3 w-3" />
                  <span>This assistant provides general guidance only. For professional help, contact a mental health provider.</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardTransition>
  );
}