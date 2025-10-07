import { ActivityForm } from "@/components/activities/activity-form"

export default function NewActivityPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Activity</h1>
        <p className="text-muted-foreground">Record a communication or interaction</p>
      </div>

      <ActivityForm />
    </div>
  )
}
