"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// No import needed - enums are directly used from zod.enum

// Sign up form schema
const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().optional(),
  phone: z.string().optional(),
  preferredContactMethod: z.enum(["email", "phone", "sms"]),
});

// Require email if preferred contact method is email, phone if method is phone or text
const refinedSignUpSchema = signUpSchema
  .refine(
    (data) => {
      if (data.preferredContactMethod === "email") {
        return !!data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      }
      return true;
    },
    {
      message: "Please enter a valid email address",
      path: ["email"],
    }
  )
  .refine(
    (data) => {
      if (
        data.preferredContactMethod === "phone" ||
        data.preferredContactMethod === "sms"
      ) {
        return (
          !!data.phone &&
          data.phone.length >= 10 &&
          /^\+?[0-9]+$/.test(data.phone)
        );
      }
      return true;
    },
    {
      message: "Please enter a valid phone number (at least 10 digits)",
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

    // Clear any existing field when changing contact method
    if (value === "email") {
      form.setValue("phone", "");
      form.clearErrors("phone");
    } else {
      form.setValue("email", "");
      form.clearErrors("email");
    }

    form.setValue("preferredContactMethod", value as "email" | "phone" | "sms");
  };

  // Add form state logging for debugging
  const isValid = form.formState.isValid;
  const isDirty = form.formState.isDirty;
  const errors = form.formState.errors;
  console.log("Form state:", { isValid, isDirty, errors });

  async function onSubmit(values: SignUpFormValues) {
    setIsSubmitting(true);
    setError(null);
    console.log("Form submission started with values:", values);

    try {
      // Create user account
      console.log("Sending request to /api/auth/register");
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      console.log("Register API response status:", response.status);
      const data = await response.json();
      console.log("Register API response data:", data);

      if (!response.ok) {
        // Handle validation errors more gracefully
        if (data.errors) {
          // If we have detailed validation errors, show them
          const errorMessages = Object.entries(data.errors)
            .filter(([_, value]) => {
              const typedValue = value as { message?: string };
              return !!typedValue.message;
            })
            .map(([_, value]) => {
              const typedValue = value as { message: string };
              return typedValue.message;
            })
            .join(". ");

          throw new Error(
            errorMessages || data.message || "Failed to create account"
          );
        } else {
          throw new Error(data.message || "Failed to create account");
        }
      }

      // Sign in with the appropriate provider based on preferred contact method
      if (values.preferredContactMethod === "email") {
        console.log("Signing in with email provider");
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
        console.log("Redirecting to phone verification");
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
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form
          onSubmit={(e) => {
            console.log("Form submit event triggered");
            e.preventDefault(); // Prevent default form submission

            // Trigger form validation
            form.trigger().then((isValid) => {
              console.log("Form validation result:", isValid);
              if (isValid) {
                // If valid, manually call the onSubmit handler with current values
                const values = form.getValues();
                onSubmit(values);
              } else {
                console.log("Form validation failed:", form.formState.errors);
              }
            });
          }}
          className="space-y-6"
        >
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
              <h3 className="text-sm font-medium mb-2">
                Preferred Contact Method
              </h3>
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

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            onClick={() => console.log("Button clicked directly")}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
