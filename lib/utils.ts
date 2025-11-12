import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return past.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: past.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

export function truncateText(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + "..."
}
