
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortfolioContext } from '@/contexts/portfolio-context';

export default function PortfolioFooter() {
  const { cvData, theme } = usePortfolioContext();

  return (
    <footer className="py-12 mt-16 border-t border-border/30 bg-muted/30">
      <div className="container mx-auto px-6 text-center">
        <Link href="/dashboard" className="mb-6 inline-block">
          <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
        <p className="text-md text-muted-foreground">
          &copy; {new Date().getFullYear()} {cvData?.personalInformation?.name || 'Your Name'}. Portfolio crafted with FolioCraft AI.
        </p>
        {theme && (
          <p className="text-xs text-muted-foreground/70 mt-2">
            Theme: <span className="font-semibold">{theme.themeName}</span>
          </p>
        )}
      </div>
    </footer>
  );
}
