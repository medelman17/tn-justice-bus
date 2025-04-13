"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
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

const verificationFormSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .min(6, { message: "Verification code must be 6 digits." })
    .max(6, { message: "Verification code must be 6 digits." })
    .regex(/^\d+$/, { message: "Verification code must contain only digits." }),
});

export function EmailSignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "verification">("email");
  const [email, setEmail] = useState("");
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

  // Verification form
  const verificationForm = useForm<z.infer<typeof verificationFormSchema>>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      email: "",
      code: "",
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

      // Set email for verification step
      setEmail(data.email);
      verificationForm.setValue("email", data.email);

      // Move to verification step
      setSuccess("Verification code sent! Check your email inbox.");
      setStep("verification");
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

  // Handle verification submission
  async function onVerificationSubmit(
    data: z.infer<typeof verificationFormSchema>
  ) {
    setIsLoading(true);
    setError(null);

    try {
      // Sign in with email and verification code
      const result = await signIn("email-login", {
        email: data.email,
        code: data.code,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error || "Invalid verification code");
      }

      // Redirect to dashboard on success
      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Error during verification:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during verification."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Handle resend verification code
  async function handleResendCode() {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Resend verification code
      const response = await fetch("/api/auth/send-email-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to resend verification code");
      }

      setSuccess("Verification code resent! Check your email inbox.");
    } catch (err) {
      console.error("Error resending verification code:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred resending the verification code."
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

      {step === "email" ? (
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
      ) : (
        <Form {...verificationForm}>
          <form
            onSubmit={verificationForm.handleSubmit(onVerificationSubmit)}
            className="space-y-4"
          >
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
                      autoComplete="one-time-code"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-gray-500">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                className="text-primary underline"
                onClick={handleResendCode}
                disabled={isLoading}
              >
                Didn&apos;t receive the code? Send again
              </button>
            </div>

            <div className="text-center text-sm">
              <button
                type="button"
                className="text-primary underline"
                onClick={() => setStep("email")}
                disabled={isLoading}
              >
                Use a different email address
              </button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
