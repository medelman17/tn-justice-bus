"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function EmailSignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: EmailFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn("email", {
        email: values.email,
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to sign in. Please try again.");
      } else {
        // Redirect to verification page or show success message
        router.push("/auth/verify?type=email");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign-in error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending link..." : "Continue with Email"}
        </Button>
      </form>
    </Form>
  );
}
