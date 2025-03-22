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

// Add caching mechanism
const TOKEN_CACHE_KEY = "auth_token"
const USER_CACHE_KEY = "auth_user"

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
      
      // Try to get user from sessionStorage first for faster load
      const cachedUser = sessionStorage.getItem(USER_CACHE_KEY)
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser))
          setIsLoading(false)
          // Continue with token validation in background
        } catch (e) {
          // Invalid cached user, continue with normal flow
          sessionStorage.removeItem(USER_CACHE_KEY)
        }
      }
      
      const token = localStorage.getItem(TOKEN_CACHE_KEY)
      
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
            // Cache the user for faster loads
            sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user))
          } else {
            // Token is invalid - remove it
            localStorage.removeItem(TOKEN_CACHE_KEY)
            sessionStorage.removeItem(USER_CACHE_KEY)
            setUser(null)
          }
        } catch (error) {
          console.error("Auth status check error:", error)
          localStorage.removeItem(TOKEN_CACHE_KEY)
          sessionStorage.removeItem(USER_CACHE_KEY)
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

  // Login function with optimizations
  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", email);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const { token, user } = await response.json();
      
      // Debug token format
      console.log("Received token:", token ? "Yes (length: " + token.length + ")" : "No");

      // Store auth data
      if (token) {
        localStorage.setItem("token", token);
        sessionStorage.setItem("auth_user", JSON.stringify(user));
        console.log("Token saved in localStorage");
      } else {
        throw new Error("No token received from server");
      }
      
      setUser(user);
      return user;
    } finally {
      setIsLoading(false);
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