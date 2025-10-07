"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export function ContactFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/contacts?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    router.push(`/dashboard/contacts?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select defaultValue={searchParams.get("type") || "all"} onValueChange={(v) => handleFilterChange("type", v)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="buyer">Buyer</SelectItem>
          <SelectItem value="seller">Seller</SelectItem>
          <SelectItem value="both">Both</SelectItem>
          <SelectItem value="investor">Investor</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
