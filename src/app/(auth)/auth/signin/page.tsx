import { Metadata } from "next";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmailSignInForm } from "../components/email-sign-in-form";
import { PhoneSignInForm } from "../components/phone-sign-in-form";

export const metadata: Metadata = {
  title: "Sign In | Tennessee Justice Bus",
  description: "Sign in to your Tennessee Justice Bus account",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Sign in to your account
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Choose your preferred sign in method below
          </p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <Card className="border-2">
              <CardHeader className="space-y-1 pb-2">
                <CardTitle className="text-xl font-semibold">
                  Email Sign In
                </CardTitle>
                <CardDescription className="text-sm">
                  Enter your email address to sign in or create an account
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <EmailSignInForm />
              </CardContent>
              <CardFooter className="flex flex-col pt-2 pb-6 border-t">
                <div className="text-sm text-center w-full pt-4 text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account yet?{" "}
                  <Link
                    href="/auth/signup"
                    className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="phone">
            <Card className="border-2">
              <CardHeader className="space-y-1 pb-2">
                <CardTitle className="text-xl font-semibold">
                  Phone Sign In
                </CardTitle>
                <CardDescription className="text-sm">
                  Enter your phone number to receive a verification code
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <PhoneSignInForm />
              </CardContent>
              <CardFooter className="flex flex-col pt-2 pb-6 border-t">
                <div className="text-sm text-center w-full pt-4 text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account yet?{" "}
                  <Link
                    href="/auth/signup"
                    className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline"
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
