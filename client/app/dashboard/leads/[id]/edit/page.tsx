"use client"

import { LeadForm } from "@/components/leads/lead-form"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function EditLeadPage() {
  const params = useParams()
  const id = params.id as string
  const [lead, setLead] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLead() {
      try {
        const data = await apiClient.getLead(id)
        setLead(data)
      } catch (error) {
        console.error("Error fetching lead:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    fetchLead()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!lead) {
    notFound()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Lead</h1>
        <p className="text-muted-foreground">Update lead information</p>
      </div>

      <LeadForm lead={lead} />
    </div>
  )
}
