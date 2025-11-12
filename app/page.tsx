"use client"

import { useState, useEffect } from "react"
import type { Announcement } from "@/lib/types"
import { AnnouncementCard } from "@/components/announcement-card"
import { Header } from "@/components/header"
import { ComposeModal, type ComposeFormData } from "@/components/compose-modal"
import { AnnouncementDetailModal } from "@/components/announcement-detail-modal"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/toast-provider"
import { useRouter } from "next/navigation"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase-client"
import type { Database } from "@/lib/database.types"

export default function Home() {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load announcements from Supabase
  useEffect(() => {
    const supabase = getSupabaseClient() as ReturnType<typeof import("@supabase/ssr").createBrowserClient<Database>> | null
    if (loading) return
    if (!isSupabaseConfigured() || !supabase) {
      setAnnouncements([])
      setFilteredAnnouncements([])
      setIsLoading(false)
      return
    }

    let isMounted = true
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false })
        if (error) throw error

        if (!isMounted) return

        const mapped: Announcement[] = (data || []).map((a) => ({
          id: a.id as any,
          title: a.title || "",
          message: (a as any).description || a.type || "",
          author_id: (a as any).user_id || "",
          author: {
            id: (a as any).user_id || "",
            email: "",
            name: undefined,
            is_admin: false,
          },
          tags: [],
          image_url: undefined,
          is_published: true,
          created_at: a.created_at as any,
          updated_at: a.updated_at as any,
        }))

        setAnnouncements(mapped)
        setFilteredAnnouncements(mapped)
      } catch (e) {
        // Keep UI from blocking on error
        setAnnouncements([])
        setFilteredAnnouncements([])
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchAnnouncements()

    // Realtime updates
    const channel = supabase
      .channel("announcements_home")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => fetchAnnouncements(),
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [loading])

  // Filter logic
  useEffect(() => {
    let filtered = announcements

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.message.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter((a) => a.tags.includes(selectedTag))
    }

    setFilteredAnnouncements(filtered)
  }, [announcements, searchQuery, selectedTag])

  const handleCreateAnnouncement = async (data: ComposeFormData) => {
    if (!user) {
      showToast("You must be logged in to create announcements", "error")
      return
    }

    const supabase = getSupabaseClient() as ReturnType<typeof import("@supabase/ssr").createBrowserClient<Database>> | null
    if (!isSupabaseConfigured() || !supabase) {
      showToast("Supabase not configured", "error")
      return
    }

    setIsSubmitting(true)
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData?.session) {
        showToast("Please sign in again", "error")
        return
      }

      const { error } = await supabase
        .from("announcements")
        .insert({
          user_id: sessionData.session.user.id,
          type: "💬 General",
          title: data.title.trim(),
          description: (data.message || "").trim() || null,
          progress: 0,
        })
      if (error) throw error

      showToast("Announcement created successfully", "success")
    } catch (error) {
      showToast("Failed to create announcement", "error")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
      showToast("Announcement deleted", "success")
    } catch (error) {
      showToast("Failed to delete announcement", "error")
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Stay Connected</h1>
          <p className="text-muted-foreground mb-8">Sign in to view and manage announcements</p>
          <button
            onClick={() => router.push("/auth")}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold"
          >
            Sign In
          </button>
        </main>
      </div>
    )
  }

  const allTags = Array.from(new Set(announcements.flatMap((a) => a.tags)))

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedTag || ""}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Announcements Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <div className="grid gap-5 md:gap-6">
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onCardClick={() => setSelectedAnnouncement(announcement)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No announcements found</p>
          </div>
        )}
      </main>

      {/* Modals */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSubmit={handleCreateAnnouncement}
        isLoading={isSubmitting}
      />

      <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        onDelete={handleDeleteAnnouncement}
      />

      {/* Floating Compose Button (Admin only) */}
      {user?.is_admin && (
        <button
          onClick={() => setIsComposeOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center text-2xl animate-in fade-in slide-in-from-bottom-4"
          aria-label="Create new announcement"
        >
          +
        </button>
      )}
    </div>
  )
}
