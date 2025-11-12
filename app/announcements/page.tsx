'use client';

import { useEffect, useState } from 'react';
import { Database } from '@/lib/database.types';
import AnnouncementForm from './components/AnnouncementForm';
import AnnouncementList from './components/AnnouncementList';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase-client';

type Announcement = Database['public']['Tables']['announcements']['Row'] & {
  profiles: {
    username: string;
    avatar_url: string;
  } | null;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const supabase = getSupabaseClient() as ReturnType<typeof import('@supabase/ssr').createBrowserClient<Database>> | null;

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setIsLoading(false);
      return;
    }

    fetchAnnouncements();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('announcements_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      if (!isSupabaseConfigured() || !supabase) {
        setAnnouncements([]);
        return;
      }

      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Project Announcements
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="text-lg">+</span> New Announcement
          </button>
        </div>

        {!isSupabaseConfigured() && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable announcements.</p>
          </div>
        )}

        {showForm && (
          <div className="mb-8 animate-fade-in">
            <AnnouncementForm onSuccess={() => setShowForm(false)} />
          </div>
        )}

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500">No announcements yet. Be the first to share an update!</p>
            </div>
          ) : (
            <AnnouncementList announcements={announcements} />
          )}
        </div>
      </div>
    </div>
  );
}
