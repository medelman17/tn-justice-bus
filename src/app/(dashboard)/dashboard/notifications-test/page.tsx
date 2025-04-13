import { AppointmentNotificationTester } from "@/components/notifications/ApptNotificationTester";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";

/**
 * Page for testing SMS notifications via Knock
 * This page is accessible only to authenticated users and allows
 * developers to test the SMS integration
 */
export default async function NotificationsTestPage() {
  // Verify user is authenticated
  const session = await auth();
  
  if (!session || !session.user) {
    return redirect("/auth/signin?callbackUrl=/dashboard/notifications-test");
  }
  
  const userId = session.user.id || "unknown-user";
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SMS Notification Testing</h1>
        <p className="text-gray-600">
          Use this page to test SMS notification functionality with Knock.
          Enter a valid phone number to receive test messages.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Note: In production, this tool would only be available to administrators.
        </p>
      </div>
      
      <div className="mb-12">
        <AppointmentNotificationTester userId={userId} />
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">How Notifications Work</h2>
        <p className="mb-2">
          The Tennessee Justice Bus uses Knock to send SMS notifications:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Phone verification codes during authentication</li>
          <li>Appointment reminders before scheduled meetings</li>
          <li>Case status updates when changes occur</li>
          <li>Offline capabilities - notifications queue when offline</li>
        </ul>
        <p className="mt-4 text-sm">
          Notifications support scheduling for future delivery and will
          synchronize automatically when connectivity is restored.
        </p>
      </div>
    </div>
  );
}
