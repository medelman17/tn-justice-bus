"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  AlertCircle,
  WifiOff,
  LoaderCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isOnline } from "@/lib/offline/offline-utils";
import {
  storeOfflineVerificationAttempt,
  syncOfflineVerificationAttempts,
} from "@/lib/offline/offline-verification";

// Step 1: Enter phone number
const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number" }),
});

// Step 2: Enter verification code
const verificationSchema = z.object({
  code: z
    .string()
    .min(6, { message: "Verification code must be at least 6 digits" })
    .regex(/^[0-9]+$/, {
      message: "Verification code must contain only numbers",
    }),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type VerificationFormValues = z.infer<typeof verificationSchema>;

export function PhoneSignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"phone" | "verification">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  // Track online status
  useEffect(() => {
    // Set initial online status
    setIsOffline(!isOnline());

    // Add event listeners to update status
    const handleOnline = () => {
      setIsOffline(false);
      // Try to process any pending verification attempts
      syncOfflineVerificationAttempts().then((count) => {
        if (count > 0) {
          console.log(`Processed ${count} offline verification attempts`);
        }
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmitPhone(values: PhoneFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Send verification code to phone number
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: values.phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }

      // Store phone number and move to verification step
      setPhoneNumber(values.phone);
      setStep("verification");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code"
      );
      console.error("Phone verification error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmitVerification(values: VerificationFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isOffline) {
        // If offline, store the verification attempt for later
        await storeOfflineVerificationAttempt(phoneNumber, values.code);

        // Show offline message but keep on verification page
        setError(
          "You&apos;re currently offline. Your verification will be processed when you&apos;re back online."
        );
        setIsSubmitting(false);
      } else {
        // If online, process normally
        const result = await signIn("credentials", {
          phone: phoneNumber,
          code: values.code,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid verification code. Please try again.");
        } else {
          // Successfully logged in, redirect to dashboard or home
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Verification error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      {step === "phone" ? (
        <Form {...phoneForm}>
          <form
            onSubmit={phoneForm.handleSubmit(onSubmitPhone)}
            className="space-y-6"
          >
            {error && (
              <Alert
                variant={isOffline ? "warning" : "destructive"}
                className="mb-6"
              >
                {isOffline ? (
                  <WifiOff className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isOffline && !error && (
              <Alert variant="warning" className="mb-6">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  You are currently offline. Verification code request will be
                  queued for when you&apos;re back online.
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="font-medium">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="(555) 123-4567"
                      autoComplete="tel"
                      disabled={isSubmitting || isOffline}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting || isOffline}
              className="w-full h-11 font-medium"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...verificationForm}>
          <form
            onSubmit={verificationForm.handleSubmit(onSubmitVerification)}
            className="space-y-6"
          >
            {error && (
              <Alert
                variant={isOffline ? "warning" : "destructive"}
                className="mb-6"
              >
                {isOffline ? (
                  <WifiOff className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 mb-2">
              <p className="text-sm font-medium">
                Enter the verification code sent to {phoneNumber}
              </p>
              <Link
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  setStep("phone");
                }}
                className="text-xs text-primary hover:underline"
              >
                Change phone number
              </Link>
            </div>

            <FormField
              control={verificationForm.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="font-medium">
                    Verification Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="123456"
                      className="h-11"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 font-medium"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
