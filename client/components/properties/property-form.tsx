"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Property = {
  id: string
  title: string
  description: string | null
  property_type: string | null
  status: string
  price: number | null
  address: string
  city: string
  state: string
  zip_code: string
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  lot_size: number | null
  year_built: number | null
  mls_number: string | null
}

export function PropertyForm({ property }: { property?: Property }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: property?.title || "",
    description: property?.description || "",
    property_type: property?.property_type || "residential",
    status: property?.status || "active",
    price: property?.price?.toString() || "",
    address: property?.address || "",
    city: property?.city || "",
    state: property?.state || "",
    zip_code: property?.zip_code || "",
    bedrooms: property?.bedrooms?.toString() || "",
    bathrooms: property?.bathrooms?.toString() || "",
    square_feet: property?.square_feet?.toString() || "",
    lot_size: property?.lot_size?.toString() || "",
    year_built: property?.year_built?.toString() || "",
    mls_number: property?.mls_number || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const propertyData: any = {
        title: formData.title,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        status: formData.status,
      }

      // Only add optional fields if they have values
      if (formData.description?.trim()) {
        propertyData.description = formData.description.trim()
      }
      
      if (formData.property_type) {
        propertyData.property_type = formData.property_type
      }
      
      if (formData.price?.trim()) {
        propertyData.price = Number.parseFloat(formData.price)
      }
      
      if (formData.bedrooms?.trim()) {
        propertyData.bedrooms = Number.parseInt(formData.bedrooms)
      }
      
      if (formData.bathrooms?.trim()) {
        propertyData.bathrooms = Number.parseFloat(formData.bathrooms)
      }
      
      if (formData.square_feet?.trim()) {
        propertyData.square_feet = Number.parseInt(formData.square_feet)
      }
      
      if (formData.lot_size?.trim()) {
        propertyData.lot_size = Number.parseFloat(formData.lot_size)
      }
      
      if (formData.year_built?.trim()) {
        propertyData.year_built = Number.parseInt(formData.year_built)
      }
      
      if (formData.mls_number?.trim()) {
        propertyData.mls_number = formData.mls_number.trim()
      }

      if (property) {
        await apiClient.updateProperty(property.id, propertyData)
      } else {
        await apiClient.createProperty(propertyData)
      }

      router.push("/dashboard/properties")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Property Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              required
              placeholder="Beautiful 3BR Home in Downtown"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe the property..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type</Label>
              <Select
                value={formData.property_type}
                onValueChange={(v) => setFormData({ ...formData, property_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="multi_family">Multi Family</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="off_market">Off Market</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="500000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              required
              placeholder="123 Main Street"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">
                State <span className="text-destructive">*</span>
              </Label>
              <Input
                id="state"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">
                Zip Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="zip_code"
                required
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="square_feet">Square Feet</Label>
              <Input
                id="square_feet"
                type="number"
                value={formData.square_feet}
                onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="lot_size">Lot Size (acres)</Label>
              <Input
                id="lot_size"
                type="number"
                step="0.01"
                value={formData.lot_size}
                onChange={(e) => setFormData({ ...formData, lot_size: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year_built">Year Built</Label>
              <Input
                id="year_built"
                type="number"
                value={formData.year_built}
                onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mls_number">MLS Number</Label>
              <Input
                id="mls_number"
                value={formData.mls_number}
                onChange={(e) => setFormData({ ...formData, mls_number: e.target.value })}
              />
            </div>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : property ? "Update Property" : "Create Property"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
