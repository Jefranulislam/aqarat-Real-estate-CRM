import { LeadForm } from "@/components/leads/lead-form"

export default function NewLeadPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Lead</h1>
        <p className="text-muted-foreground">Create a new lead in your pipeline</p>
      </div>

      <LeadForm />
    </div>
  )
}
