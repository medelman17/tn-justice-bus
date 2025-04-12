import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify | Tennessee Justice Bus",
  description: "Verify your email to continue",
};

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const verificationType = searchParams.type || "email";

  return (
    <div className="container flex h-screen w-full max-w-[500px] flex-col items-center justify-center">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Check your {verificationType}</CardTitle>
          <CardDescription>
            {verificationType === "email"
              ? "We sent you a verification link. Please check your email."
              : "We sent you a verification code. Please check your phone."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">
              {verificationType === "email"
                ? "If you don't see the email in your inbox, check your spam folder."
                : "If you didn't receive the code, you can request a new one."}
            </p>
            <p className="text-sm">
              This link will expire in 24 hours.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              Back to sign in
            </Link>
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link
              href="/terms"
              className="text-primary underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
