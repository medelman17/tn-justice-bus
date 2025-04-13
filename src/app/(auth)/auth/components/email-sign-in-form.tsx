"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Form validation schema
const emailFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export function EmailSignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Email form
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle email submission
  async function onEmailSubmit(data: z.infer<typeof emailFormSchema>) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Send verification code
      const response = await fetch("/api/auth/send-email-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send verification code");
      }

      // If we're in development or had a notification error but the code was still created
      if (process.env.NODE_ENV === "development" || result.notificationError) {
        // Show specific message for development environment
        if (process.env.NODE_ENV === "development") {
          setSuccess(
            "Development mode: Verification code can be found in server console. Redirecting..."
          );
        } else if (result.notificationError) {
          // Show message for notification delivery issues
          setSuccess(
            "Verification code created but could not be delivered. Please check with administrator. Redirecting..."
          );
        } else {
          setSuccess(
            "Verification code sent! Redirecting to verification page..."
          );
        }
      } else {
        // Standard success message
        setSuccess(
          "Verification code sent! Redirecting to verification page..."
        );
      }

      // Redirect to the dedicated verification page
      setTimeout(() => {
        router.push(
          `/auth/verify-code?email=${encodeURIComponent(data.email)}`
        );
      }, 1500);
    } catch (err) {
      console.error("Error sending verification code:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred sending the verification code."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success message */}
      {success && (
        <Alert variant="default" className="mb-4 bg-green-50 border-green-500">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Form {...emailForm}>
        <form
          onSubmit={emailForm.handleSubmit(onEmailSubmit)}
          className="space-y-4"
        >
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Verification Code"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
