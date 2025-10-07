"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { DealsPipeline } from "@/components/deals/deals-pipeline"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DealsTable } from "@/components/deals/deals-table"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDeals() {
      try {
        setLoading(true)
        const result = await apiClient.getDeals({ limit: 100 })
        setDeals(result.deals)
      } catch (error) {
        console.error("Error fetching deals:", error)
        setDeals([])
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading deals...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">Manage your sales pipeline</p>
        </div>
        <Link href="/dashboard/deals/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Deal
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        <TabsContent value="pipeline" className="space-y-4">
          <DealsPipeline deals={deals || []} />
        </TabsContent>
        <TabsContent value="table" className="space-y-4">
          <DealsTable deals={deals || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
