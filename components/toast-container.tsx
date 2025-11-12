"use client"

import { useToast } from "./toast-provider"
import { useEffect, useState } from "react"

export function ToastContainer() {
  const { toasts } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 pointer-events-none z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 pointer-events-auto shadow-lg ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
