
'use client';

import type { ReactNode } from 'react';
import { PortfolioProvider, usePortfolioContext } from '@/contexts/portfolio-context';
import PortfolioHeader from '@/components/portfolio-header';
import PortfolioFooter from '@/components/portfolio-footer';
import { Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

function PortfolioLayoutContent({ children }: { children: ReactNode }) {
  const { cvData, theme, isLoading } = usePortfolioContext();

  useEffect(() => {
    const root = document.documentElement;
    if (theme && theme.themeVariables) {
      // Apply HSL color variables
      Object.entries(theme.themeVariables).forEach(([key, value]) => {
        const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        if (typeof value === 'string' && (key !== 'fontFamilyBody' && key !== 'fontFamilyHeading' && key !== 'baseFontSize' && key !== 'layoutStyle' && key !== 'cardStyle' && key !== 'spacingScale')) {
          root.style.setProperty(cssVarName, value);
        }
      });

      // Apply font variables
      if (theme.themeVariables.fontFamilyBody) {
        root.style.setProperty('--font-family-body', theme.themeVariables.fontFamilyBody);
      }
      if (theme.themeVariables.fontFamilyHeading) {
        root.style.setProperty('--font-family-heading', theme.themeVariables.fontFamilyHeading);
      }
      if (theme.themeVariables.baseFontSize) {
        root.style.setProperty('--base-font-size', theme.themeVariables.baseFontSize);
      }

      // Apply data attributes for styles handled by CSS rules
      if (theme.themeVariables.layoutStyle) {
        root.setAttribute('data-layout-style', theme.themeVariables.layoutStyle);
      } else {
        root.removeAttribute('data-layout-style');
      }
      if (theme.themeVariables.cardStyle) {
        root.setAttribute('data-card-style', theme.themeVariables.cardStyle);
      } else {
        root.removeAttribute('data-card-style');
      }
       if (theme.themeVariables.spacingScale) {
        root.setAttribute('data-spacing-scale', theme.themeVariables.spacingScale);
      } else {
        root.removeAttribute('data-spacing-scale');
      }
       // Clear old theme class if new variables are applied
      root.className = root.className.replace(/theme-\S+/g, '').trim();

    } else if (theme && theme.themeName) {
      // Fallback for older themes or basic AI recommendations
      const themeClass = `theme-${theme.themeName.toLowerCase().replace(/\s+/g, '-')}`;
      // Remove other theme classes before adding the new one
      root.className = root.className.replace(/theme-\S+/g, '').trim();
      root.classList.add(themeClass);
      
      // Clear dynamically set style properties if falling back to class-based theme
      const varsToClear = [
        '--background', '--foreground', '--primary', '--primary-foreground',
        '--secondary', '--secondary-foreground', '--accent', '--accent-foreground',
        '--card', '--card-foreground', '--border', '--input', '--ring',
        '--font-family-body', '--font-family-heading', '--base-font-size'
      ];
      varsToClear.forEach(cssVarName => root.style.removeProperty(cssVarName));
      root.removeAttribute('data-layout-style');
      root.removeAttribute('data-card-style');
      root.removeAttribute('data-spacing-scale');
    } else {
       // No theme or theme variables, ensure no dynamic styles/attributes are lingering
      const varsToClear = [
        '--background', '--foreground', '--primary', '--primary-foreground',
        '--secondary', '--secondary-foreground', '--accent', '--accent-foreground',
        '--card', '--card-foreground', '--border', '--input', '--ring',
        '--font-family-body', '--font-family-heading', '--base-font-size'
      ];
      varsToClear.forEach(cssVarName => root.style.removeProperty(cssVarName));
      root.removeAttribute('data-layout-style');
      root.removeAttribute('data-card-style');
      root.removeAttribute('data-spacing-scale');
      root.className = root.className.replace(/theme-\S+/g, '').trim();
    }
  }, [theme]);


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
              It looks like we couldn&apos;t find your CV data or theme selection. 
              Please go back to the dashboard and upload your CV or select a theme first.
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
  
  // Theme class is primarily for fallback now. Dynamic styles take precedence.
  const themeClass = (theme && !theme.themeVariables && theme.themeName) 
    ? `theme-${theme.themeName.toLowerCase().replace(/\s+/g, '-')}` 
    : '';

  return (
    <div className={`flex flex-col min-h-screen bg-background text-foreground ${themeClass} antialiased`}>
      <PortfolioHeader />
      <main className="flex-grow">
        {children}
      </main>
      <PortfolioFooter />
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

    