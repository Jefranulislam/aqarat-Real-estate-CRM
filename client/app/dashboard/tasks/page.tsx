"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { TasksTable } from "@/components/tasks/tasks-table"
import { TaskFilters } from "@/components/tasks/task-filters"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"

export default function TasksPage() {
  const searchParams = useSearchParams()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const status = searchParams.get("status") || undefined
  const priority = searchParams.get("priority") || undefined
  const search = searchParams.get("search") || undefined

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true)
        const result = await apiClient.getTasks({ status, priority, search, limit: 100 })
        setTasks(result.tasks)
      } catch (error) {
        console.error("Error fetching tasks:", error)
        setTasks([])
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [status, priority, search])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your tasks and to-dos</p>
        </div>
        <Link href="/dashboard/tasks/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </Link>
      </div>

      <TaskFilters />

      <TasksTable tasks={tasks || []} />
    </div>
  )
}
