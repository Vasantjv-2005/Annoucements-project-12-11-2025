"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Database } from "@/lib/database.types";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ANNOUNCEMENT_TYPES = [
  { emoji: "🚀", label: "New Project Started" },
  { emoji: "💾", label: "Backend Connected" },
  { emoji: "🎨", label: "UI Updated" },
  { emoji: "⚡", label: "Task of the Day" },
  { emoji: "🧩", label: "Bugs Fixed" },
  { emoji: "🧠", label: "Learning Goal Set" },
  { emoji: "🏆", label: "Milestone Reached" },
];

export function AnnouncementDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(ANNOUNCEMENT_TYPES[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  const supabase = getSupabaseClient() as ReturnType<typeof getSupabaseClient> as ReturnType<typeof import("@supabase/ssr").createBrowserClient<Database>> | null;
  const router = useRouter();

  // Warm up auth (avoids a brief “no session” race on first interaction)
  useEffect(() => {
    let mounted = true;
    if (!isSupabaseConfigured() || !supabase) {
      setReady(true);
      return () => {
        mounted = false;
      };
    }
    supabase.auth.getSession().finally(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      toast.error("Supabase not configured. Cannot post announcements.");
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      toast.error("Auth error. Please sign in again.");
      return;
    }
    const session = sessionData?.session;
    if (!session) {
      toast.error("Please sign in to post an announcement");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("announcements")
        .insert({
          user_id: session.user.id,
          type: `${selectedType.emoji} ${selectedType.label}`,
          title: title.trim(),
          description: description.trim() || null,
          progress: Math.min(100, Math.max(0, progress)),
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to create announcement");
        return;
      }

      setTitle("");
      setDescription("");
      setProgress(0);
      setIsOpen(false);
      toast.success("Announcement added successfully!");

      // Re-render the current route to show the new row without navigation
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-4">
          New Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Announcement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Announcement Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ANNOUNCEMENT_TYPES.map((type) => (
                <button
                  key={type.label}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                    selectedType.label === type.label
                      ? "bg-primary/10 border-primary"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-xl mr-2">{type.emoji}</span>
                  <span className="text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's new?"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this update..."
              rows={3}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="progress" className="block text-sm font-medium">
                Progress: {progress}%
              </label>
              <span className="text-xs text-muted-foreground">0% - 100%</span>
            </div>
            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Announcement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AnnouncementDialog;