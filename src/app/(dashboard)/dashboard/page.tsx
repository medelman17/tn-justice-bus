"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Clock, 
  CalendarClock, 
  FileCheck, 
  Briefcase, 
  Users, 
  PlusCircle, 
  ArrowUpRight, 
  Calendar, 
  FileText, 
  Bell, 
  ExternalLink, 
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";

  // Mock data - in production, this would come from the database
  const stats = [
    { 
      title: "Active Cases", 
      value: 5, 
      icon: <Briefcase className="h-6 w-6 text-primary" />,
      change: "+2 this month",
      href: "/dashboard/cases"
    },
    { 
      title: "Upcoming Appointments", 
      value: 3, 
      icon: <CalendarClock className="h-6 w-6 text-indigo-500" />,
      change: "Next: Tomorrow, 10:00 AM",
      href: "/dashboard/appointments"
    },
    { 
      title: "Pending Documents", 
      value: 7, 
      icon: <FileCheck className="h-6 w-6 text-amber-500" />,
      change: "2 require action",
      href: "/dashboard/documents"
    },
    { 
      title: "Justice Bus Visits", 
      value: 2, 
      icon: <Users className="h-6 w-6 text-emerald-500" />,
      change: "Next: July 15",
      href: "/dashboard/appointments"
    },
  ];

  const quickActions = [
    { label: "New Case", icon: <Briefcase className="h-5 w-5" />, href: "/dashboard/cases/new" },
    { label: "Schedule Appointment", icon: <Calendar className="h-5 w-5" />, href: "/dashboard/appointments/new" },
    { label: "Upload Document", icon: <FileText className="h-5 w-5" />, href: "/dashboard/documents/new" },
    { label: "View Notifications", icon: <Bell className="h-5 w-5" />, href: "/dashboard/notifications" },
  ];

  // Mock upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      title: "Initial Consultation",
      date: "Tomorrow",
      time: "10:00 AM",
      type: "Virtual",
      status: "confirmed",
    },
    {
      id: 2,
      title: "Document Review",
      date: "Jul 10, 2025",
      time: "2:30 PM",
      type: "In-person",
      status: "pending",
    },
    {
      id: 3,
      title: "Case Follow-up",
      date: "Jul 15, 2025",
      time: "11:00 AM",
      type: "Virtual",
      status: "confirmed",
    },
  ];

  // Mock recent activity
  const recentActivity = [
    {
      id: 1,
      title: "Document uploaded",
      description: "ID verification document uploaded",
      timestamp: "2 hours ago",
      icon: <FileText className="h-4 w-4 text-primary" />,
    },
    {
      id: 2,
      title: "Appointment scheduled",
      description: "Initial consultation scheduled for tomorrow",
      timestamp: "Yesterday",
      icon: <Calendar className="h-4 w-4 text-indigo-500" />,
    },
    {
      id: 3,
      title: "Case status updated",
      description: "Housing assistance case marked as in progress",
      timestamp: "2 days ago",
      icon: <Briefcase className="h-4 w-4 text-amber-500" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2 rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold">Welcome back, {userName}</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here&apos;s an overview of your current cases and upcoming appointments.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link 
            key={index} 
            href={stat.href}
            className="transform rounded-lg border bg-white p-6 shadow-sm transition duration-300 hover:translate-y-[-4px] hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{stat.change}</p>
              </div>
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-700">
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 text-center transition hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:hover:border-primary"
            >
              <div className="mb-2 rounded-full bg-gray-100 p-2 dark:bg-gray-700">
                {action.icon}
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Upcoming Appointments</h2>
            <Link 
              href="/dashboard/appointments" 
              className="flex items-center text-sm text-primary hover:underline"
            >
              View all <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{appointment.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {appointment.date} at {appointment.time} &bull; {appointment.type}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    appointment.status === "confirmed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {appointment.status === "confirmed" ? "Confirmed" : "Pending"}
                </span>
              </div>
            ))}
            <Link
              href="/dashboard/appointments/new"
              className="flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 p-4 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary dark:border-gray-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule New Appointment
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Link 
              href="/dashboard/activity" 
              className="flex items-center text-sm text-primary hover:underline"
            >
              View all <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex space-x-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex-shrink-0 rounded-full bg-gray-100 p-2 dark:bg-gray-700">
                  {activity.icon}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <span className="mt-1 text-xs text-gray-400">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
