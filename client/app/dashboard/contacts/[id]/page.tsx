"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Mail, Phone, MapPin, Building2, Briefcase } from "lucide-react"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function ContactDetailPage() {
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

  const typeColors = {
    buyer: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    seller: "bg-green-500/10 text-green-500 border-green-500/20",
    both: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    investor: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {contact.first_name} {contact.last_name}
          </h1>
          <p className="text-muted-foreground">Contact details and information</p>
        </div>
        <Link href={`/dashboard/contacts/${contact.id}/edit`}>
          <Button className="gap-2">
            <Pencil className="w-4 h-4" />
            Edit Contact
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{contact.email}</p>
                </div>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{contact.phone}</p>
                </div>
              </div>
            )}
            {(contact.address || contact.city || contact.state) && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {contact.address && (
                      <span>
                        {contact.address}
                        <br />
                      </span>
                    )}
                    {contact.city && contact.state && `${contact.city}, ${contact.state} `}
                    {contact.zip_code}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.company && (
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{contact.company}</p>
                </div>
              </div>
            )}
            {contact.job_title && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Job Title</p>
                  <p className="font-medium">{contact.job_title}</p>
                </div>
              </div>
            )}
            {contact.contact_type && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Contact Type</p>
                <Badge variant="outline" className={typeColors[contact.contact_type as keyof typeof typeColors]}>
                  {contact.contact_type}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {contact.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
