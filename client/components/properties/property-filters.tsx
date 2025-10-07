"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/properties?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    router.push(`/dashboard/properties?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select defaultValue={searchParams.get("status") || "all"} onValueChange={(v) => handleFilterChange("status", v)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="sold">Sold</SelectItem>
          <SelectItem value="off_market">Off Market</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={searchParams.get("type") || "all"} onValueChange={(v) => handleFilterChange("type", v)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="residential">Residential</SelectItem>
          <SelectItem value="commercial">Commercial</SelectItem>
          <SelectItem value="land">Land</SelectItem>
          <SelectItem value="multi_family">Multi Family</SelectItem>
          <SelectItem value="condo">Condo</SelectItem>
          <SelectItem value="townhouse">Townhouse</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
