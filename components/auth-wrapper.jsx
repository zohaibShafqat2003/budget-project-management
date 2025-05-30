"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BrainCircuit } from "lucide-react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { isAuthenticated, refreshAccessToken } from "@/lib/auth"

export function AuthWrapper({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isLoading: true
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add a small delay to prevent flash of loading state
        await new Promise((resolve) => setTimeout(resolve, 100))

        const authenticated = isAuthenticated()
        setAuthStatus({ isAuthenticated: authenticated, isLoading: false })
        
        // Try to refresh the token if authenticated
        if (authenticated) {
          try {
            await refreshAccessToken()
          } catch (error) {
            console.warn("Token refresh failed:", error)
            // If refresh fails, user needs to login again
            setAuthStatus({ isAuthenticated: false, isLoading: false })
          }
        }
      } catch (error) {
        console.warn("Auth check failed:", error)
        setAuthStatus({ isAuthenticated: false, isLoading: false })
      }
    }

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
