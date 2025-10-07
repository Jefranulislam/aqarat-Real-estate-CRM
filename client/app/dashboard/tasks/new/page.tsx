import { TaskForm } from "@/components/tasks/task-form"

export default function NewTaskPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Task</h1>
        <p className="text-muted-foreground">Create a new task or to-do</p>
      </div>

      <TaskForm />
    </div>
  )
}
