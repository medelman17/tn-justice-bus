"use client";

import React, { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { DashboardChat } from "@/components/dashboard/DashboardChat";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const [showStats, setShowStats] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  // Show widgets by default on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowStats(true);
        setShowQuickActions(true);
        setShowAppointments(true);
        setShowActivity(true);
      } else {
        setShowStats(false);
        setShowQuickActions(false);
        setShowAppointments(false);
        setShowActivity(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mock data - in production, this would come from the database
  const stats = [
    {
      title: "Active Cases",
      value: 5,
      icon: <Briefcase className="h-6 w-6 text-primary" />,
      change: "+2 this month",
      href: "/dashboard/cases",
    },
    {
      title: "Upcoming Appointments",
      value: 3,
      icon: <CalendarClock className="h-6 w-6 text-indigo-500" />,
      change: "Next: Tomorrow, 10:00 AM",
      href: "/dashboard/appointments",
    },
    {
      title: "Pending Documents",
      value: 7,
      icon: <FileCheck className="h-6 w-6 text-amber-500" />,
      change: "2 require action",
      href: "/dashboard/documents",
    },
    {
      title: "Justice Bus Visits",
      value: 2,
      icon: <Users className="h-6 w-6 text-emerald-500" />,
      change: "Next: July 15",
      href: "/dashboard/appointments",
    },
  ];

  const quickActions = [
    {
      label: "New Case",
      icon: <Briefcase className="h-5 w-5" />,
      href: "/dashboard/cases/new",
    },
    {
      label: "Schedule Appointment",
      icon: <Calendar className="h-5 w-5" />,
      href: "/dashboard/appointments/new",
    },
    {
      label: "Upload Document",
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/documents/new",
    },
    {
      label: "View Notifications",
      icon: <Bell className="h-5 w-5" />,
      href: "/dashboard/notifications",
    },
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
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)]">
      {/* Welcome Section - Keep at top */}
      <div className="flex flex-col space-y-2 rounded-lg border bg-white p-4 md:p-6 dark:border-gray-700 dark:bg-gray-800 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">
            Welcome back, {userName}
          </h1>
          <button
            className="md:hidden rounded-full p-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            onClick={() => {
              const newState = !showStats;
              setShowStats(newState);
              setShowQuickActions(newState);
              setShowAppointments(newState);
              setShowActivity(newState);
            }}
          >
            {showStats ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 hidden md:block">
          Here&apos;s an overview of your current cases and upcoming
          appointments.
        </p>
      </div>

      {/* Main Chat and Widgets Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* Left Side - Chat Interface */}
        <div className="flex-1 flex flex-col overflow-hidden order-2 md:order-1 hidden md:flex">
          <DashboardChat />
        </div>

        {/* Right Side - Floating Widgets */}
        <div className="md:w-80 lg:w-96 space-y-4 overflow-y-auto pb-4 order-1 md:order-2 max-h-[300px] md:max-h-none">
          {/* Stats Widget */}
          <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
            <div
              className="p-3 border-b dark:border-gray-700 flex justify-between items-center cursor-pointer"
              onClick={() => setShowStats(!showStats)}
            >
              <h2 className="font-semibold">Dashboard Stats</h2>
              {showStats ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
            {showStats && (
              <div className="p-3 grid grid-cols-1 gap-3">
                {stats.map((stat, index) => (
                  <Link
                    key={index}
                    href={stat.href}
                    className="flex items-center justify-between p-2 rounded-lg border hover:border-primary hover:bg-primary/5 transition"
                  >
                    <div className="flex items-center">
                      <div className="mr-3 rounded-full bg-gray-100 p-2 dark:bg-gray-700">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{stat.title}</p>
                        <p className="text-xs text-gray-500">{stat.change}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Widget */}
          <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
            <div
              className="p-3 border-b dark:border-gray-700 flex justify-between items-center cursor-pointer"
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              <h2 className="font-semibold">Quick Actions</h2>
              {showQuickActions ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </div>
            {showQuickActions && (
              <div className="p-3 grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-2 text-center transition hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:hover:border-primary"
                  >
                    <div className="mb-1 rounded-full bg-gray-100 p-1 dark:bg-gray-700">
                      {action.icon}
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Appointments Widget */}
          <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
            <div
              className="p-3 border-b dark:border-gray-700 flex justify-between items-center cursor-pointer"
              onClick={() => setShowAppointments(!showAppointments)}
            >
              <h2 className="font-semibold">Upcoming Appointments</h2>
              {showAppointments ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </div>
            {showAppointments && (
              <div className="p-3 space-y-2">
                {upcomingAppointments.slice(0, 2).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-2 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="rounded-full bg-primary/10 p-1 text-primary">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">
                          {appointment.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {appointment.status === "confirmed"
                        ? "Confirmed"
                        : "Pending"}
                    </span>
                  </div>
                ))}
                <Link
                  href="/dashboard/appointments"
                  className="flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 p-2 text-xs font-medium text-gray-500 hover:border-primary hover:text-primary dark:border-gray-700"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  View All Appointments
                </Link>
              </div>
            )}
          </div>

          {/* Activity Widget */}
          <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
            <div
              className="p-3 border-b dark:border-gray-700 flex justify-between items-center cursor-pointer"
              onClick={() => setShowActivity(!showActivity)}
            >
              <h2 className="font-semibold">Recent Activity</h2>
              {showActivity ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </div>
            {showActivity && (
              <div className="p-3 space-y-2">
                {recentActivity.slice(0, 2).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex space-x-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700"
                  >
                    <div className="flex-shrink-0 rounded-full bg-gray-100 p-1 dark:bg-gray-700">
                      {activity.icon}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-medium">{activity.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.description}
                      </p>
                      <span className="mt-0.5 text-xs text-gray-400">
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                <Link
                  href="/dashboard/activity"
                  className="flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 p-2 text-xs font-medium text-gray-500 hover:border-primary hover:text-primary dark:border-gray-700"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  View All Activity
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
