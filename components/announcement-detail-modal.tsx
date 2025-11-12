"use client"

import type { Announcement } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { useAuth } from "./auth-provider"
import { useToast } from "./toast-provider"

interface AnnouncementDetailModalProps {
  announcement: Announcement | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => Promise<void>
  isDeleting?: boolean
}

export function AnnouncementDetailModal({
  announcement,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isDeleting,
}: AnnouncementDetailModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()

  if (!isOpen || !announcement) return null

  const isAuthorOrAdmin = user?.is_admin || user?.id === announcement.author_id

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return

    try {
      if (onDelete) {
        await onDelete(announcement.id)
        onClose()
        showToast("Announcement deleted", "success")
      }
    } catch (error) {
      showToast("Failed to delete announcement", "error")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40 animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground flex-1 truncate">{announcement.title}</h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 ml-4"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {announcement.author?.avatar_url ? (
                <img
                  src={announcement.author.avatar_url || "/placeholder.svg"}
                  alt={announcement.author.name || "Author"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-semibold text-primary-foreground">
                  {(announcement.author?.name || "A").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-foreground">{announcement.author?.name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{formatDate(announcement.created_at)}</p>
              </div>
            </div>
            {!announcement.is_published && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground">Draft</span>
            )}
          </div>

          {announcement.image_url && (
            <img
              src={announcement.image_url || "/placeholder.svg"}
              alt="Announcement"
              className="w-full h-auto max-h-96 object-cover rounded-lg"
            />
          )}

          <div>
            <p className="text-foreground whitespace-pre-wrap">{announcement.message}</p>
          </div>

          {announcement.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {announcement.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {isAuthorOrAdmin && (
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => {
                  onEdit?.(announcement.id)
                  onClose()
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 font-semibold"
                disabled={isDeleting}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity disabled:opacity-50 font-semibold"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
