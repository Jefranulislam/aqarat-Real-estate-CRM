"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true)
        const result = await apiClient.getDocuments({ limit: 100 })
        setDocuments(result.documents)
      } catch (error) {
        console.error("Error fetching documents:", error)
        setDocuments([])
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading documents...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">Manage your files and documents</p>
      </div>

      {documents && documents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-1">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{doc.file_name}</p>
                    {doc.document_type && (
                      <Badge variant="outline" className="mt-2 capitalize">
                        {doc.document_type}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No documents uploaded yet.</p>
        </div>
      )}
    </div>
  )
}
