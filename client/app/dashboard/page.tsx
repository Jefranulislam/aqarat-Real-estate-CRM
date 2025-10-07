"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, TrendingUp, CheckSquare, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    totalContacts: 0,
    totalProperties: 0,
    activeDeals: 0,
    pendingTasks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [leadsRes, contactsRes, propertiesRes, dealsRes, tasksRes] = await Promise.all([
          apiClient.getLeads({ limit: 100 }),
          apiClient.getContacts({ limit: 100 }),
          apiClient.getProperties({ limit: 100 }),
          apiClient.getDeals({ limit: 100 }),
          apiClient.getTasks({ status: 'pending', limit: 100 })
        ])

        console.log('Dashboard API responses:', {
          leadsRes,
          contactsRes, 
          propertiesRes,
          dealsRes,
          tasksRes
        })

        setStats({
          totalLeads: leadsRes?.total || 0,
          newLeads: leadsRes?.leads?.filter((l: any) => l.status === 'new').length || 0,
          totalContacts: contactsRes?.total || 0,
          totalProperties: propertiesRes?.total || 0,
          activeDeals: dealsRes?.deals?.filter((d: any) => !['closed_won', 'closed_lost'].includes(d.stage)).length || 0,
          pendingTasks: tasksRes?.total || 0
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  const dashboardStats = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      subtitle: `${stats.newLeads} new`,
      icon: Users,
      color: "text-chart-1",
    },
    {
      title: "Contacts",
      value: stats.totalContacts,
      subtitle: "Active clients",
      icon: Users,
      color: "text-chart-2",
    },
    {
      title: "Properties",
      value: stats.totalProperties,
      subtitle: "Listed",
      icon: Building2,
      color: "text-chart-3",
    },
    {
      title: "Active Deals",
      value: stats.activeDeals,
      subtitle: "In progress",
      icon: TrendingUp,
      color: "text-chart-4",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      subtitle: "Due soon",
      icon: CheckSquare,
      color: "text-chart-5",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Navigate using the sidebar to manage your leads, contacts, properties, and deals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Start by adding leads and converting them to contacts. Create properties and manage deals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
