
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Palette, Construction } from 'lucide-react';

export default function PortfolioPage() {
  // In a real app, you'd fetch or pass portfolio data here,
  // potentially using the themeName or parsedCvData from context or state management.
  // For now, it's a placeholder.

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="w-full max-w-4xl mx-auto shadow-xl border-2 border-primary/20">
        <CardHeader className="text-center bg-muted/50 p-8 rounded-t-lg">
          <div className="flex justify-center mb-4">
            <Palette className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold text-primary tracking-tight">Your Portfolio</CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-2">
            This is where your personalized portfolio will come to life!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-16 px-6">
          <Construction className="h-20 w-20 text-accent mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-3">Under Construction</h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            The portfolio preview and design tools are being built. Soon, you&apos;ll be able to customize and publish your stunning portfolio from here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
