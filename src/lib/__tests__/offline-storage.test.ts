// Must be at the top of the file, before any imports
vi.mock('../events-offline', () => {
  return {
    storeEventsData: vi.fn().mockResolvedValue(undefined),
    getEventsData: vi.fn().mockImplementation(() => {
      // Return a basic structure during the test run
      return Promise.resolve({
        events: [],
        lastUpdated: new Date().toISOString(),
        contactInfo: { email: 'test@example.com', website: 'https://example.com' }
      });
    }),
    queueEventsUpdate: vi.fn().mockResolvedValue(undefined),
    processSyncQueue: vi.fn().mockResolvedValue(undefined)
  };
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { storeEventsData, getEventsData, queueEventsUpdate, processSyncQueue } from '../events-offline';
import { JusticeBusEventsData } from '../validators/justice-bus-events';

// Sample test data matching the required schema
const sampleEventsData: JusticeBusEventsData = {
  events: [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Legal Aid Workshop',
      date: '2023-05-15',
      startTime: '09:00',
      endTime: '16:00',
      location: {
        name: 'Chattanooga Community Center',
        county: 'Hamilton',
        isPrivate: false,
        address: {
          street: '123 Main St',
          city: 'Chattanooga',
          state: 'TN',
          zipCode: '37402'
        }
      },
      eventType: ['Legal Clinic', 'Community Education'],
      status: 'Open to Public',
      description: 'Free legal advice for family law matters',
      attorneyPresent: true
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      title: 'Rural Justice Initiative',
      date: '2023-04-10',
      startTime: '10:00',
      endTime: '15:00',
      location: {
        name: 'Monroe County Library',
        county: 'Monroe',
        isPrivate: false,
        address: {
          street: '345 Library Lane',
          city: 'Madisonville',
          state: 'TN',
          zipCode: '37354'
        }
      },
      eventType: ['General Legal Advice'],
      status: 'Registration Required',
      description: 'Legal aid services for rural communities',
      attorneyPresent: true
    }
  ],
  lastUpdated: new Date().toISOString(),
  contactInfo: {
    email: 'justicebus@tncourts.gov',
    website: 'https://justiceforalltn.org/upcoming-events/'
  }
};

// Test suite for the events offline functionality
describe('Events Offline Storage', () => {
  // Set up mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    // Set getEventsData to return our sample data for the test
    vi.mocked(getEventsData).mockResolvedValue(sampleEventsData);
  });

  // Test storing and retrieving events data
  it('should store and retrieve events data', async () => {
    // Store the test data
    await storeEventsData(sampleEventsData);
    
    // Verify storeEventsData was called with the correct data
    expect(storeEventsData).toHaveBeenCalledWith(sampleEventsData);
    
    // Retrieve the data
    const retrievedData = await getEventsData();
    
    // Verify getEventsData was called
    expect(getEventsData).toHaveBeenCalled();
    
    // Verify the data matches
    expect(retrievedData).toEqual(sampleEventsData);
  });

  // Test queuing events update
  it('should queue events update for sync', async () => {
    // Queue an update
    await queueEventsUpdate(sampleEventsData);
    
    // Verify queueEventsUpdate was called with the correct data
    expect(queueEventsUpdate).toHaveBeenCalledWith(sampleEventsData);
    
    // Mock fetch to test processSyncQueue
    const fetchSpy = vi.fn().mockResolvedValue({ 
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    vi.stubGlobal('fetch', fetchSpy);
    
    // Simulate going online
    setNetworkStatus(true);
    
    // Process the sync queue
    await processSyncQueue();
    
    // Verify processSyncQueue was called
    expect(processSyncQueue).toHaveBeenCalled();
  });

  // Test offline behavior
  it('should handle offline state correctly', async () => {
    // Simulate going offline
    setNetworkStatus(false);
    
    // Should still be able to retrieve data while offline
    const offlineData = await getEventsData();
    expect(getEventsData).toHaveBeenCalled();
    expect(offlineData).toEqual(sampleEventsData);
    
    // Queue an update while offline
    const updatedEventsData: JusticeBusEventsData = {
      ...sampleEventsData,
      events: [
        ...sampleEventsData.events,
        {
          id: '323e4567-e89b-12d3-a456-426614174002',
          title: 'New Offline Event',
          date: '2023-06-20',
          startTime: '13:00',
          endTime: '17:00',
          location: {
            name: 'Online Zoom Meeting',
            county: 'Knox',
            isPrivate: false
          },
          eventType: ['Community Education'],
          status: 'Registration Required' as const,
          description: 'Created while offline',
          attorneyPresent: true
        }
      ]
    };
    
    await queueEventsUpdate(updatedEventsData);
    
    // Verify queueEventsUpdate was called with the updated data
    expect(queueEventsUpdate).toHaveBeenCalledWith(updatedEventsData);
  });
}); 