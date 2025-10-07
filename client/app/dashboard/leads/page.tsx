"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { LeadsTable } from "@/components/leads/leads-table"
import { LeadFilters } from "@/components/leads/lead-filters"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useSearchParams } from "next/navigation"

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true)
        const status = searchParams.get('status') || undefined
        const source = searchParams.get('source') || undefined
        const search = searchParams.get('search') || undefined

        const response = await apiClient.getLeads({ 
          status, 
          source,
          page: 1,
          limit: 100
        })
        
        // Filter by search on client side if needed
        let filteredLeads = response.leads
        if (search) {
          filteredLeads = response.leads.filter((lead: any) => 
            lead.first_name?.toLowerCase().includes(search.toLowerCase()) ||
            lead.last_name?.toLowerCase().includes(search.toLowerCase()) ||
            lead.email?.toLowerCase().includes(search.toLowerCase())
          )
        }
        
        setLeads(filteredLeads)
      } catch (error) {
        console.error('Error fetching leads:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading leads...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Manage and track your leads</p>
        </div>
        <Link href="/dashboard/leads/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
        </Link>
      </div>

      <LeadFilters />

      <LeadsTable leads={leads || []} />
    </div>
  )
}
