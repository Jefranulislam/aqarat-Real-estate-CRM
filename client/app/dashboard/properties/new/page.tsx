import { PropertyForm } from "@/components/properties/property-form"

export default function NewPropertyPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Property</h1>
        <p className="text-muted-foreground">Create a new property listing</p>
      </div>

      <PropertyForm />
    </div>
  )
}
