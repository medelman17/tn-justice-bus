"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertTriangle, AlertCircle, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isOnline } from "@/lib/offline-utils";
import { storeOfflineVerificationAttempt, syncOfflineVerificationAttempts } from "@/lib/offline-verification";

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
    .regex(/^[0-9]+$/, { message: "Verification code must contain only numbers" }),
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
      syncOfflineVerificationAttempts().then(count => {
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
      setError(error instanceof Error ? error.message : "Failed to send verification code");
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
        setError("You&apos;re currently offline. Your verification will be processed when you&apos;re back online.");
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
    <>
      {step === "phone" ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} className="space-y-4">
            {error && (
              <Alert variant={isOffline ? "warning" : "destructive"}>
                {isOffline ? <WifiOff /> : <AlertCircle />}
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isOffline && !error && (
              <Alert variant="warning" className="mb-4">
                <WifiOff />
                <AlertDescription>
                  You are currently offline. Verification code request will be queued for when you&apos;re back online.
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(555) 123-4567"
                      type="tel"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending code..." : "Send Verification Code"}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...verificationForm}>
          <form
            onSubmit={verificationForm.handleSubmit(onSubmitVerification)}
            className="space-y-4"
          >
            {error && (
              <Alert variant={isOffline ? "warning" : "destructive"}>
                {isOffline ? <WifiOff /> : <AlertCircle />}
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isOffline && !error && (
              <Alert variant="warning" className="mb-4">
                <WifiOff />
                <AlertDescription>
                  You are currently offline. Your verification attempt will be processed when you&apos;re back online.
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground mb-4">
              We sent a verification code to <strong>{phoneNumber}</strong>. The code will expire in 10 minutes.
              <div className="mt-2 flex gap-4">
                <Button
                  variant="link"
                  type="button"
                  className="p-0 h-auto font-normal"
                  onClick={() => setStep("phone")}
                >
                  Change phone number
                </Button>
                <Button
                  variant="link"
                  type="button"
                  className="p-0 h-auto font-normal"
                  onClick={async () => {
                    setError(null);
                    try {
                      const response = await fetch("/api/auth/send-verification", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ phone: phoneNumber }),
                      });
                      
                      if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error || "Failed to resend code");
                      }
                    } catch (error) {
                      setError(error instanceof Error ? error.message : "Failed to resend code");
                    }
                  }}
                >
                  Resend code
                </Button>
              </div>
            </div>

            <FormField
              control={verificationForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify & Sign In"}
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}
