"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { LoadingButton } from "@/components/ui/loading-button" 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Please enter your password.",
  }),
  rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    form.clearErrors(); // Clear previous errors
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: data.email, 
          password: data.password 
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Set specific field errors if returned from the API
        if (responseData.fieldErrors) {
          Object.entries(responseData.fieldErrors).forEach(([field, message]) => {
            form.setError(field as any, {
              type: "manual",
              message: message as string,
            });
          });
        } else {
          // General form error
          form.setError("root", {
            type: "manual",
            message: responseData.error || 'Login failed',
          });
          
          toast({
            title: "Login Failed",
            description: responseData.error || 'Authentication failed',
            variant: "destructive",
          });
        }
        return;
      }
      
      // Fix: Access the token and user from the correct response structure
      if (responseData.success && responseData.data) {
        const { token, user } = responseData.data;
        
        // Store the token consistently with how ProtectedRoute is checking it
        localStorage.setItem('authToken', token);
        sessionStorage.setItem('auth_user', JSON.stringify(user));
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        // Redirect based on user data
        const userRole = user.role;
        if (userRole === 'MENTOR') {
          router.push('/dashboard/mentor');
        } else {
          router.push('/dashboard/mentee');
        }
      } else {
        toast({
          title: "Login Error",
          description: "Server response format is invalid",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: "Connection Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <div className="text-sm text-right">
                  <Link href="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">Remember me</FormLabel>
              </FormItem>
            )}
          />
          <LoadingButton type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </LoadingButton>
        </form>
      </Form>
      
      {/* Keep the debug button if needed */}
      <div className="pt-4 text-center">
        <button
          type="button"
          className="text-xs text-muted-foreground hover:underline"
          onClick={() => {
            const token = localStorage.getItem('authToken');
            alert(token ? `Token exists: ${token.substring(0, 20)}...` : 'No token found');
          }}
        >
          Debug: Check Auth Token
        </button>
      </div>
    </div>
  )
}

