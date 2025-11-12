"use client"

import { useAuth } from "./auth-provider"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useToast } from "./toast-provider"

export function ProfileMenu() {
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) return null

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
      showToast("Signed out successfully", "success")
    } catch (error) {
      showToast("Failed to sign out", "error")
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="Open profile menu"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url || "/placeholder.svg"}
            alt={user.name || "Profile"}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-semibold text-primary-foreground text-sm">
            {(user.name || "U").charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium hidden sm:inline">{user.name || user.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-semibold text-foreground">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {user.is_admin && <p className="text-xs text-primary font-semibold mt-1">Admin</p>}
          </div>

          {user.is_admin && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
