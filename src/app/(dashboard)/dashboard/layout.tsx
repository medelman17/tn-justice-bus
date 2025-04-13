"use client";

import React, { useState, ReactNode } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useNotificationInit } from "@/hooks/use-notification-init";
import { 
  LayoutDashboard, 
  UserRound, 
  Briefcase, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Bell 
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

// Wrapper component to handle session checking
function DashboardContent({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const router = useRouter();

  // Initialize notification system
  useNotificationInit();

  // Check if user is authenticated
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <UserRound size={20} />, label: "Profile", href: "/dashboard/profile" },
    { icon: <Briefcase size={20} />, label: "Cases", href: "/dashboard/cases" },
    { icon: <FileText size={20} />, label: "Legal Intake", href: "/dashboard/intake" },
    { icon: <Calendar size={20} />, label: "Events", href: "/dashboard/events" },
    { icon: <Calendar size={20} />, label: "Appointments", href: "/dashboard/appointments" },
    { icon: <FileText size={20} />, label: "Documents", href: "/dashboard/documents" },
    { icon: <Bell size={20} />, label: "Notifications", href: "/dashboard/notifications-test" },
    { icon: <Settings size={20} />, label: "Settings", href: "/dashboard/settings" },
    // Admin section
    { icon: <UserRound size={20} />, label: "User Management", href: "/dashboard/admin/users" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-10 hidden h-full transform border-r border-gray-200 bg-white transition duration-300 dark:border-gray-700 dark:bg-gray-800 md:block ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="flex h-16 items-center justify-between px-4">
              {isSidebarOpen ? (
                <Link href="/dashboard" className="flex items-center">
                  <h1 className="text-xl font-bold text-primary">Justice Bus</h1>
                </Link>
              ) : (
                <Link href="/dashboard" className="flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">JB</span>
                </Link>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <ChevronRight 
                  size={20} 
                  className={`transform transition-transform duration-300 ${isSidebarOpen ? "" : "rotate-180"}`} 
                />
              </button>
            </div>

            <div className="mt-8 px-4">
              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="group flex items-center rounded-md px-2 py-2 text-gray-600 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    <span className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary dark:text-gray-400">
                      {item.icon}
                    </span>
                    {isSidebarOpen && <span>{item.label}</span>}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="mb-4 border-t border-gray-200 px-4 pt-4 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="User avatar"
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <UserRound className="h-full w-full p-1 text-gray-500" />
                  )}
                </div>
              </div>
              {isSidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {session?.user?.name || 'User'}
                  </p>
                  <button
                    onClick={() => router.push('/api/auth/signout')}
                    className="flex items-center text-xs text-gray-500 hover:text-primary dark:text-gray-400"
                  >
                    <LogOut size={14} className="mr-1" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="fixed inset-y-0 left-0 z-20 md:hidden">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="fixed left-4 top-4 z-20 rounded-md bg-primary p-2 text-white shadow-md"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-10 bg-black bg-opacity-50" onClick={() => setIsMobileSidebarOpen(false)} />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-20 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 dark:bg-gray-800 ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex h-16 items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center">
                  <h1 className="text-xl font-bold text-primary">Justice Bus</h1>
                </Link>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-8 px-4">
                <nav className="space-y-2">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="group flex items-center rounded-md px-2 py-2 text-gray-600 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      <span className="mr-3 flex-shrink-0 text-gray-500 group-hover:text-primary dark:text-gray-400">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            <div className="mb-4 border-t border-gray-200 px-4 pt-4 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="User avatar"
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <UserRound className="h-full w-full p-1 text-gray-500" />
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {session?.user?.name || 'User'}
                  </p>
                  <button
                    onClick={() => router.push('/api/auth/signout')}
                    className="flex items-center text-xs text-gray-500 hover:text-primary dark:text-gray-400"
                  >
                    <LogOut size={14} className="mr-1" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <div className="p-4 pt-16 md:p-8 md:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// Main layout component with SessionProvider
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}
