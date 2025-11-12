'use client';

import { formatDistanceToNow } from 'date-fns';
import { Database } from '@/lib/database.types';

type Announcement = Database['public']['Tables']['announcements']['Row'] & {
  profiles: {
    username: string;
    avatar_url: string;
  } | null;
};

export default function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getEmoji = (type: string) => {
    // Extract emoji from the type string (first character)
    return type ? type.charAt(0) : '💬';
  };

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div 
          key={announcement.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-2xl">
                  {getEmoji(announcement.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {announcement.title}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                    {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-2">
                  {announcement.type} • 
                  <span className="ml-1 text-blue-600">
                    @{announcement.profiles?.username || 'Anonymous'}
                  </span>
                </p>
                
                {announcement.description && (
                  <p className="text-gray-700 mb-4">
                    {announcement.description}
                  </p>
                )}
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{announcement.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(announcement.progress)}`}
                      style={{ width: `${announcement.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-5 py-3 text-xs text-gray-500 border-t border-gray-100">
            Updated {formatDistanceToNow(new Date(announcement.updated_at), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton loader for when announcements are loading
export function AnnouncementListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="animate-pulse">
            <div className="flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                <div className="h-2 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
