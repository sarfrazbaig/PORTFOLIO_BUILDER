
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, UploadCloud, Zap, Palette, Edit3, Rocket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">CV Portfolio Pro</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-primary">
                  Craft Your Unique AI-Powered Portfolio in Minutes
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Upload your CV, let our AI structure your content, generate personalized themes with custom colors, fonts, and layouts, then edit and enhance your site with AI assistance.
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="mt-4">
                    Get Started
                    <Zap className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                alt="Dynamic Portfolio Illustration"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                data-ai-hint="career growth portfolio"
              />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Transform your CV into a stunning, unique portfolio with our intelligent platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center bg-primary rounded-md p-3 w-12 h-12 mb-4">
                    <UploadCloud className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>1. Upload & AI Parse</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Easily upload your CV. Our AI intelligently extracts and structures your experience, education, projects, and skills.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center bg-primary rounded-md p-3 w-12 h-12 mb-4">
                    <Palette className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>2. AI Theme Crafting</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Specify your style preferences, and our AI generates multiple unique themes with custom colors, fonts, and layouts.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center bg-primary rounded-md p-3 w-12 h-12 mb-4">
                    <Edit3 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>3. Customize & Launch</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Live-edit your content, use AI to rewrite sections, upload or generate images, switch themes, and publish your unique portfolio.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} CV Portfolio Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
