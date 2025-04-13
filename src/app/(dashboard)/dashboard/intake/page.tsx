import { Metadata } from "next";
import ClientIntake from "@/components/justice-bus/client-intake";

export const metadata: Metadata = {
  title: "Client Intake | Tennessee Justice Bus",
  description: "Start your legal intake process with the Tennessee Justice Bus",
};

export default function IntakePage() {
  return (
    <div className="flex flex-col space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Legal Intake</h1>
        <p className="text-muted-foreground">
          Let&apos;s prepare for your Justice Bus consultation. Our assistant will help gather the
          necessary information about your legal situation.
        </p>
      </div>
      
      <ClientIntake />
    </div>
  );
}
