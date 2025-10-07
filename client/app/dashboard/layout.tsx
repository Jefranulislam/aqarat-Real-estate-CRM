"use client"

import type React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { isAuthenticated } from "@/lib/auth"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      redirect("/auth/login")
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full">
        <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-4 px-4">
            <SidebarTrigger />
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  )
}
