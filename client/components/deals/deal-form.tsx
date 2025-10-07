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
import { useState, useEffect } from "react"

type Deal = {
  id: string
  title: string
  deal_type: string | null
  stage: string
  value: number | null
  probability: number | null
  expected_close_date: string | null
  property_id: string | null
  contact_id: string | null
  notes: string | null
}

export function DealForm({ deal }: { deal?: Deal }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([])
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([])

  const [formData, setFormData] = useState({
    title: deal?.title || "",
    deal_type: deal?.deal_type || "purchase",
    stage: deal?.stage || "lead",
    value: deal?.value?.toString() || "",
    probability: deal?.probability?.toString() || "50",
    expected_close_date: deal?.expected_close_date || "",
    property_id: deal?.property_id || "",
    contact_id: deal?.contact_id || "",
    notes: deal?.notes || "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching properties and contacts for deal form...')
        const [propertiesRes, contactsRes] = await Promise.all([
          apiClient.getProperties({ limit: 100 }),
          apiClient.getContacts({ limit: 100 }),
        ])

        console.log('Properties response:', propertiesRes)
        console.log('Contacts response:', contactsRes)

        if (propertiesRes.properties) {
          setProperties(propertiesRes.properties.map((p: any) => ({ id: p.id, title: p.title })))
          console.log('Loaded', propertiesRes.properties.length, 'properties')
        }
        if (contactsRes.contacts) {
          setContacts(contactsRes.contacts.map((c: any) => ({ id: c.id, first_name: c.first_name, last_name: c.last_name })))
          console.log('Loaded', contactsRes.contacts.length, 'contacts')
        }
      } catch (error) {
        console.error('Error fetching dropdown data for deal form:', error)
        setError('Failed to load properties and contacts. Please refresh the page.')
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const dealData = {
        title: formData.title,
        deal_type: formData.deal_type,
        stage: formData.stage,
        value: formData.value ? Number.parseFloat(formData.value) : null,
        probability: formData.probability ? Number.parseInt(formData.probability) : null,
        expected_close_date: formData.expected_close_date || null,
        property_id: formData.property_id || null,
        contact_id: formData.contact_id || null,
        notes: formData.notes || null,
      }

      if (deal) {
        await apiClient.updateDeal(deal.id, dealData)
      } else {
        await apiClient.createDeal(dealData)
      }

      router.push("/dashboard/deals")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred")
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
              Deal Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              required
              placeholder="Property Sale - 123 Main St"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deal_type">Deal Type</Label>
              <Select value={formData.deal_type} onValueChange={(v) => setFormData({ ...formData, deal_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="lease">Lease</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="closing">Closing</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="value">Deal Value ($)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="500000"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_close_date">Expected Close Date</Label>
            <Input
              id="expected_close_date"
              type="date"
              value={formData.expected_close_date}
              onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="property_id">Property</Label>
              <Select value={formData.property_id} onValueChange={(v) => setFormData({ ...formData, property_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_id">Contact</Label>
              <Select value={formData.contact_id} onValueChange={(v) => setFormData({ ...formData, contact_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : deal ? "Update Deal" : "Create Deal"}
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
