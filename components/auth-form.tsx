"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "./toast-provider"
import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"

type AuthMode = "signin" | "signup"

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === "signin") {
        await signIn(email, password)
        showToast("Signed in successfully", "success")
      } else {
        if (!name.trim()) {
          showToast("Name is required", "error")
          setIsLoading(false)
          return
        }
        await signUp(email, password, name)
        showToast("Account created! Please check your email to confirm.", "success")
      }
      router.push("/")
    } catch (error: any) {
      showToast(error.message || `Failed to ${mode === "signin" ? "sign in" : "create account"}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-8">
          {mode === "signin" ? "Sign in to view announcements" : "Join to stay updated with announcements"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 font-semibold"
          >
            {isLoading ? "Loading..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin")
                setEmail("")
                setPassword("")
                setName("")
              }}
              className="text-primary hover:underline font-semibold"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
