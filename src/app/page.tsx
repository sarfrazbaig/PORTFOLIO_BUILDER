import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, UploadCloud, Zap } from 'lucide-react';
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
                  Build Your Professional Portfolio in Minutes
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Upload your CV, let our AI do the heavy lifting, and choose from stunning themes to showcase your skills and experience.
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
                alt="Portfolio Preview"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                data-ai-hint="portfolio website"
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
                  Three simple steps to your professional online presence.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center bg-primary rounded-md p-3 w-12 h-12 mb-4">
                    <UploadCloud className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>1. Upload CV</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Easily upload your existing CV in various formats. Our system will securely process your information.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center bg-primary rounded-md p-3 w-12 h-12 mb-4">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>2. AI Magic</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our AI parses your CV, structures the content, and recommends the best themes for your profession.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center bg-primary rounded-md p-3 w-12 h-12 mb-4">
                    <Briefcase className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>3. Launch Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Preview, customize, and publish your professional portfolio to a unique URL. Share it with the world!
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
