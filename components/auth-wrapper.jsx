"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BrainCircuit } from "lucide-react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { isAuthenticated, refreshAccessToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export function AuthWrapper({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isLoading: true
  })

  // Function to check authentication
    const checkAuth = async () => {
      try {
        // Add a small delay to prevent flash of loading state
        await new Promise((resolve) => setTimeout(resolve, 100))

        const authenticated = isAuthenticated()
        
        // Try to refresh the token if authenticated
        if (authenticated) {
          try {
            await refreshAccessToken()
          setAuthStatus({ isAuthenticated: true, isLoading: false })
          } catch (error) {
          // More specific error handling based on error code
          if (error.code === 'no_token') {
            // Quietly redirect to login without showing error
            console.log("Session expired - redirecting to login")
            setAuthStatus({ isAuthenticated: false, isLoading: false })
          } else if (error.code === 'refresh_failed') {
            // Token was rejected by server
            console.warn("Token refresh rejected by server:", error.message)
            toast({
              title: "Session expired",
              description: "Please login again to continue",
              variant: "destructive"
            })
            setAuthStatus({ isAuthenticated: false, isLoading: false })
          } else {
            // Any other error
            console.warn("Token refresh failed:", error)
            toast({
              title: "Authentication error",
              description: error.message || "Please login again",
              variant: "destructive"
            })
            setAuthStatus({ isAuthenticated: false, isLoading: false })
          }
        }
      } else {
        setAuthStatus({ isAuthenticated: false, isLoading: false })
        }
      } catch (error) {
        console.warn("Auth check failed:", error)
        setAuthStatus({ isAuthenticated: false, isLoading: false })
      }
    }

  // Initial auth check
  useEffect(() => {
    checkAuth()

    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "authToken") {
        const authenticated = !!e.newValue
        setAuthStatus({ isAuthenticated: authenticated, isLoading: false })
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Set up periodic token refresh (every 15 minutes)
  useEffect(() => {
    // Skip if not authenticated or on auth pages
    if (!authStatus.isAuthenticated || pathname.startsWith("/auth")) {
      return;
    }

    // Schedule token refresh
    const refreshInterval = setInterval(() => {
      console.log("Performing scheduled token refresh check");
      checkAuth();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(refreshInterval);
  }, [authStatus.isAuthenticated, pathname]);

  // Auth redirect logic
  useEffect(() => {
    if (!authStatus.isLoading && !authStatus.isAuthenticated && !pathname.startsWith("/auth")) {
      router.push("/auth/login")
    }
  }, [authStatus.isAuthenticated, pathname, authStatus.isLoading, router])

  // Auth pages that don't need the sidebar
  const isAuthPage = pathname.startsWith("/auth")

  if (authStatus.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <BrainCircuit className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // If it's an auth page, render without sidebar
  if (isAuthPage) {
    return <>{children}</>
  }

  // If not authenticated and not on auth page, redirect handled in useEffect
  if (!authStatus.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <BrainCircuit className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  // If authenticated, render with sidebar
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  )
}
