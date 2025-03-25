"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AuthDebugPage() {
  const [token, setToken] = useState<string | null>(null)
  const [decodedToken, setDecodedToken] = useState<any>(null)
  const [verifyResponse, setVerifyResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get token from localStorage on client side
    const storedToken = localStorage.getItem('authToken')
    setToken(storedToken)

    // Try to decode the token (without verification)
    if (storedToken) {
      try {
        // Decode the token without verification
        // This just splits the token and decodes the payload part
        const payload = storedToken.split('.')[1]
        const decoded = JSON.parse(atob(payload))
        setDecodedToken(decoded)
      } catch (e) {
        console.error("Token decode error:", e)
      }
    }
  }, [])

  const verifyToken = async () => {
    if (!token) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      setVerifyResponse(data)
    } catch (error) {
      console.error("Token verification error:", error)
      setVerifyResponse({ error: "Failed to verify token" })
    } finally {
      setIsLoading(false)
    }
  }

  const clearToken = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setDecodedToken(null)
    setVerifyResponse(null)
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Token Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-1">Auth Token:</p>
              {token ? (
                <Badge className="mr-2" variant="outline">Present</Badge>
              ) : (
                <Badge className="mr-2" variant="destructive">Not Found</Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={verifyToken} 
                disabled={!token || isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Token"}
              </Button>
              <Button 
                onClick={clearToken} 
                variant="destructive" 
                disabled={!token}
              >
                Clear Token
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {decodedToken && (
          <Card>
            <CardHeader>
              <CardTitle>Decoded Token (Client-side)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                <pre>{JSON.stringify(decodedToken, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}

        {verifyResponse && (
          <Card>
            <CardHeader>
              <CardTitle>Server Verification Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                <pre>{JSON.stringify(verifyResponse, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}