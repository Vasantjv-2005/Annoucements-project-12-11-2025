import { createBrowserClient } from "@supabase/ssr"

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null
let isConfigured = false

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      isConfigured = false
      // Return null to indicate demo mode
      return null as any
    }

    isConfigured = true
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseKey)
  }

  return supabaseInstance
}

export function isSupabaseConfigured() {
  // Ensure we check on first call
  if (supabaseInstance === null && !isConfigured) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    isConfigured = !!(supabaseUrl && supabaseKey)
  }
  return isConfigured
}
