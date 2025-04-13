"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Verification code schema
const verificationSchema = z.object({
  code: z
    .string()
    .min(6, { message: "Verification code must be 6 digits." })
    .max(6, { message: "Verification code must be 6 digits." })
    .regex(/^\d+$/, { message: "Verification code must contain only digits." }),
});

export default function VerifyCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if no email was provided
    if (!email) {
      router.push("/auth/signin");
    }
  }, [email, router]);

  // Verification form
  const form = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  // Handle verification submission
  async function onVerificationSubmit(
    data: z.infer<typeof verificationSchema>
  ) {
    setIsLoading(true);
    setError(null);

    try {
      // Sign in with email and verification code
      const result = await signIn("email-login", {
        email: email,
        code: data.code,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error || "Invalid verification code");
      }

      // Set success message
      setSuccess("Verification successful! Redirecting...");

      // Navigate programmatically after small delay
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
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
    if (!email) return;

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

  if (!email) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container flex h-screen w-full max-w-[500px] flex-col items-center justify-center">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {success && (
            <Alert
              variant="default"
              className="mb-4 bg-green-50 border-green-500"
            >
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onVerificationSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456"
                        maxLength={6}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-sm text-gray-500">
                Enter the 6-digit code sent to your email address. For testing,
                the code is <strong>123456</strong>.
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          </Form>

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
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="outline"
            className="w-full"
            asChild
            disabled={isLoading}
          >
            <Link href="/auth/signin">Back to sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
