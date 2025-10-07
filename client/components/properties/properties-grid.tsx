"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Eye, Bed, Bath, Maximize } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useState } from "react"

type Property = {
  id: string
  title: string
  property_type: string | null
  status: string
  price: number | null
  address: string
  city: string
  state: string
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  images: string[] | null
  listed_by_profile: { full_name: string | null } | null
}

const statusColors = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  sold: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  off_market: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

export function PropertiesGrid({ properties }: { properties: Property[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return

    setDeletingId(id)
    try {
      await apiClient.deleteProperty(id)
      router.refresh()
    } catch (error: any) {
      alert("Error deleting property: " + (error.message || "Unknown error"))
    } finally {
      setDeletingId(null)
    }
  }

  if (properties.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No properties found. Create your first property listing to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden">
          <div className="aspect-video bg-muted relative">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0] || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge
                variant="outline"
                className={`${statusColors[property.status as keyof typeof statusColors]} backdrop-blur-sm`}
              >
                {property.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {property.address}, {property.city}, {property.state}
              </p>
              {property.price && <p className="text-2xl font-bold text-primary">${property.price.toLocaleString()}</p>}
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                {property.bedrooms !== null && (
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms !== null && (
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{property.bathrooms}</span>
                  </div>
                )}
                {property.square_feet !== null && (
                  <div className="flex items-center gap-1">
                    <Maximize className="w-4 h-4" />
                    <span>{property.square_feet.toLocaleString()} sqft</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between pt-0">
            <Link href={`/dashboard/properties/${property.id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/properties/${property.id}`} className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/properties/${property.id}/edit`} className="flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(property.id)}
                  disabled={deletingId === property.id}
                  className="flex items-center gap-2 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
