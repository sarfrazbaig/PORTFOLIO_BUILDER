
'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, UploadCloud, Zap, Palette, Edit3, Rocket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const dynamicThemes = [
  { // Teal & Orange
    primary: '174 70% 42%', // Teal
    primaryForeground: '0 0% 100%',
    accent: '30 100% 50%',   // Orange
    accentForeground: '0 0% 0%',
  },
  { // Blue & Pink
    primary: '210 100% 50%', // Blue
    primaryForeground: '0 0% 100%',
    accent: '330 100% 60%',  // Pink
    accentForeground: '0 0% 0%',
  },
  { // Green & Yellow
    primary: '145 63% 42%', // Green
    primaryForeground: '0 0% 100%',
    accent: '45 100% 50%',   // Yellow
    accentForeground: '0 0% 0%',
  },
  { // Default Purple-ish (to cycle back to original if needed, or a variation)
    primary: '262 52% 57%',
    primaryForeground: '0 0% 100%',
    accent: '174 100% 29%',
    accentForeground: '0 0% 100%',
  }
];

const INITIAL_DELAY_MS = 2000; // 2 seconds
const CYCLE_INTERVAL_MS = 4000; // 4 seconds

export default function HomePage() {
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialStylesRef = useRef<Record<string, string>>({});

  useEffect(() => {
    // Store initial styles
    const style = document.documentElement.style;
    initialStylesRef.current = {
      '--primary': style.getPropertyValue('--primary'),
      '--primary-foreground': style.getPropertyValue('--primary-foreground'),
      '--accent': style.getPropertyValue('--accent'),
      '--accent-foreground': style.getPropertyValue('--accent-foreground'),
    };

    const applyTheme = (themeIndex: number) => {
      const theme = dynamicThemes[themeIndex];
      if (theme) {
        document.documentElement.style.setProperty('--primary', theme.primary);
        document.documentElement.style.setProperty('--primary-foreground', theme.primaryForeground);
        document.documentElement.style.setProperty('--accent', theme.accent);
        document.documentElement.style.setProperty('--accent-foreground', theme.accentForeground);
      }
    };

    // Apply the first dynamic theme after an initial delay
    const initialTimeoutId = setTimeout(() => {
      applyTheme(0); // Apply the first theme from our dynamic list
      setCurrentThemeIndex(0); // Explicitly set index if needed for other logic

      // Start cycling through themes
      intervalRef.current = setInterval(() => {
        setCurrentThemeIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % dynamicThemes.length;
          applyTheme(nextIndex);
          return nextIndex;
        });
      }, CYCLE_INTERVAL_MS);
    }, INITIAL_DELAY_MS);

    // Cleanup function
    return () => {
      clearTimeout(initialTimeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Revert to original styles when component unmounts
      const original = initialStylesRef.current;
      document.documentElement.style.setProperty('--primary', original['--primary'] || '');
      document.documentElement.style.setProperty('--primary-foreground', original['--primary-foreground'] || '');
      document.documentElement.style.setProperty('--accent', original['--accent'] || '');
      document.documentElement.style.setProperty('--accent-foreground', original['--accent-foreground'] || '');
    };
  }, []);


  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary transition-colors duration-500" />
            <span className="font-bold text-lg">FolioCraft AI</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-primary transition-colors duration-500">
                  Craft Your Unique AI-Powered Portfolio in Minutes
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Upload your CV, let our AI structure your content, generate personalized themes with custom colors, fonts, and layouts, then edit and enhance your site with AI assistance.
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="mt-4 transition-colors duration-500">
                    Get Started
                    <Zap className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                alt="Hero image illustrating AI-powered portfolio creation, dynamic themes, and modern career showcasing"
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
                  <div className="flex items-center justify-center bg-primary rounded-md p-3 w-12 h-12 mb-4 transition-colors duration-500">
                    <UploadCloud className="h-6 w-6 text-primary-foreground transition-colors duration-500" />
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
                  <div className="flex items-center justify-center bg-primary rounded-md p-3 w-12 h-12 mb-4 transition-colors duration-500">
                    <Palette className="h-6 w-6 text-primary-foreground transition-colors duration-500" />
                  </div>
                  <CardTitle>2. AI Theme Crafting</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Specify style preferences (vibe, colors, fonts, layout hints) and our AI generates unique themes. Preview and select your favorite.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center bg-primary rounded-md p-3 w-12 h-12 mb-4 transition-colors duration-500">
                    <Edit3 className="h-6 w-6 text-primary-foreground transition-colors duration-500" />
                  </div>
                  <CardTitle>3. Customize & Launch</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Live-edit content, upload or AI-generate images, switch themes, and use AI to enhance text, creating your perfect portfolio.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} FolioCraft AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
