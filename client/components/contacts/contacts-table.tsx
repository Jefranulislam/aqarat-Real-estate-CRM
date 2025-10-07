"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useState } from "react"

type Contact = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  company: string | null
  contact_type: string | null
  city: string | null
  state: string | null
  assigned_to_profile: { full_name: string | null } | null
  created_at: string
}

const typeColors = {
  buyer: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  seller: "bg-green-500/10 text-green-500 border-green-500/20",
  both: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  investor: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

export function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    setDeletingId(id)
    try {
      await apiClient.deleteContact(id)
      router.refresh()
    } catch (error: any) {
      alert("Error deleting contact: " + (error.message || "Unknown error"))
    } finally {
      setDeletingId(null)
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No contacts found. Create your first contact to get started.</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">
                {contact.first_name} {contact.last_name}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {contact.email && <div>{contact.email}</div>}
                  {contact.phone && <div className="text-muted-foreground">{contact.phone}</div>}
                </div>
              </TableCell>
              <TableCell>{contact.company || "-"}</TableCell>
              <TableCell>
                {contact.contact_type ? (
                  <Badge variant="outline" className={typeColors[contact.contact_type as keyof typeof typeColors]}>
                    {contact.contact_type}
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {contact.city && contact.state
                  ? `${contact.city}, ${contact.state}`
                  : contact.city || contact.state || "-"}
              </TableCell>
              <TableCell>{contact.assigned_to_profile?.full_name || "Unassigned"}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(contact.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/contacts/${contact.id}`} className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/contacts/${contact.id}/edit`} className="flex items-center gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(contact.id)}
                      disabled={deletingId === contact.id}
                      className="flex items-center gap-2 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
