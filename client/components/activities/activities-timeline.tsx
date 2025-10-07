"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MessageSquare, Calendar, FileText, Home } from "lucide-react"

type Activity = {
  id: string
  activity_type: string
  subject: string
  description: string | null
  duration_minutes: number | null
  contact: { first_name: string; last_name: string } | null
  created_at: string
}

const activityIcons = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  meeting: Calendar,
  note: FileText,
  showing: Home,
  other: FileText,
}

const activityColors = {
  call: "bg-blue-500/10 text-blue-500",
  email: "bg-purple-500/10 text-purple-500",
  sms: "bg-green-500/10 text-green-500",
  meeting: "bg-orange-500/10 text-orange-500",
  note: "bg-gray-500/10 text-gray-500",
  showing: "bg-yellow-500/10 text-yellow-500",
  other: "bg-gray-500/10 text-gray-500",
}

export function ActivitiesTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No activities logged yet. Start tracking your interactions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.activity_type as keyof typeof activityIcons]
        const colorClass = activityColors[activity.activity_type as keyof typeof activityColors]

        return (
          <Card key={activity.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold">{activity.subject}</h3>
                      {activity.contact && (
                        <p className="text-sm text-muted-foreground">
                          with {activity.contact.first_name} {activity.contact.last_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="outline" className="capitalize">
                        {activity.activity_type}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {activity.description && <p className="text-sm text-muted-foreground">{activity.description}</p>}
                  {activity.duration_minutes && (
                    <p className="text-xs text-muted-foreground mt-2">Duration: {activity.duration_minutes} minutes</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
