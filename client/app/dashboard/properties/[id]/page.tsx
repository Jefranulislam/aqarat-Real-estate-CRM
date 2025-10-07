"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, MapPin, Bed, Bath, Maximize, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function PropertyDetailPage() {
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

  const statusColors = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    sold: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    off_market: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4" />
            {property.address}, {property.city}, {property.state} {property.zip_code}
          </p>
        </div>
        <Link href={`/dashboard/properties/${property.id}/edit`}>
          <Button className="gap-2">
            <Pencil className="w-4 h-4" />
            Edit Property
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <span className="text-2xl font-bold text-primary">
                {property.price ? `$${property.price.toLocaleString()}` : "Not set"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className={statusColors[property.status as keyof typeof statusColors]}>
              {property.status.replace("_", " ")}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Property Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="capitalize">{property.property_type?.replace("_", " ")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {property.bedrooms !== null && (
              <div className="flex items-center gap-3">
                <Bed className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{property.bedrooms}</p>
                </div>
              </div>
            )}
            {property.bathrooms !== null && (
              <div className="flex items-center gap-3">
                <Bath className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">{property.bathrooms}</p>
                </div>
              </div>
            )}
            {property.square_feet !== null && (
              <div className="flex items-center gap-3">
                <Maximize className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Square Feet</p>
                  <p className="font-medium">{property.square_feet.toLocaleString()}</p>
                </div>
              </div>
            )}
            {property.year_built !== null && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-medium">{property.year_built}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {property.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{property.description}</p>
          </CardContent>
        </Card>
      )}

      {property.mls_number && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm text-muted-foreground">MLS Number</p>
              <p className="font-medium">{property.mls_number}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
