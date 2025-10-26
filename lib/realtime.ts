/**
 * Real-time subscriptions setup for SuperNetworkAI
 * Handles live updates for messages, notifications, and connection requests
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Subscribe to new messages for current user
 */
export function subscribeToMessages(
  userId: string,
  onMessage: (message: any) => void
) {
  return supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        onMessage(payload.new)
      }
    )
    .subscribe()
}

/**
 * Subscribe to connection requests for current user
 */
export function subscribeToConnectionRequests(
  userId: string,
  onRequest: (connection: any) => void
) {
  return supabase
    .channel('connections')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'connections',
        filter: `user_id_2=eq.${userId}`,
      },
      (payload) => {
        onRequest(payload.new)
      }
    )
    .subscribe()
}

/**
 * Subscribe to notifications for current user
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: any) => void
) {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new)
      }
    )
    .subscribe()
}

/**
 * Subscribe to connection status updates (accept/decline)
 */
export function subscribeToConnectionUpdates(
  userId: string,
  onUpdate: (connection: any) => void
) {
  return supabase
    .channel('connection-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'connections',
        filter: `initiated_by=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()
}

/**
 * Unsubscribe from all channels
 */
export function unsubscribeAll() {
  supabase.removeAllChannels()
}

/**
 * Example usage in a React component:
 *
 * useEffect(() => {
 *   if (!user) return
 *
 *   const messageSubscription = subscribeToMessages(user.id, (message) => {
 *     console.log('New message:', message)
 *     // Update UI with new message
 *   })
 *
 *   const notificationSubscription = subscribeToNotifications(user.id, (notification) => {
 *     console.log('New notification:', notification)
 *     // Show toast notification
 *   })
 *
 *   return () => {
 *     messageSubscription.unsubscribe()
 *     notificationSubscription.unsubscribe()
 *   }
 * }, [user])
 */
