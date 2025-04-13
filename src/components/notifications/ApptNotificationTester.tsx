"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ReminderTiming, Appointment, scheduleAppointmentReminder, sendImmediateAppointmentReminder } from "@/lib/appointments";
import { randomUUID } from "crypto";

// Simple toast implementation since the component doesn't exist yet
type ToastProps = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

const useToast = () => {
  const toast = (props: ToastProps) => {
    console.log(`Toast: ${props.title} - ${props.description}`);
    alert(`${props.title}\n${props.description}`);
  };
  
  return { toast };
};

/**
 * Component for testing appointment notifications
 * This allows sending test notifications to verify the Knock implementation works
 */
export function AppointmentNotificationTester({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("Justice Bus Appointment");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Davidson County Courthouse");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00 AM");
  const [reminderTiming, setReminderTiming] = useState<ReminderTiming>(ReminderTiming.OneDayBefore);
  const [enableNotifications, setEnableNotifications] = useState(true);

  const handleSendImmediate = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to receive the notification",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Create mock appointment
    const appointment: Appointment = {
      id: randomUUID(),
      userId,
      date: new Date(date),
      time,
      location,
      status: "scheduled",
      title,
      description,
      notificationsEnabled: enableNotifications,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create mock user
    const user = {
      id: userId,
      name,
      phoneNumber,
    };

    try {
      // Send immediate notification
      const result = await sendImmediateAppointmentReminder(appointment, user);
      
      if (result.success) {
        toast({
          title: "Notification Sent",
          description: result.message,
        });
      } else {
        toast({
          title: "Notification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to send notification: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to receive the notification",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Create mock appointment
    const appointment: Appointment = {
      id: randomUUID(),
      userId,
      date: new Date(date),
      time,
      location,
      status: "scheduled",
      title,
      description,
      notificationsEnabled: enableNotifications,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create mock user
    const user = {
      id: userId,
      name,
      phoneNumber,
    };

    try {
      // Schedule reminder notification
      const result = await scheduleAppointmentReminder(appointment, user, reminderTiming);
      
      if (result.success) {
        toast({
          title: "Reminder Scheduled",
          description: result.message,
        });
      } else {
        toast({
          title: "Scheduling Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to schedule reminder: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Appointment Notifications</CardTitle>
        <CardDescription>
          Send test notifications to verify Knock SMS integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Recipient Phone Number</Label>
          <Input
            id="phone"
            placeholder="+15551234567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Recipient Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Appointment Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Appointment details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Reminder Timing</Label>
          <RadioGroup 
            value={reminderTiming} 
            onValueChange={(value) => setReminderTiming(value as ReminderTiming)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ReminderTiming.OneHourBefore} id="r1" />
              <Label htmlFor="r1">1 hour before</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ReminderTiming.OneDayBefore} id="r2" />
              <Label htmlFor="r2">1 day before</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ReminderTiming.OneWeekBefore} id="r3" />
              <Label htmlFor="r3">1 week before</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="notifications"
            checked={enableNotifications}
            onCheckedChange={setEnableNotifications}
          />
          <Label htmlFor="notifications">Enable Notifications</Label>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleSendImmediate}
          disabled={loading}
        >
          Send Now
        </Button>
        <Button 
          onClick={handleSchedule}
          disabled={loading}
        >
          Schedule Reminder
        </Button>
      </CardFooter>
    </Card>
  );
}
