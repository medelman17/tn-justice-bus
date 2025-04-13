/**
 * Justice Bus Events Store
 * 
 * Handles storage and retrieval of events data in an offline-first manner.
 * Since events data rarely changes, this implementation prioritizes simplicity
 * and reliability over complex synchronization.
 */

// Types
export interface JusticeBusEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  organizerId: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  capacity: number;
  attendees?: string[]; // Array of user IDs
  lastSyncedAt?: string;
}

// Storage key
const EVENTS_STORAGE_KEY = 'justice_bus_events';

/**
 * Fetches events from the server and updates the local cache
 * @returns Promise resolving to array of events
 */
export async function fetchAndCacheEvents(): Promise<JusticeBusEvent[]> {
  try {
    // Only fetch if online
    if (navigator.onLine) {
      const response = await fetch('/api/events');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }
      
      const events = await response.json();
      
      // Add last synced timestamp
      const eventsWithTimestamp = events.map((event: JusticeBusEvent) => ({
        ...event,
        lastSyncedAt: new Date().toISOString()
      }));
      
      // Store in localStorage
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(eventsWithTimestamp));
      
      return eventsWithTimestamp;
    } else {
      // If offline, return cached events
      return getLocalEvents();
    }
  } catch (error) {
    console.error('Error fetching and caching events:', error);
    
    // Fallback to local events on error
    return getLocalEvents();
  }
}

/**
 * Gets all events from local storage
 * @returns Array of events
 */
export function getLocalEvents(): JusticeBusEvent[] {
  try {
    const eventsJson = localStorage.getItem(EVENTS_STORAGE_KEY);
    return eventsJson ? JSON.parse(eventsJson) : [];
  } catch (error) {
    console.error('Error reading events from localStorage:', error);
    return [];
  }
}

/**
 * Gets a single event by ID from local storage
 * @param id Event ID
 * @returns Event object or null if not found
 */
export function getEventById(id: string): JusticeBusEvent | null {
  try {
    const events = getLocalEvents();
    return events.find(event => event.id === id) || null;
  } catch (error) {
    console.error(`Error getting event with ID ${id}:`, error);
    return null;
  }
}

/**
 * Updates a local event (for rare cases when event data changes)
 * @param event Updated event data
 * @returns Promise resolving to boolean success status
 */
export async function updateEvent(event: JusticeBusEvent): Promise<boolean> {
  try {
    // First try to sync with server if online
    if (navigator.onLine) {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.statusText}`);
      }
    }
    
    // Update local storage regardless of online status
    const events = getLocalEvents();
    const updatedEvents = events.map(e => 
      e.id === event.id ? { ...event, lastSyncedAt: new Date().toISOString() } : e
    );
    
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
    
    return true;
  } catch (error) {
    console.error(`Error updating event with ID ${event.id}:`, error);
    
    // If we're offline, still update locally for later sync
    if (!navigator.onLine) {
      const events = getLocalEvents();
      const updatedEvents = events.map(e => 
        e.id === event.id ? { ...event, lastSyncedAt: new Date().toISOString() } : e
      );
      
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
      return true;
    }
    
    return false;
  }
}

/**
 * Initial loader function to be called on app start
 * Checks if events need refreshing based on age of data
 */
export async function initializeEventsStore(): Promise<void> {
  // Check if we have events data and when it was last updated
  const events = getLocalEvents();
  const now = new Date();
  
  // If we have no events or data is older than 24 hours, refresh
  const shouldRefresh = !events.length || !events[0]?.lastSyncedAt || 
    (now.getTime() - new Date(events[0].lastSyncedAt).getTime() > 24 * 60 * 60 * 1000);
  
  if (shouldRefresh && navigator.onLine) {
    await fetchAndCacheEvents();
  }
}

/**
 * Registers event sync listener for when app comes back online
 */
export function registerEventsSyncListener(): void {
  window.addEventListener('online', async () => {
    console.log('Back online, checking for events updates...');
    await fetchAndCacheEvents();
  });
} 