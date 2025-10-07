"use client"

import { ContactForm } from "@/components/contacts/contact-form"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function EditContactPage() {
  const params = useParams()
  const id = params.id as string
  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContact() {
      try {
        const data = await apiClient.getContact(id)
        setContact(data)
      } catch (error) {
        console.error("Error fetching contact:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    fetchContact()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!contact) {
    notFound()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Contact</h1>
        <p className="text-muted-foreground">Update contact information</p>
      </div>

      <ContactForm contact={contact} />
    </div>
  )
}
