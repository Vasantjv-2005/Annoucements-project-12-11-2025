"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Announcement } from "@/lib/types"
import { Header } from "@/components/header"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/toast-provider"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user?.is_admin) {
        router.push("/")
        return
      }

      // Mock data - replace with actual API
      setTimeout(() => {
        const mockAnnouncements: Announcement[] = [
          {
            id: "1",
            title: "Welcome to Announcement Board",
            message: "This is the first announcement to get you started.",
            author_id: "author-1",
            author: {
              id: "author-1",
              email: "admin@example.com",
              name: "Admin User",
              is_admin: true,
            },
            tags: ["welcome", "info"],
            is_published: true,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
        ]
        setAnnouncements(mockAnnouncements)
        setIsLoading(false)
      }, 500)
    }
  }, [loading, user, router])

  const togglePublish = (id: string) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, is_published: !a.is_published } : a)))
    showToast("Announcement updated", "success")
  }

  const deleteAnnouncement = (id: string) => {
    if (!window.confirm("Delete this announcement?")) return
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    showToast("Announcement deleted", "success")
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user?.is_admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Author</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="px-6 py-4 text-sm text-foreground font-medium truncate max-w-xs">
                      {announcement.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{announcement.author?.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          announcement.is_published
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                        }`}
                      >
                        {announcement.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(announcement.created_at)}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => togglePublish(announcement.id)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-secondary hover:opacity-80 transition-opacity text-secondary-foreground"
                      >
                        {announcement.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-destructive/20 text-destructive hover:opacity-80 transition-opacity"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No announcements yet</p>
          </div>
        )}
      </main>
    </div>
  )
}
