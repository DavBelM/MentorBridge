"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: number
  fullname: string
  username: string
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
}

type RegisterData = {
  fullName: string
  username: string
  email: string
  password: string
  role: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  // Check if user is already logged in (on mount and when localStorage changes)
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      
      if (token) {
        try {
          // Verify the token and get user data
          const response = await fetch("/api/me", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
          } else {
            // Token is invalid - remove it
            localStorage.removeItem("token")
            setUser(null)
          }
        } catch (error) {
          console.error("Auth status check error:", error)
          localStorage.removeItem("token")
          setUser(null)
        }
      } else {
        setUser(null)
      }
      
      setIsLoading(false)
    }

    checkAuthStatus()
    
    // Listen for storage events (when token changes in another tab)
    window.addEventListener("storage", checkAuthStatus)
    return () => window.removeEventListener("storage", checkAuthStatus)
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Login failed")
      }
      
      const data = await response.json()
      
      // Store token and user data
      localStorage.setItem("token", data.token)
      setUser(data.user)
      
      return data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    
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
        const error = await response.json()
        throw new Error(error.error || "Registration failed")
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout
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