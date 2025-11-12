"use client"

import type { Announcement } from "@/lib/types"
import { formatDate, truncateText } from "@/lib/utils"

interface AnnouncementCardProps {
  announcement: Announcement
  onCardClick?: (id: string) => void
}

export function AnnouncementCard({ announcement, onCardClick }: AnnouncementCardProps) {
  return (
    <button
      onClick={() => onCardClick?.(announcement.id)}
      className="w-full text-left bg-card hover:shadow-md transition-shadow duration-200 rounded-xl p-6 border border-border animate-in fade-in"
    >
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="text-lg font-bold text-foreground line-clamp-2 flex-1">{announcement.title}</h3>
        {!announcement.is_published && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
            Draft
          </span>
        )}
      </div>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{truncateText(announcement.message, 200)}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {announcement.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {announcement.author?.avatar_url ? (
            <img
              src={announcement.author.avatar_url || "/placeholder.svg"}
              alt={announcement.author.name || "Author"}
              className="w-6 h-6 rounded-full bg-secondary"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center font-semibold text-xs">
              {(announcement.author?.name || "A").charAt(0).toUpperCase()}
            </div>
          )}
          <span>{announcement.author?.name || "Unknown"}</span>
        </div>
        <span>{formatDate(announcement.created_at)}</span>
      </div>
    </button>
  )
}
