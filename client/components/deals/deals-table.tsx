"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useState } from "react"

type Deal = {
  id: string
  title: string
  deal_type: string | null
  stage: string
  value: number | null
  probability: number | null
  expected_close_date: string | null
  property: { title: string } | null
  contact: { first_name: string; last_name: string } | null
}

const stageColors = {
  lead: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  qualified: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  proposal: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  negotiation: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  contract: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  closing: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  closed_won: "bg-green-500/10 text-green-500 border-green-500/20",
  closed_lost: "bg-red-500/10 text-red-500 border-red-500/20",
}

export function DealsTable({ deals }: { deals: Deal[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return

    setDeletingId(id)
    try {
      await apiClient.deleteDeal(id)
      router.refresh()
    } catch (error: any) {
      alert("Error deleting deal: " + (error.message || "Unknown error"))
    } finally {
      setDeletingId(null)
    }
  }

  if (deals.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No deals found. Create your first deal to get started.</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Probability</TableHead>
            <TableHead>Expected Close</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => (
            <TableRow key={deal.id}>
              <TableCell className="font-medium">{deal.title}</TableCell>
              <TableCell>{deal.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : "-"}</TableCell>
              <TableCell>{deal.property?.title || "-"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={stageColors[deal.stage as keyof typeof stageColors]}>
                  {deal.stage.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-primary">
                {deal.value ? `$${deal.value.toLocaleString()}` : "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${deal.probability || 0}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{deal.probability || 0}%</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : "-"}
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
                      <Link href={`/dashboard/deals/${deal.id}/edit`} className="flex items-center gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(deal.id)}
                      disabled={deletingId === deal.id}
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
