"use client"

import React from "react"
import {
  Home,
  Users,
  Building2,
  TrendingUp,
  CheckSquare,
  MessageSquare,
  FileText,
  BarChart3,
  LogOut,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { AdminOnly, BrokerUp } from "@/components/role-guard"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const menuItems = [
  { title: "Dashboard", icon: Home, href: "/dashboard", roles: ['admin', 'broker', 'agent'] },
  { title: "Leads", icon: Users, href: "/dashboard/leads", roles: ['admin', 'broker', 'agent'] },
  { title: "Contacts", icon: Users, href: "/dashboard/contacts", roles: ['admin', 'broker', 'agent'] },
  { title: "Properties", icon: Building2, href: "/dashboard/properties", roles: ['admin', 'broker', 'agent'] },
  { title: "Deals", icon: TrendingUp, href: "/dashboard/deals", roles: ['admin', 'broker', 'agent'] },
  { title: "Tasks", icon: CheckSquare, href: "/dashboard/tasks", roles: ['admin', 'broker', 'agent'] },
  { title: "Activities", icon: MessageSquare, href: "/dashboard/activities", roles: ['admin', 'broker', 'agent'] },
  { title: "Documents", icon: FileText, href: "/dashboard/documents", roles: ['admin', 'broker'] },
  { title: "Analytics", icon: BarChart3, href: "/dashboard/analytics", roles: ['admin', 'broker'] },
  { title: "Settings", icon: Settings, href: "/dashboard/settings", roles: ['admin'] },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin } = useAuth()

  const handleSignOut = async () => {
    apiClient.logout()
    router.push('/auth/login')
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">Aq</span>
          </div>
          <span className="text-lg font-bold">Aqarat</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Check if user has permission for this menu item
                const hasPermission = user && item.roles.includes(user.role)
                
                if (!hasPermission) return null
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{user?.full_name || 'User'}</span>
                {isAdmin() && (
                  <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full font-medium">
                    Admin
                  </span>
                )}
              </div>
              <span className="text-xs text-sidebar-foreground/60 capitalize">
                {user?.role || 'Agent'}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
