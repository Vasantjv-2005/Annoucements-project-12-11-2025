"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useToast } from "./toast-provider"

interface ComposeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ComposeFormData) => Promise<void>
  isLoading?: boolean
}

export interface ComposeFormData {
  title: string
  message: string
  tags: string[]
  image_url?: string
}

export function ComposeModal({ isOpen, onClose, onSubmit, isLoading }: ComposeModalProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [tags, setTags] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      showToast("Title is required", "error")
      return
    }

    if (!message.trim()) {
      showToast("Message is required", "error")
      return
    }

    try {
      const tagList = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      await onSubmit({
        title: title.trim(),
        message: message.trim(),
        tags: tagList,
        image_url: previewUrl || undefined,
      })

      setTitle("")
      setMessage("")
      setTags("")
      setPreviewUrl("")
      onClose()
    } catch (error) {
      showToast("Failed to create announcement", "error")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40 animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Create Announcement</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-foreground mb-2">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
              Message <span className="text-destructive">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter announcement message"
              rows={6}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-semibold text-foreground mb-2">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter comma-separated tags (e.g., urgent, update, news)"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Image (Optional)</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-input bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors disabled:opacity-50"
              >
                Choose Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewUrl("")}
                  className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Preview</p>
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full h-auto max-h-48 rounded-lg border border-border"
                />
              </div>
            )}
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Preview</h3>
            <div className="space-y-2">
              {title && <h4 className="font-bold text-foreground">{title}</h4>}
              {message && <p className="text-sm text-muted-foreground line-clamp-3">{message}</p>}
              {tags && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag)
                    .map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                        #{tag}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-input hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 font-semibold"
            >
              {isLoading ? "Creating..." : "Create Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
