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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Import the necessary types without using the enum directly
import type { PreferredContactMethod } from "@/types/app";

// Sign up form schema
const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number" })
    .optional(),
  preferredContactMethod: z.enum(["email", "phone", "sms"]),
});

// Require email if preferred contact method is email, phone if method is phone or text
const refinedSignUpSchema = signUpSchema
  .refine(
    (data) => {
      if (data.preferredContactMethod === "email") {
        return !!data.email;
      }
      return true;
    },
    {
      message: "Email address is required for email contact method",
      path: ["email"],
    }
  )
  .refine(
    (data) => {
      if (
        data.preferredContactMethod === "phone" ||
        data.preferredContactMethod === "sms"
      ) {
        return !!data.phone;
      }
      return true;
    },
    {
      message: "Phone number is required for phone/text contact method",
      path: ["phone"],
    }
  );

type SignUpFormValues = z.infer<typeof refinedSignUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactMethod, setContactMethod] = useState<string>("email");

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(refinedSignUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      preferredContactMethod: "email",
    },
  });

  const onContactMethodChange = (value: string) => {
    setContactMethod(value);
    form.setValue(
      "preferredContactMethod",
      value as "email" | "phone" | "sms"
    );
  };

  async function onSubmit(values: SignUpFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create user account
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      // Sign in with the appropriate provider based on preferred contact method
      if (values.preferredContactMethod === "email") {
        await signIn("email", {
          email: values.email,
          redirect: false,
        });

        // Redirect to verification page
        router.push("/auth/verify?type=email");
      } else if (
        values.preferredContactMethod === "phone" ||
        values.preferredContactMethod === "sms"
      ) {
        // Redirect to phone verification
        router.push(`/auth/verify?type=phone&phone=${values.phone}`);
      } else {
        // Default to home/dashboard page
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Preferred Contact Method</h3>
            <Tabs
              defaultValue="email"
              value={contactMethod}
              onValueChange={onContactMethodChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone Call</TabsTrigger>
                <TabsTrigger value="sms">Text Message</TabsTrigger>
              </TabsList>
              <TabsContent value="email" className="pt-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
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
              </TabsContent>
              <TabsContent value="phone" className="pt-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(555) 123-4567"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="sms" className="pt-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(555) 123-4567"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
