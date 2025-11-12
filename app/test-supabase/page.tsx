'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';

export default function TestSupabase() {
  const [connectionStatus, setConnectionStatus] = useState('Checking authentication...');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setConnectionStatus('Error: Supabase client not configured');
          setIsLoading(false);
          return;
        }

        // Check current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          setConnectionStatus('✅ Successfully authenticated!');
        } else {
          setConnectionStatus('Not authenticated. Please sign in below.');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setConnectionStatus('❌ Authentication check failed');
        setAuthError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = getSupabaseClient()?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
        setConnectionStatus('✅ Successfully authenticated!');
        setAuthError(null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setConnectionStatus('Signed out successfully');
      }
    }) || { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      const { error } = await getSupabaseClient()?.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/test-supabase`
        }
      }) || { error: new Error('Supabase client not available') };

      if (error) throw error;
    } catch (error) {
      console.error('Sign in failed:', error);
      setAuthError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await getSupabaseClient()?.auth.signOut() || { error: new Error('Supabase client not available') };
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      setAuthError(error instanceof Error ? error.message : 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Supabase Auth Test</h1>
        
        <div className={`mb-6 p-4 rounded-md ${
          isLoading ? 'bg-blue-50' : 
          connectionStatus.includes('✅') ? 'bg-green-50' : 
          'bg-yellow-50'
        }`}>
          <h2 className="font-medium text-lg mb-2">Authentication Status:</h2>
          <p className={
            connectionStatus.includes('✅') ? 'text-green-600' : 
            connectionStatus.includes('❌') ? 'text-red-600' : 
            'text-yellow-700'
          }>
            {isLoading ? '🔍 Checking...' : connectionStatus}
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 rounded-md">
            <h2 className="font-medium text-lg mb-2 text-red-600">Error:</h2>
            <p className="text-red-600">{authError}</p>
          </div>
        )}

        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="font-medium text-lg mb-2">User Info:</h2>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Redirecting...' : 'Sign in with Google'}
          </button>
        )}
      </div>
    </div>
  );
}