"use client"

import { DealForm } from "@/components/deals/deal-form"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function EditDealPage() {
  const params = useParams()
  const id = params.id as string
  const [deal, setDeal] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDeal() {
      try {
        const data = await apiClient.getDeal(id)
        setDeal(data)
      } catch (error) {
        console.error("Error fetching deal:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    fetchDeal()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!deal) {
    notFound()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Deal</h1>
        <p className="text-muted-foreground">Update deal information</p>
      </div>

      <DealForm deal={deal} />
    </div>
  )
}
