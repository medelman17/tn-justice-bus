"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-3xl font-bold text-primary">You&apos;re offline</h1>
      <p className="mb-6 max-w-md text-gray-600">
        The Tennessee Justice Bus app requires an internet connection for some features.
        However, you can still access previously loaded information and forms.
      </p>
      
      <div className="mb-8 rounded-lg bg-amber-50 p-4 text-left text-amber-800">
        <h2 className="mb-2 font-semibold">What you can do while offline:</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>View previously loaded cases and information</li>
          <li>Fill out intake forms (they&apos;ll submit when you&apos;re back online)</li>
          <li>Prepare documents for your appointment</li>
          <li>Review legal issue information</li>
        </ul>
      </div>
      
      <Link href="/dashboard">
        <button 
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
}
