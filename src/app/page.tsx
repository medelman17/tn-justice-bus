"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, FileText, MessageSquare, CheckCircle, MapPin, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Justice Bus</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href="#visits" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Upcoming Visits
            </Link>
            <Link href="#impact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Impact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="inline-block" variant="secondary">Free Legal Services</Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Tennessee Justice Bus
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Bringing free legal services to rural Tennessee communities. Prepare for your consultation with our pre-visit screening application.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth/signup">
                    <Button size="lg" className="gap-1.5">
                      Start Pre-Visit Screening
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button size="lg" variant="outline">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-muted">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
                    <div className="p-8 text-center">
                      <Calendar className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-xl font-bold">Justice Bus</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Bridging the access-to-justice gap in rural Tennessee
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="inline-block" variant="secondary">Features</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How We Help You Prepare</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our application helps you prepare for your Justice Bus consultation, ensuring you make the most of your time with volunteer attorneys.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mt-12">
              <div className="group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:translate-y-[-5px]">
                <div className="absolute top-0 left-0 h-1 w-full bg-primary/70 rounded-t-xl"></div>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Virtual Intake Assistant</h3>
                  <p className="text-muted-foreground">
                    Guided conversation to collect your information and understand your legal needs.
                  </p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:translate-y-[-5px]">
                <div className="absolute top-0 left-0 h-1 w-full bg-primary/70 rounded-t-xl"></div>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <CheckCircle className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Legal Issue Identifier</h3>
                  <p className="text-muted-foreground">
                    Helps identify and categorize your specific legal issues for better attorney matching.
                  </p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:translate-y-[-5px]">
                <div className="absolute top-0 left-0 h-1 w-full bg-primary/70 rounded-t-xl"></div>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Document Preparation</h3>
                  <p className="text-muted-foreground">
                    Customized checklists of documents to bring to your consultation.
                  </p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:translate-y-[-5px]">
                <div className="absolute top-0 left-0 h-1 w-full bg-primary/70 rounded-t-xl"></div>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <Calendar className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Appointment Scheduler</h3>
                  <p className="text-muted-foreground">
                    Book your consultation with the Justice Bus when it visits your community.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-16 flex justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="inline-block" variant="secondary">Process</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our streamlined process helps you get the legal assistance you need, even in areas with limited connectivity.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold">Sign Up & Complete Intake</h3>
                <p className="mt-2 text-muted-foreground">
                  Create an account and answer questions about your legal needs. Works offline for areas with limited connectivity.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold">Prepare Documents</h3>
                <p className="mt-2 text-muted-foreground">
                  Follow the customized checklist to gather and organize the documents needed for your consultation.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold">Meet with an Attorney</h3>
                <p className="mt-2 text-muted-foreground">
                  Attend your scheduled appointment with the Justice Bus when it visits your community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Visits Section */}
        <section id="visits" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="inline-block" variant="secondary">Schedule</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Upcoming Justice Bus Visits</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The Tennessee Justice Bus travels to rural communities across the state. Find out when we&apos;ll be in your area.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              {/* These would be dynamically generated from actual data */}
              <Card>
                <CardHeader>
                  <CardTitle>Monroe County</CardTitle>
                  <CardDescription>Madisonville Community Center</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">April 18, 2025</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">123 Main St, Madisonville, TN</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Schedule Appointment</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Grundy County</CardTitle>
                  <CardDescription>Tracy City Public Library</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">April 25, 2025</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">10:00 AM - 3:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">456 Oak St, Tracy City, TN</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Schedule Appointment</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Hancock County</CardTitle>
                  <CardDescription>Sneedville Community Center</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">May 2, 2025</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">789 Elm St, Sneedville, TN</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Schedule Appointment</Button>
                </CardFooter>
              </Card>
            </div>
            <div className="flex justify-center mt-8">
              <Button variant="outline">View All Upcoming Visits</Button>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="inline-block" variant="secondary">Impact</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Making a Difference</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The Tennessee Justice Bus is bridging the access-to-justice gap in rural communities.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
              <div className="flex h-full min-h-[180px] flex-col justify-center items-center rounded-lg border bg-card text-card-foreground shadow-sm p-8">
                <h3 className="text-4xl font-bold mb-4">40+</h3>
                <p className="text-muted-foreground text-lg max-w-[200px]">
                  Rural counties served across Tennessee
                </p>
              </div>
              
              <div className="flex h-full min-h-[180px] flex-col justify-center items-center rounded-lg border bg-card text-card-foreground shadow-sm p-8">
                <h3 className="text-4xl font-bold mb-4">1,200+</h3>
                <p className="text-muted-foreground text-lg max-w-[200px]">
                  Clients assisted with legal services
                </p>
              </div>
              
              <div className="flex h-full min-h-[180px] flex-col justify-center items-center rounded-lg border bg-card text-card-foreground shadow-sm p-8">
                <h3 className="text-4xl font-bold mb-4">150+</h3>
                <p className="text-muted-foreground text-lg max-w-[200px]">
                  Volunteer attorneys participating
                </p>
              </div>
            </div>
            <div className="mt-12 space-y-4">
              <Tabs defaultValue="testimonial1" className="w-full max-w-3xl mx-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="testimonial1">Client</TabsTrigger>
                  <TabsTrigger value="testimonial2">Attorney</TabsTrigger>
                  <TabsTrigger value="testimonial3">Community</TabsTrigger>
                </TabsList>
                <TabsContent value="testimonial1" className="p-6 border rounded-lg mt-6">
                  <blockquote className="italic text-muted-foreground">
                    &ldquo;The Justice Bus helped me resolve a housing issue that had been causing me stress for months. The pre-visit screening made sure I had all my documents ready, which made the consultation so much more productive.&rdquo;
                  </blockquote>
                  <div className="mt-4 font-medium">- Sarah J., Monroe County</div>
                </TabsContent>
                <TabsContent value="testimonial2" className="p-6 border rounded-lg mt-6">
                  <blockquote className="italic text-muted-foreground">
                    &ldquo;As a volunteer attorney, I&apos;ve seen firsthand how the pre-visit screening application has improved our ability to help clients. We can now serve more people in a day because clients come prepared.&rdquo;
                  </blockquote>
                  <div className="mt-4 font-medium">- Michael T., Volunteer Attorney</div>
                </TabsContent>
                <TabsContent value="testimonial3" className="p-6 border rounded-lg mt-6">
                  <blockquote className="italic text-muted-foreground">
                    &ldquo;Having the Justice Bus visit our community has been transformative. Many of our residents simply couldn&apos;t travel to the city for legal help, and now they don&apos;t have to.&rdquo;
                  </blockquote>
                  <div className="mt-4 font-medium">- Lisa R., Grundy County Librarian</div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Get Started?</h2>
                <p className="max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Create an account and begin preparing for your Justice Bus consultation today.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/auth/signup">
                  <Button size="lg" variant="secondary" className="gap-1.5">
                    Start Pre-Visit Screening
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-background py-6 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">Justice Bus</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Bringing free legal services to rural Tennessee communities.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    Legal Resources
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    Document Guides
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Partners</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="https://www.tncourts.gov/programs/access-justice" className="text-muted-foreground transition-colors hover:text-foreground">
                    TN Access to Justice Commission
                  </Link>
                </li>
                <li>
                  <Link href="https://www.laet.org/" className="text-muted-foreground transition-colors hover:text-foreground">
                    Legal Aid of East Tennessee
                  </Link>
                </li>
                <li>
                  <Link href="https://justiceforalltn.org/" className="text-muted-foreground transition-colors hover:text-foreground">
                    Tennessee Justice Bus Initiative
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Tennessee Justice Bus. All rights reserved.</p>
            <p className="mt-2">
              This website does not provide legal advice. The information provided is for general informational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
