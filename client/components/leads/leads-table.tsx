"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useState } from "react"

type Lead = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  status: string
  source: string | null
  score: number | null
  assigned_to_profile: { full_name: string | null } | null
  created_at: string
}

const statusColors = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  qualified: "bg-green-500/10 text-green-500 border-green-500/20",
  unqualified: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  converted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return

    setDeletingId(id)
    try {
      await apiClient.deleteLead(id)
      router.refresh()
    } catch (error: any) {
      alert("Error deleting lead: " + (error.message || "Unknown error"))
    } finally {
      setDeletingId(null)
    }
  }

  const handleConvert = async (id: string) => {
    router.push(`/dashboard/leads/${id}/convert`)
  }

  if (leads.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No leads found. Create your first lead to get started.</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">
                {lead.first_name} {lead.last_name}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {lead.email && <div>{lead.email}</div>}
                  {lead.phone && <div className="text-muted-foreground">{lead.phone}</div>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[lead.status as keyof typeof statusColors]}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">{lead.source?.replace("_", " ") || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${lead.score || 0}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{lead.score || 0}</span>
                </div>
              </TableCell>
              <TableCell>{lead.assigned_to_profile?.full_name || "Unassigned"}</TableCell>
              <TableCell className="text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/leads/${lead.id}/edit`} className="flex items-center gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleConvert(lead.id)} className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Convert to Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(lead.id)}
                      disabled={deletingId === lead.id}
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
