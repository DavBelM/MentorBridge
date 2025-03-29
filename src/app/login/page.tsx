"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams();
  
  // Get error message from URL if it exists
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      console.log("Error from URL:", errorParam);
      // Check if the error is specifically 'undefined' string
      if (errorParam === 'undefined') {
        // This is a session/routing issue, not a credentials issue
        setError('Session error. Please try again.');
      } else {
        const errorMessages: Record<string, string> = {
          'CredentialsSignin': 'Invalid email or password',
          'default': 'An error occurred during sign in'
        };
        setError(errorMessages[errorParam] || errorMessages.default);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Use NextAuth's built-in flow without custom redirects
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: true,
      })
      // No code will run after this point in the function
      // as signIn with redirect:true causes a browser redirect
    } catch (error) {
      // This will only catch errors before the redirect
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const getRedirectPath = (role: string): string => {
    switch (role) {
      case "ADMIN":
        return "/dashboard/admin"
      case "MENTOR":
        return "/dashboard/mentor"
      case "MENTEE":
        return "/dashboard/mentee"
      default:
        return "/dashboard"
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

