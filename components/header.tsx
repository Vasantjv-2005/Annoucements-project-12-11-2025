"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { ProfileMenu } from "./profile-menu";
import { AnnouncementDialog } from "./AnnouncementDialog";

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 select-none">
            <span className="text-xl font-semibold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-(--color-chart-2) to-(--color-chart-4)">
              Announcement Board
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/90 text-foreground/60"
            >
              All Announcements
            </Link>
            <Link
              href="/authors"
              className="transition-colors hover:text-foreground/90 text-foreground/60"
            >
              All Authors
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {!loading && user && <AnnouncementDialog />}
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <ProfileMenu />
          ) : (
            <Link
              href="/auth"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-px transition-all font-semibold text-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;