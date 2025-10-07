"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ActivitiesTimeline } from "@/components/activities/activities-timeline"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        const result = await apiClient.getActivities({ limit: 100 })
        setActivities(result.activities)
      } catch (error) {
        console.error("Error fetching activities:", error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading activities...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">Track your communication and interactions</p>
        </div>
        <Link href="/dashboard/activities/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Log Activity
          </Button>
        </Link>
      </div>

      <ActivitiesTimeline activities={activities || []} />
    </div>
  )
}
