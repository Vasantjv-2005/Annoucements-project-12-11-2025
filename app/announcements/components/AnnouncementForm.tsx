'use client';

import { useState } from 'react';
import { Database } from '@/lib/database.types';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase-client';

const ANNOUNCEMENT_TYPES = [
  { emoji: '🚀', label: 'New Project Started' },
  { emoji: '💾', label: 'Backend Connected' },
  { emoji: '🎨', label: 'UI Updated' },
  { emoji: '⚡', label: 'Task of the Day' },
  { emoji: '🧩', label: 'Bugs Fixed' },
  { emoji: '🧠', label: 'Learning Goal Set' },
  { emoji: '🏆', label: 'Milestone Reached' },
];

export default function AnnouncementForm({ onSuccess }: { onSuccess: () => void }) {
  const [selectedType, setSelectedType] = useState(ANNOUNCEMENT_TYPES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient() as ReturnType<typeof getSupabaseClient> as ReturnType<typeof import('@supabase/ssr').createBrowserClient<Database>> | null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not configured. Cannot create announcements.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create an announcement');
      }

      const { error } = await supabase.from('announcements').insert({
        user_id: user.id,
        type: `${selectedType.emoji} ${selectedType.label}`,
        title: title.trim(),
        description: description.trim() || null,
        progress: Math.min(100, Math.max(0, progress)),
      });

      if (error) throw error;

      // Reset form
      setTitle('');
      setDescription('');
      setProgress(0);
      onSuccess();
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError(err instanceof Error ? err.message : 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Create New Announcement</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Announcement Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {ANNOUNCEMENT_TYPES.map((type) => (
              <button
                key={type.label}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`flex items-center justify-center p-3 rounded-lg border transition-all ${selectedType.label === type.label 
                  ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' 
                  : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <span className="text-2xl mr-2">{type.emoji}</span>
                <span className="text-sm">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What's new?"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            placeholder="Add more details about this update..."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
              Progress: {progress}%
            </label>
            <span className="text-xs text-gray-500">0% - 100%</span>
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
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Not Started</span>
            <span>In Progress</span>
            <span>Completed</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setDescription('');
              setProgress(0);
              onSuccess();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-70 flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </>
            ) : (
              'Post Announcement'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
