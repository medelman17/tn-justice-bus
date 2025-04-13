import {
  KnockRecipient,
  NotificationPayload,
  WORKFLOWS,
  triggerWorkflowWithOfflineSupport,
} from "@/lib/knock";

/**
 * Appointment interface
 */
export interface Appointment {
  id: string;
  userId: string;
  date: Date;
  time: string;
  location: string;
  status: "scheduled" | "confirmed" | "canceled" | "completed";
  title: string;
  description?: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Appointment reminder timing options
 */
export enum ReminderTiming {
  OneHourBefore = "1hour",
  OneDayBefore = "1day",
  OneWeekBefore = "1week",
}

/**
 * Schedule an appointment reminder notification
 * @param appointment The appointment to send a reminder for
 * @param user The user to send the reminder to
 * @param timing When to send the reminder
 * @returns Promise with notification status
 */
export async function scheduleAppointmentReminder(
  appointment: Appointment,
  user: {
    id: string;
    name?: string;
    phoneNumber?: string;
    email?: string;
  },
  timing: ReminderTiming = ReminderTiming.OneDayBefore
): Promise<{ success: boolean; message: string }> {
  try {
    if (!appointment.notificationsEnabled) {
      return {
        success: false,
        message: "Notifications are disabled for this appointment",
      };
    }

    if (!user.phoneNumber && !user.email) {
      return {
        success: false,
        message: "User has no contact information for notifications",
      };
    }

    // Calculate scheduled time based on timing
    const appointmentDate = new Date(appointment.date);
    const reminderDate = new Date(appointmentDate);

    switch (timing) {
      case ReminderTiming.OneHourBefore:
        reminderDate.setHours(reminderDate.getHours() - 1);
        break;
      case ReminderTiming.OneDayBefore:
        reminderDate.setDate(reminderDate.getDate() - 1);
        break;
      case ReminderTiming.OneWeekBefore:
        reminderDate.setDate(reminderDate.getDate() - 7);
        break;
    }

    // Format dates for display
    const formattedAppointmentDate = appointmentDate.toLocaleDateString();
    const formattedAppointmentTime = appointment.time;

    // Format reminder time for feedback message
    let reminderText: string;
    switch (timing) {
      case ReminderTiming.OneHourBefore:
        reminderText = "1 hour before";
        break;
      case ReminderTiming.OneDayBefore:
        reminderText = "1 day before";
        break;
      case ReminderTiming.OneWeekBefore:
        reminderText = "1 week before";
        break;
    }

    // Prepare recipient
    const recipient: KnockRecipient = {
      id: user.id,
      phone_number: user.phoneNumber,
      email: user.email,
      name: user.name,
    };

    // Prepare payload
    const payload: NotificationPayload = {
      recipients: [recipient],
      data: {
        appointment_id: appointment.id,
        appointment_title: appointment.title,
        appointment_description: appointment.description || "",
        appointment_date: formattedAppointmentDate,
        appointment_time: formattedAppointmentTime,
        appointment_location: appointment.location,
        user_name: user.name || "client",
      },
    };

    // Schedule the notification for the calculated reminder time
    const result = await triggerWorkflowWithOfflineSupport(
      WORKFLOWS.APPOINTMENT_REMINDER,
      payload,
      {
        scheduledAt: reminderDate.toISOString(),
      }
    );

    return {
      success: true,
      message: `Appointment reminder scheduled for ${reminderText}`,
    };
  } catch (error) {
    console.error("Error scheduling appointment reminder:", error);
    return {
      success: false,
      message: `Failed to schedule reminder: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Send an immediate appointment reminder
 * @param appointment The appointment to send a reminder for
 * @param user The user to send the reminder to
 * @returns Promise with notification status
 */
export async function sendImmediateAppointmentReminder(
  appointment: Appointment,
  user: {
    id: string;
    name?: string;
    phoneNumber?: string;
    email?: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    if (!appointment.notificationsEnabled) {
      return {
        success: false,
        message: "Notifications are disabled for this appointment",
      };
    }

    if (!user.phoneNumber && !user.email) {
      return {
        success: false,
        message: "User has no contact information for notifications",
      };
    }

    // Format dates for display
    const formattedAppointmentDate = new Date(
      appointment.date
    ).toLocaleDateString();
    const formattedAppointmentTime = appointment.time;

    // Prepare recipient
    const recipient: KnockRecipient = {
      id: user.id,
      phone_number: user.phoneNumber,
      email: user.email,
      name: user.name,
    };

    // Prepare payload
    const payload: NotificationPayload = {
      recipients: [recipient],
      data: {
        appointment_id: appointment.id,
        appointment_title: appointment.title,
        appointment_description: appointment.description || "",
        appointment_date: formattedAppointmentDate,
        appointment_time: formattedAppointmentTime,
        appointment_location: appointment.location,
        user_name: user.name || "client",
        is_immediate: true,
      },
    };

    // Send the notification immediately
    const result = await triggerWorkflowWithOfflineSupport(
      WORKFLOWS.APPOINTMENT_REMINDER,
      payload
    );

    return {
      success: true,
      message: "Appointment reminder sent",
    };
  } catch (error) {
    console.error("Error sending immediate appointment reminder:", error);
    return {
      success: false,
      message: `Failed to send reminder: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Send a notification about an appointment status change
 * @param appointment The appointment with the status change
 * @param user The user to notify
 * @param previousStatus The previous appointment status
 * @returns Promise with notification status
 */
export async function sendAppointmentStatusUpdate(
  appointment: Appointment,
  user: {
    id: string;
    name?: string;
    phoneNumber?: string;
    email?: string;
  },
  previousStatus: Appointment["status"]
): Promise<{ success: boolean; message: string }> {
  try {
    if (!appointment.notificationsEnabled) {
      return {
        success: false,
        message: "Notifications are disabled for this appointment",
      };
    }

    if (!user.phoneNumber && !user.email) {
      return {
        success: false,
        message: "User has no contact information for notifications",
      };
    }

    // Format dates for display
    const formattedAppointmentDate = new Date(
      appointment.date
    ).toLocaleDateString();
    const formattedAppointmentTime = appointment.time;

    // Prepare recipient
    const recipient: KnockRecipient = {
      id: user.id,
      phone_number: user.phoneNumber,
      email: user.email,
      name: user.name,
    };

    // Get status message
    let statusMessage: string;
    switch (appointment.status) {
      case "confirmed":
        statusMessage = "Your appointment has been confirmed.";
        break;
      case "canceled":
        statusMessage = "Your appointment has been canceled.";
        break;
      case "completed":
        statusMessage = "Your appointment has been marked as completed.";
        break;
      default:
        statusMessage = `Your appointment status has changed from ${previousStatus} to ${appointment.status}.`;
    }

    // Prepare payload
    const payload: NotificationPayload = {
      recipients: [recipient],
      data: {
        appointment_id: appointment.id,
        appointment_title: appointment.title,
        appointment_date: formattedAppointmentDate,
        appointment_time: formattedAppointmentTime,
        appointment_location: appointment.location,
        user_name: user.name || "client",
        status_message: statusMessage,
        new_status: appointment.status,
        previous_status: previousStatus,
      },
    };

    // Send the notification
    const result = await triggerWorkflowWithOfflineSupport(
      WORKFLOWS.CASE_STATUS_UPDATE,
      payload
    );

    return {
      success: true,
      message: "Appointment status update notification sent",
    };
  } catch (error) {
    console.error("Error sending appointment status update:", error);
    return {
      success: false,
      message: `Failed to send status update: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
