
'use client';

import { useState, useEffect } from 'react';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import type { RecommendThemeOutput } from '@/ai/flows/ai-theme-recommendation';
import CvUploadForm from '@/components/cv-upload-form';
import ParsedCvDisplay from '@/components/parsed-cv-display';
import ThemeRecommendationDisplay from '@/components/theme-recommendation-display';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Info, Eye } from 'lucide-react';
import Link from 'next/link';

const CV_DATA_KEY = 'cvPortfolioData';
const THEME_RECOMMENDATION_KEY = 'cvPortfolioTheme';

export default function DashboardPage() {
  const [parsedCvData, setParsedCvData] = useState<ParseCvOutput | null>(null);
  const [themeRecommendation, setThemeRecommendation] = useState<RecommendThemeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on initial mount
  useEffect(() => {
    const storedCvData = localStorage.getItem(CV_DATA_KEY);
    if (storedCvData) {
      try {
        setParsedCvData(JSON.parse(storedCvData));
      } catch (e) {
        console.error("Failed to parse CV data from localStorage", e);
        localStorage.removeItem(CV_DATA_KEY);
      }
    }
    const storedTheme = localStorage.getItem(THEME_RECOMMENDATION_KEY);
    if (storedTheme) {
      try {
        setThemeRecommendation(JSON.parse(storedTheme));
      } catch (e) {
        console.error("Failed to parse theme recommendation from localStorage", e);
        localStorage.removeItem(THEME_RECOMMENDATION_KEY);
      }
    }
  }, []);

  const handleCvParsed = (data: ParseCvOutput) => {
    setParsedCvData(data);
    localStorage.setItem(CV_DATA_KEY, JSON.stringify(data));
  };

  const handleThemeRecommended = (data: RecommendThemeOutput) => {
    setThemeRecommendation(data);
    localStorage.setItem(THEME_RECOMMENDATION_KEY, JSON.stringify(data));
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Portfolio Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Upload your CV to automatically generate portfolio content and get a personalized theme recommendation.
        </p>
      </div>
      
      <CvUploadForm
        onCvParsed={handleCvParsed}
        onThemeRecommended={handleThemeRecommended}
        onLoadingChange={handleLoadingChange}
        currentCvData={parsedCvData}
      />

      {isLoading && (
        <Card className="mt-8 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-xl font-semibold text-primary">Processing your CV...</p>
              <p className="text-muted-foreground text-center">
                This may take a few moments. We&apos;re extracting information and finding the best theme for you.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && (parsedCvData || themeRecommendation) && (
        <div className="mt-10 space-y-10">
          {themeRecommendation && (
            <>
              <ThemeRecommendationDisplay recommendation={themeRecommendation} />
            </>
          )}
          {parsedCvData && (
            <>
              <Separator />
              <ParsedCvDisplay cvData={parsedCvData} />
            </>
          )}
        </div>
      )}

      {!isLoading && parsedCvData && themeRecommendation && (
        <div className="mt-12 text-center">
          <Separator className="my-8" />
          <h2 className="text-2xl font-semibold text-primary mb-4">Ready to see your portfolio?</h2>
          <Link href="/dashboard/portfolio">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg">
              View Your Portfolio <Eye className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && !parsedCvData && !themeRecommendation && (
         <Card className="mt-8 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Info className="h-12 w-12 text-accent" />
              <p className="text-xl font-semibold text-foreground">Ready to build your portfolio?</p>
              <p className="text-muted-foreground text-center max-w-md">
                Upload your CV using the form above. Your parsed information and AI-powered theme recommendation will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
