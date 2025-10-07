"use client"

import { TaskForm } from "@/components/tasks/task-form"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function EditTaskPage() {
  const params = useParams()
  const id = params.id as string
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTask() {
      try {
        const data = await apiClient.getTask(id)
        setTask(data)
      } catch (error) {
        console.error("Error fetching task:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    fetchTask()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!task) {
    notFound()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
        <p className="text-muted-foreground">Update task information</p>
      </div>

      <TaskForm task={task} />
    </div>
  )
}
