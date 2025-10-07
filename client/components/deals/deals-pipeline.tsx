"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  property: { title: string; address: string; city: string } | null
  contact: { first_name: string; last_name: string } | null
}

const stages = [
  { key: "lead", label: "Lead", color: "bg-gray-500/10 text-gray-500" },
  { key: "qualified", label: "Qualified", color: "bg-blue-500/10 text-blue-500" },
  { key: "proposal", label: "Proposal", color: "bg-yellow-500/10 text-yellow-500" },
  { key: "negotiation", label: "Negotiation", color: "bg-orange-500/10 text-orange-500" },
  { key: "contract", label: "Contract", color: "bg-purple-500/10 text-purple-500" },
  { key: "closing", label: "Closing", color: "bg-indigo-500/10 text-indigo-500" },
  { key: "closed_won", label: "Closed Won", color: "bg-green-500/10 text-green-500" },
  { key: "closed_lost", label: "Closed Lost", color: "bg-red-500/10 text-red-500" },
]

export function DealsPipeline({ deals }: { deals: Deal[] }) {
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

  const getDealsByStage = (stage: string) => {
    return deals.filter((deal) => deal.stage === stage)
  }

  const getTotalValue = (stageDeals: Deal[]) => {
    return stageDeals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage) => {
        const stageDeals = getDealsByStage(stage.key)
        const totalValue = getTotalValue(stageDeals)

        return (
          <div key={stage.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{stage.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {stageDeals.length} deals • ${(totalValue / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {stageDeals.map((deal) => (
                <Card key={deal.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium line-clamp-2">{deal.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1">
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
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {deal.value && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-primary">${deal.value.toLocaleString()}</span>
                      </div>
                    )}
                    {deal.contact && (
                      <p className="text-xs text-muted-foreground">
                        {deal.contact.first_name} {deal.contact.last_name}
                      </p>
                    )}
                    {deal.property && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{deal.property.title}</p>
                    )}
                    {deal.expected_close_date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(deal.expected_close_date).toLocaleDateString()}
                      </div>
                    )}
                    {deal.probability !== null && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${deal.probability}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {stageDeals.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground">No deals</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
