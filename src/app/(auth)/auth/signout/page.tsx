"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// Metadata should be exported from a separate metadata file or layout
// since this is a client component

export default function SignOutPage() {
  const { status } = useSession();

  // Automatically sign out when the page loads
  useEffect(() => {
    // Only sign out if currently authenticated
    if (status === "authenticated") {
      signOut({ redirect: false });
    }
  }, [status]);

  return (
    <div className="container flex h-screen w-full max-w-[500px] flex-col items-center justify-center">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <LogOut className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Signed Out</CardTitle>
          <CardDescription className="text-center">
            You have been successfully signed out of your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">Thank you for using Tennessee Justice Bus.</p>
            <p className="text-sm">
              For security reasons, please close your browser if you're on a
              shared computer.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Sign back in</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to home</Link>
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Need assistance? Contact{" "}
            <Link
              href="mailto:support@tnjusticebus.org"
              className="text-primary underline-offset-4 hover:underline"
            >
              support@tnjusticebus.org
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
