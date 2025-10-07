"use client"

import { PropertyForm } from "@/components/properties/property-form"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function EditPropertyPage() {
  const params = useParams()
  const id = params.id as string
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperty() {
      try {
        const data = await apiClient.getProperty(id)
        setProperty(data)
      } catch (error) {
        console.error("Error fetching property:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    fetchProperty()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!property) {
    notFound()
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>
        <p className="text-muted-foreground">Update property information</p>
      </div>

      <PropertyForm property={property} />
    </div>
  )
}
