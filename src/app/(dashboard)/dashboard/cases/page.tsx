"use client";

import React from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Plus, 
  ChevronRight, 
  FileText, 
  PlusCircle,
  Clock,
  UserRound,
  Calendar
} from "lucide-react";

export default function CasesPage() {
  // Mock data - would come from database in real implementation
  const cases = [
    {
      id: "C2025-001",
      title: "Housing Assistance Application",
      status: "In Progress",
      type: "Housing",
      dateCreated: "Mar 15, 2025",
      lastUpdated: "Apr 10, 2025",
      nextAppointment: "Apr 15, 2025",
      progress: 65,
    },
    {
      id: "C2025-002",
      title: "Family Court Documentation",
      status: "Pending Review",
      type: "Family",
      dateCreated: "Mar 28, 2025",
      lastUpdated: "Apr 11, 2025",
      nextAppointment: "Apr 20, 2025",
      progress: 80,
    },
    {
      id: "C2025-003",
      title: "Benefits Application",
      status: "Awaiting Documents",
      type: "Benefits",
      dateCreated: "Apr 02, 2025",
      lastUpdated: "Apr 10, 2025",
      nextAppointment: "Apr 18, 2025",
      progress: 40,
    },
    {
      id: "C2025-004",
      title: "Immigration Consultation",
      status: "Scheduled",
      type: "Immigration",
      dateCreated: "Apr 08, 2025",
      lastUpdated: "Apr 11, 2025",
      nextAppointment: "Apr 14, 2025",
      progress: 20,
    },
    {
      id: "C2025-005",
      title: "Veterans Benefits",
      status: "Completed",
      type: "Benefits",
      dateCreated: "Feb 15, 2025",
      lastUpdated: "Mar 30, 2025",
      nextAppointment: "None",
      progress: 100,
    }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Pending Review":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "Awaiting Documents":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Scheduled":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <h1 className="text-2xl font-bold">Your Cases</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your legal cases and track their progress
          </p>
        </div>
        <Link
          href="/dashboard/cases/new"
          className="flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Case
        </Link>
      </div>

      {/* Case Cards */}
      <div className="space-y-4">
        {cases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="rounded-lg border bg-white transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold">{caseItem.title}</h3>
                    <span
                      className={`ml-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        caseItem.status
                      )}`}
                    >
                      {caseItem.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Case ID: {caseItem.id} • Type: {caseItem.type}
                  </p>
                </div>
                <Link
                  href={`/dashboard/cases/${caseItem.id}`}
                  className="flex items-center rounded-md text-sm font-medium text-primary transition hover:text-primary/80"
                >
                  View Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{caseItem.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${caseItem.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Created: {caseItem.dateCreated}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Updated: {caseItem.lastUpdated}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Next: {caseItem.nextAppointment}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Link
          href="/dashboard/cases/new"
          className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 p-6 text-center dark:border-gray-700"
        >
          <div className="flex flex-col items-center">
            <PlusCircle className="mb-2 h-10 w-10 text-gray-400" />
            <h3 className="text-lg font-medium">Create New Case</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Add a new legal case to your dashboard
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
