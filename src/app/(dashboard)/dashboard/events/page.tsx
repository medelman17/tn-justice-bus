

import React from "react";
import { JusticeBusEventsList } from "@/components/justice-bus/events-list";

export default function EventsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Justice Bus Events</h1>
      <p className="text-gray-600 mb-8">
        View upcoming Justice Bus events in your area. These events provide free legal services
        to residents in rural and underserved communities across Tennessee.
      </p>
      
      <JusticeBusEventsList />
    </div>
  );
}
