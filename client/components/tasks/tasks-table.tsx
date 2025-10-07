"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useState } from "react"

type Task = {
  id: string
  title: string
  description: string | null
  task_type: string | null
  priority: string
  status: string
  due_date: string | null
  completed_at: string | null
  related_to_type: string | null
  related_to_id: string | null
}

const priorityColors = {
  low: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

export function TasksTable({ tasks }: { tasks: Task[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    setDeletingId(id)
    try {
      await apiClient.deleteTask(id)
      router.refresh()
    } catch (error: any) {
      alert("Error deleting task: " + (error.message || "Unknown error"))
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed"
    try {
      await apiClient.updateTask(task.id, {
        status: newStatus,
        completed_at: newStatus === "completed" ? new Date().toISOString() : null,
      })
      router.refresh()
    } catch (error: any) {
      alert("Error updating task: " + (error.message || "Unknown error"))
    }
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && tasks.find((t) => t.due_date === dueDate)?.status !== "completed"
  }

  if (tasks.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No tasks found. Create your first task to get started.</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className={task.status === "completed" ? "opacity-60" : ""}>
              <TableCell>
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() => handleToggleComplete(task)}
                  aria-label="Mark as complete"
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}>{task.title}</p>
                  {task.description && <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>}
                </div>
              </TableCell>
              <TableCell className="capitalize">{task.task_type?.replace("_", " ") || "-"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={priorityColors[task.priority as keyof typeof priorityColors]}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[task.status as keyof typeof statusColors]}>
                  {task.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                {task.due_date ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span
                      className={isOverdue(task.due_date) ? "text-destructive font-medium" : "text-muted-foreground"}
                    >
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/tasks/${task.id}/edit`} className="flex items-center gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(task.id)}
                      disabled={deletingId === task.id}
                      className="flex items-center gap-2 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
