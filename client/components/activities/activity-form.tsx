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

export function ActivityForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([])

  const [formData, setFormData] = useState({
    activity_type: "call",
    subject: "",
    description: "",
    duration_minutes: "",
    contact_id: "",
  })

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        console.log('Fetching contacts for activity form...')
        const contactsRes = await apiClient.getContacts({ limit: 100 })
        console.log('Contacts response:', contactsRes)
        
        if (contactsRes.contacts) {
          setContacts(contactsRes.contacts.map((c: any) => ({ 
            id: c.id, 
            first_name: c.first_name, 
            last_name: c.last_name 
          })))
          console.log('Loaded', contactsRes.contacts.length, 'contacts for activity form')
        }
      } catch (error) {
        console.error('Error fetching contacts for activity form:', error)
        setError('Failed to load contacts. Please refresh the page.')
        setError('Failed to load contacts. Please refresh the page.')
      }
    }
    fetchContacts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await apiClient.createActivity({
        activity_type: formData.activity_type,
        subject: formData.subject,
        description: formData.description || null,
        duration_minutes: formData.duration_minutes ? Number.parseInt(formData.duration_minutes) : null,
        contact_id: formData.contact_id || null,
      })

      router.push("/dashboard/activities")
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
            <Label htmlFor="activity_type">Activity Type</Label>
            <Select
              value={formData.activity_type}
              onValueChange={(v) => setFormData({ ...formData, activity_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="showing">Showing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              required
              placeholder="Discussed property details"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Add activity details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                type="number"
                placeholder="30"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              />
            </div>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Log Activity"}
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
