import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Out | Tennessee Justice Bus",
  description: "Sign out of your Tennessee Justice Bus account",
};

export default function SignOutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
