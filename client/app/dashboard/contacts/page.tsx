"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { ContactFilters } from "@/components/contacts/contact-filters"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"

export default function ContactsPage() {
  const searchParams = useSearchParams()
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const type = searchParams.get("type") || undefined
  const search = searchParams.get("search") || undefined

  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoading(true)
        const result = await apiClient.getContacts({ 
          contact_type: type,
          search: search,
          limit: 100 
        })
        setContacts(result.contacts)
      } catch (error) {
        console.error("Error fetching contacts:", error)
        setContacts([])
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [type, search])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading contacts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your clients and contacts</p>
        </div>
        <Link href="/dashboard/contacts/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        </Link>
      </div>

      <ContactFilters />

      <ContactsTable contacts={contacts || []} />
    </div>
  )
}
