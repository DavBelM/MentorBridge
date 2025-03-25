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
        <Suspense fallback={<LoadingSpinner />}>
        <Card>
          <CardContent className="p-6">
            <LoginForm />
          </CardContent>
        </Card>
        </Suspense>      
      </div>
    </div>
  )
}

