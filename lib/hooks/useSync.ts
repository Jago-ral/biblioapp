import { useEffect, useState } from 'react';
import { db, SyncAction } from '../db';
import { useQueryClient } from '@tanstack/react-query';

export function useSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Try sync on mount if online
    if (navigator.onLine) {
        processSyncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processSyncQueue = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const queue = await db.syncQueue.toArray();
      if (queue.length === 0) {
        setIsSyncing(false);
        return;
      }

      console.log(`Processing ${queue.length} offline actions...`);

      for (const action of queue) {
        let success = false;
        try {
            if (action.type === 'ADD_BOOK') {
                const res = await fetch('/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(action.payload)
                });
                if (res.ok) success = true;
            } else if (action.type === 'UPDATE_PROGRESS') {
                const res = await fetch('/api/user/books', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(action.payload)
                });
                if (res.ok) success = true;
            }
        } catch (err) {
            console.error("Sync failed for action", action, err);
        }

        if (success && action.id) {
            await db.syncQueue.delete(action.id);
        }
      }

      // Invalidate queries to refresh UI with server data
      queryClient.invalidateQueries({ queryKey: ['userBooks'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });

    } catch (error) {
      console.error("Sync process error", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addToQueue = async (type: 'ADD_BOOK' | 'UPDATE_PROGRESS', payload: any) => {
    await db.syncQueue.add({
        type,
        payload,
        createdAt: Date.now()
    });
    // If we are actually online but maybe request failed or we just want to try immediately
    if (isOnline) {
        processSyncQueue();
    }
  };

  return { isOnline, isSyncing, addToQueue };
}
