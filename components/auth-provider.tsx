"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { AuthContextType, User } from "@/lib/types"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase-client"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Demo mode: no authentication required
      setLoading(false)
      return
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || "Anonymous",
          avatar_url: session.user.user_metadata?.avatar_url,
          is_admin: session.user.user_metadata?.is_admin || false,
        })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || "Anonymous",
          avatar_url: session.user.user_metadata?.avatar_url,
          is_admin: session.user.user_metadata?.is_admin || false,
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use authentication.",
      )
    }
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use authentication.",
      )
    }
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return // Demo mode, no-op
    }
    const supabase = getSupabaseClient()
    if (!supabase) return

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
