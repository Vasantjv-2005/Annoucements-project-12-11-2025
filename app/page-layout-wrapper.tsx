"use client"

import type React from "react"

import { AuthProvider } from "@/components/auth-provider"
import { ToastProvider } from "@/components/toast-provider"
import { ToastContainer } from "@/components/toast-container"

export function PageLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  )
}
