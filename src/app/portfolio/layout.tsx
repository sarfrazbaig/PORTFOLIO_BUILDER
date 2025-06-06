
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

    const setCssVariable = (variableName: string, value: string | undefined) => {
      if (value === undefined) {
        if (root.style.getPropertyValue(variableName) !== '') {
          root.style.removeProperty(variableName);
        }
      } else if (root.style.getPropertyValue(variableName) !== value) {
        root.style.setProperty(variableName, value);
      }
    };

    const setAttributeIfChanged = (attrName: string, value: string | undefined) => {
      const currentValue = root.getAttribute(attrName);
      if (value === undefined) {
        if (currentValue !== null) {
          root.removeAttribute(attrName);
        }
      } else if (currentValue !== value) {
        root.setAttribute(attrName, value);
      }
    };

    const clearDynamicStylesAndAttributes = () => {
      const varsToClear = [
        '--background', '--foreground', '--primary', '--primary-foreground',
        '--secondary', '--secondary-foreground', '--accent', '--accent-foreground',
        '--card', '--card-foreground', '--border', '--input', '--ring',
        '--font-family-body', '--font-family-heading', '--base-font-size',
        '--muted', '--muted-foreground', '--popover', '--popover-foreground',
        '--destructive', '--destructive-foreground', '--radius',
        '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'
      ];
      varsToClear.forEach(cssVarName => setCssVariable(cssVarName, undefined));
      
      ['data-layout-style', 'data-card-style', 'data-spacing-scale'].forEach(attr => {
        setAttributeIfChanged(attr, undefined);
      });
    };
    
    let currentRootClassName = root.className;
    const baseClassName = currentRootClassName.replace(/theme-\S+/g, '').trim().replace(/\s\s+/g, ' ');


    if (theme && theme.themeVariables) {
      Object.entries(theme.themeVariables).forEach(([key, value]) => {
        const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        if (typeof value === 'string' && !['fontFamilyBody', 'fontFamilyHeading', 'baseFontSize', 'layoutStyle', 'cardStyle', 'spacingScale'].includes(key)) {
          setCssVariable(cssVarName, value);
        }
      });

      setCssVariable('--font-family-body', theme.themeVariables.fontFamilyBody);
      setCssVariable('--font-family-heading', theme.themeVariables.fontFamilyHeading);
      setCssVariable('--base-font-size', theme.themeVariables.baseFontSize);
      
      setAttributeIfChanged('data-layout-style', theme.themeVariables.layoutStyle);
      setAttributeIfChanged('data-card-style', theme.themeVariables.cardStyle);
      setAttributeIfChanged('data-spacing-scale', theme.themeVariables.spacingScale);
      
      const newClassName = baseClassName; // No theme-class needed when variables are applied
      if (root.className !== newClassName) {
        root.className = newClassName;
      }

    } else if (theme && theme.themeName) {
      clearDynamicStylesAndAttributes();
      const themeClass = `theme-${theme.themeName.toLowerCase().replace(/\s+/g, '-')}`;
      const newClassName = `${baseClassName} ${themeClass}`.trim().replace(/\s\s+/g, ' ');
      if (root.className !== newClassName) {
        root.className = newClassName;
      }
    } else {
      clearDynamicStylesAndAttributes();
      if (root.className !== baseClassName) {
        root.className = baseClassName;
      }
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
  
  const themeClass = (theme && !theme.themeVariables && theme.themeName) 
    ? `theme-${theme.themeName.toLowerCase().replace(/\s+/g, '-')}` 
    : '';

  // Removed `bg-background` from this div; body already has it.
  return (
    <div className={`flex flex-col min-h-screen text-foreground ${themeClass} antialiased`}>
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
