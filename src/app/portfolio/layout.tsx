
'use client';

import type { ReactNode } from 'react';
import { PortfolioProvider, usePortfolioContext } from '@/contexts/portfolio-context';
import PortfolioHeader from '@/components/portfolio-header';
import PortfolioFooter from '@/components/portfolio-footer';
// Removed AiHelperButton import
import { Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function PortfolioLayoutContent({ children }: { children: ReactNode }) {
  const { cvData, theme, isLoading } = usePortfolioContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
        <p className="ml-4 text-lg text-muted-foreground">Loading portfolio data...</p>
      </div>
    );
  }

  if (!cvData || !theme) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center flex flex-col items-center justify-center min-h-screen">
        <Card className="max-w-lg mx-auto shadow-lg border-destructive bg-destructive/5">
          <CardHeader>
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
              <Info className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive mt-4">Portfolio Data Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-6 text-lg text-destructive-foreground/80">
              It looks like we couldn&apos;t find your CV data or theme recommendation. 
              Please go back to the dashboard and upload your CV first.
            </CardDescription>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="border-destructive text-destructive hover:bg-destructive/10">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const themeClass = theme ? `theme-${theme.themeName.toLowerCase().replace(/\s+/g, '-')}` : '';

  return (
    <div className={`flex flex-col min-h-screen bg-background text-foreground ${themeClass} antialiased`}>
      <PortfolioHeader />
      <main className="flex-grow">
        {children}
      </main>
      <PortfolioFooter />
      {/* Removed AiHelperButton component usage */}
    </div>
  );
}

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return (
    <PortfolioProvider>
      <PortfolioLayoutContent>{children}</PortfolioLayoutContent>
    </PortfolioProvider>
  );
}
