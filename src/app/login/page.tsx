import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"



export const metadata: Metadata = {
  title: "Login | MentorBridge",
  description: "Login to your MentorBridge account",
}

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>Sign in to access your mentorship dashboard</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              <span>Don't have an account? </span>
              <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                Sign up
              </Link>
            </div>
            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                Google
              </Button>
              <Button variant="outline" className="w-full">
                LinkedIn
              </Button>
            </div> */}
          </CardFooter>
        </Card>

        </Suspense>      
        </div>
    </div>
  )
}

