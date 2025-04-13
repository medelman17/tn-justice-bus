"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Save,
  Edit
} from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data - in a real app, this would come from the database
  const [userData, setUserData] = useState({
    name: session?.user?.name || "John Doe",
    email: session?.user?.email || "john.doe@example.com",
    phone: session?.user?.phone || "(555) 123-4567",
    address: "123 Main St, Nashville, TN 37203",
    dateOfBirth: "1985-05-15",
    preferredContact: "Email",
    lastLogin: "April 12, 2025, 9:30 AM",
    accountCreated: "January 10, 2025",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, save changes to the database
    setIsEditing(false);
    // Show success notification
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2 rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Information */}
        <div className="col-span-2 rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/20"
            >
              {isEditing ? (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="mr-1.5 h-4 w-4" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      aria-label="Full Name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      aria-label="Email Address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Phone Number</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      aria-label="Phone Number"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Address</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={userData.address}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      aria-label="Address"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Date of Birth</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={userData.dateOfBirth}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      aria-label="Date of Birth"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Preferred Contact Method</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Shield className="h-4 w-4" />
                    </div>
                    <select
                      name="preferredContact"
                      value={userData.preferredContact}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      aria-label="Preferred Contact Method"
                    >
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="Text">Text Message</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                  <p className="mt-1 flex items-center text-sm">
                    <User className="mr-2 h-4 w-4 text-gray-400" />
                    {userData.name}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                  <p className="mt-1 flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    {userData.email}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                  <p className="mt-1 flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    {userData.phone}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="mt-1 flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                    {userData.address}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                  <p className="mt-1 flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                    {new Date(userData.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Preferred Contact</h3>
                  <p className="mt-1 flex items-center text-sm">
                    <Shield className="mr-2 h-4 w-4 text-gray-400" />
                    {userData.preferredContact}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Information */}
        <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-xl font-semibold">Account Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
              <p className="mt-1 text-sm">{userData.lastLogin}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
              <p className="mt-1 text-sm">{userData.accountCreated}</p>
            </div>
            <div className="pt-4">
              <h3 className="text-sm font-medium text-gray-500">Security Options</h3>
              <div className="mt-3 flex flex-col space-y-2">
                <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                  Change Password
                </button>
                <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                  Two-Factor Authentication
                </button>
                <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                  Notification Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
