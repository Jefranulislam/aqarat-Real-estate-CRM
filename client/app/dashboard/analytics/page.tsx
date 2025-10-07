"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Users, Building2, Target } from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: "0",
    totalContacts: 0,
    totalProperties: 0,
    activeProperties: 0,
    totalDeals: 0,
    wonDeals: 0,
    totalRevenue: 0,
    pipelineValue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        const [leadsRes, contactsRes, propertiesRes, dealsRes] = await Promise.all([
          apiClient.getLeads({ limit: 100 }),
          apiClient.getContacts({ limit: 100 }),
          apiClient.getProperties({ limit: 100 }),
          apiClient.getDeals({ limit: 100 }),
        ])

        const leads = leadsRes.leads || []
        const totalLeads = leads.length
        const convertedLeads = leads.filter((l: any) => l.status === "converted").length
        const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0"

        const totalContacts = contactsRes.pagination.total
        const properties = propertiesRes.properties || []
        const totalProperties = properties.length
        const activeProperties = properties.filter((p: any) => p.status === "active").length

        const deals = dealsRes.deals || []
        const totalDeals = deals.length
        const wonDeals = deals.filter((d: any) => d.stage === "closed_won").length
        const totalRevenue = deals
          .filter((d: any) => d.stage === "closed_won")
          .reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0)
        const pipelineValue = deals
          .filter((d: any) => !["closed_won", "closed_lost"].includes(d.stage))
          .reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0)

        setStats({
          totalLeads,
          convertedLeads,
          conversionRate,
          totalContacts,
          totalProperties,
          activeProperties,
          totalDeals,
          wonDeals,
          totalRevenue,
          pipelineValue,
        })
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your performance and metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalRevenue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.wonDeals} deals closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.pipelineValue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalDeals - stats.wonDeals} active deals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.convertedLeads} of {stats.totalLeads} leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <p className="text-xs text-muted-foreground mt-1">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.activeProperties} active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalDeals > 0 ? ((stats.wonDeals / stats.totalDeals) * 100).toFixed(1) : "0"}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.wonDeals} of {stats.totalDeals} deals
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
