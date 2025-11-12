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
      className="w-full text-left bg-card/95 hover:bg-card transition-colors rounded-xl p-6 border border-border hover:border-ring/50 shadow-sm hover:shadow-lg duration-200 will-change-transform ease-out hover:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="text-lg font-semibold tracking-tight text-foreground line-clamp-2 flex-1">{announcement.title}</h3>
        {!announcement.is_published && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground ring-1 ring-border whitespace-nowrap">
            Draft
          </span>
        )}
      </div>

      <p className="text-muted-foreground/90 text-sm mb-5 leading-relaxed line-clamp-3">{truncateText(announcement.message, 200)}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {announcement.tags.map((tag) => (
          <span
            key={tag}
            className="text-[11px] px-2.5 py-1 rounded-full bg-secondary/70 hover:bg-secondary text-secondary-foreground font-medium transition-colors ring-1 ring-border/80"
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
              className="w-6 h-6 rounded-full bg-secondary ring-1 ring-border object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center font-semibold text-[11px] ring-1 ring-border">
              {(announcement.author?.name || "A").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-foreground/90">{announcement.author?.name || "Unknown"}</span>
        </div>
        <span className="tabular-nums text-muted-foreground/90">{formatDate(announcement.created_at)}</span>
      </div>
    </button>
  )
}
