import { DealForm } from "@/components/deals/deal-form"

export default function NewDealPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Deal</h1>
        <p className="text-muted-foreground">Create a new deal in your pipeline</p>
      </div>

      <DealForm />
    </div>
  )
}
