import { Metadata } from "next";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailSignInForm } from "../components/email-sign-in-form";
import { PhoneSignInForm } from "../components/phone-sign-in-form";

export const metadata: Metadata = {
  title: "Sign In | Tennessee Justice Bus",
  description: "Sign in to your Tennessee Justice Bus account",
};

export default function SignInPage() {
  return (
    <div className="container flex h-screen w-full max-w-[500px] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose your preferred sign in method below
          </p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Email Sign In</CardTitle>
                <CardDescription>
                  Enter your email address to sign in or create an account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailSignInForm />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-muted-foreground">
                  Don&apos;t have an account yet?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="phone">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Phone Sign In</CardTitle>
                <CardDescription>
                  Enter your phone number to receive a verification code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhoneSignInForm />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-muted-foreground">
                  Don&apos;t have an account yet?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
