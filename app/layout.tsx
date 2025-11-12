import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { PageLayoutWrapper } from "./page-layout-wrapper"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Announcement Board",
  description: "Stay informed with real-time announcements",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-3xl opacity-30 bg-[radial-gradient(ellipse_at_center,var(--color-primary)_0%,transparent_60%)]" />
          <div className="pointer-events-none absolute bottom-[-120px] right-[-120px] h-[420px] w-[420px] rounded-full blur-3xl opacity-20 bg-[radial-gradient(ellipse_at_center,var(--color-chart-2)_0%,transparent_60%)]" />
        </div>
        <PageLayoutWrapper>{children}</PageLayoutWrapper>
        <Analytics />
      </body>
    </html>
  )
}
