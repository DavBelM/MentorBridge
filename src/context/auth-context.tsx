"use client"

"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Define proper types for user and profile
type Profile = {
  id: number
  bio?: string | null
  location?: string | null
  linkedin?: string | null
  twitter?: string | null
  profilePicture?: string | null
  experience?: string | null
  skills?: string | null
  availability?: string | null
  interests?: string | null
  learningGoals?: string | null
  userId: number
  createdAt: string
  updatedAt: string
}

type User = {
  id: string
  email: string
  fullname: string
  username?: string
  role: string
  isApproved: boolean
  profile: Profile | null
}

// Add caching mechanism
const TOKEN_CACHE_KEY = "auth_token"
const USER_CACHE_KEY = "auth_user"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  error: string | null
  clearError: () => void
  updateUser: (userData: Partial<User>) => void
  checkUsernameAvailability: (username: string) => Promise<{available: boolean, error?: string}>
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
  clearError: () => {},
  updateUser: () => {},
  checkUsernameAvailability: async () => ({ available: false }),
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
    } else if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id as string,
        email: session.user.email as string,
        fullname: session.user.fullname as string,
        role: session.user.role as string,
        isApproved: session.user.isApproved as boolean,
        profile: session.user.profile as Profile | null
      })
      setIsLoading(false)
    } else if (status === "unauthenticated") {
      setUser(null)
      setIsLoading(false)
      router.push("/login")
    }
  }, [status, session, router])

  // Login function with optimizations
  const login = async (email: string, password: string) => {
    if (!email || !password) {
      setError("Email and password are required");
      throw new Error("Email and password are required");
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Login failed");
        throw new Error(data.error || "Login failed");
      }

      const { token, user } = await response.json();

      // Store auth data
      if (token) {
        localStorage.setItem(TOKEN_CACHE_KEY, token);
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      } else {
        setError("No token received from server");
        throw new Error("No token received from server");
      }
      
      setUser(user);
      
      // Redirect based on role and profile completion
      if (user.profile) {
        router.push(user.role === 'MENTOR' ? '/dashboard/mentor' : '/dashboard/mentee');
      } else {
        router.push(`/onboarding/${user.role.toLowerCase()}`);
      }
      
      return user;
    } catch (error: any) {
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Register function
  const register = async (userData: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const uniqueUsername = userData.username || `${userData.fullName.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString().slice(-6)}`
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullname: userData.fullName,
          username: uniqueUsername,
          email: userData.email,
          password: userData.password,
          role: userData.role
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Registration failed")
        throw new Error(errorData.error || "Registration failed")
      }
      
      const data = await response.json()
      
      // Auto login after successful registration
      if (data.token) {
        localStorage.setItem(TOKEN_CACHE_KEY, data.token)
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user))
        setUser(data.user)
        
        // Redirect to onboarding
        router.push(`/onboarding/${data.user.role.toLowerCase()}`)
      }
      
      return data
    } catch (error: any) {
      setError(error.message || "Registration failed")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem(TOKEN_CACHE_KEY)
    sessionStorage.removeItem(USER_CACHE_KEY)
    setUser(null)
    router.push("/login")
  }

  // Check username availability function
  const checkUsernameAvailability = async (username: string) => {
    try {
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`)
      const data = await response.json()
      return { available: data.available }
    } catch (error) {
      console.error("Error checking username:", error)
      return { available: false, error: "Failed to check username availability" }
    }
  }
  
  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(updatedUser))
    }
  }
  
  // Clear error state
  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        login,
        register,
        logout,
        clearError,
        updateUser,
        checkUsernameAvailability
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
}