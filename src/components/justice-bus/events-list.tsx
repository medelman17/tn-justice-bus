"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, ClockIcon, UserIcon } from "lucide-react";
import { JusticeBusEventsData } from "@/lib/validators/justice-bus-events";
import { getEventsData, storeEventsData } from "@/lib/events-offline";

/**
 * Component to display Justice Bus events in a card list.
 * Supports both online and offline mode.
 */
export function JusticeBusEventsList() {
  const [eventsData, setEventsData] = useState<JusticeBusEventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Monitor online status
  useEffect(() => {
    function handleOnlineChange() {
      setIsOffline(!navigator.onLine);
    }

    window.addEventListener("online", handleOnlineChange);
    window.addEventListener("offline", handleOnlineChange);

    return () => {
      window.removeEventListener("online", handleOnlineChange);
      window.removeEventListener("offline", handleOnlineChange);
    };
  }, []);

  // Fetch events data
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);

      try {
        if (navigator.onLine) {
          // Online: Fetch from API
          const response = await fetch("/api/events");
          
          if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status}`);
          }
          
          const data = await response.json() as JusticeBusEventsData;
          setEventsData(data);
          
          // Store in IndexedDB for offline use
          await storeEventsData(data);
        } else {
          // Offline: Get from IndexedDB
          const offlineData = await getEventsData();
          setEventsData(offlineData);
          
          if (!offlineData) {
            setError("No cached events data available offline");
          }
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err instanceof Error ? err.message : "Failed to load events");
        
        // Attempt to load from offline storage as fallback
        try {
          const offlineData = await getEventsData();
          if (offlineData) {
            setEventsData(offlineData);
            setError("Using cached data - some information may be outdated");
          }
        } catch (offlineErr) {
          console.error("Failed to load offline data:", offlineErr);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [isOffline]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    // Convert from 24-hour format "HH:MM" to display time
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Determine event status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open to Public":
        return "bg-green-500 hover:bg-green-600";
      case "Registration Required":
        return "bg-blue-500 hover:bg-blue-600";
      case "Registration Closed":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Closed to Public":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !eventsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="text-xl font-semibold text-red-500">Failed to load events</div>
        <div className="text-gray-500">{error}</div>
      </div>
    );
  }

  if (!eventsData || eventsData.events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="text-xl font-semibold">No upcoming events found</div>
        <div className="text-gray-500">
          Check back later for new Justice Bus events in your area
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded shadow">
          <div className="flex items-center">
            <div className="py-1">
              <svg
                className="fill-current h-6 w-6 text-yellow-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">You are viewing events in offline mode</p>
              <p className="text-sm">
                This information was cached on {new Date(eventsData.lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded shadow">
          <p className="font-bold">Warning</p>
          <p>{error}</p>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Upcoming Justice Bus Events</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventsData.events.map((event) => (
          <Card key={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-bold">{event.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {formatDate(event.date)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4 pb-0">
              <div className="mb-3 flex items-start">
                <MapPinIcon className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">{event.location.name}</p>
                  <p className="text-sm text-gray-500">{event.location.county} County</p>
                  {event.location.address && (
                    <p className="text-sm text-gray-500">
                      {event.location.address.street}, {event.location.address.city}, {event.location.address.state} {event.location.address.zipCode}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mb-3 flex items-center">
                <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
              </div>

              {event.organizer && (
                <div className="mb-3 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{event.organizer}</span>
                </div>
              )}
              
              <div className="mb-3">
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                  
                  {event.eventType.map((type) => (
                    <Badge key={type} variant="outline">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {event.description && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t p-4 mt-2">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              
              {event.registrationUrl && (
                <Button size="sm">
                  Register
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
