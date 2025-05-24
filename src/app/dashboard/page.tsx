'use client';

import { useState } from 'react';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import type { RecommendThemeOutput } from '@/ai/flows/ai-theme-recommendation';
import CvUploadForm from '@/components/cv-upload-form';
import ParsedCvDisplay from '@/components/parsed-cv-display';
import ThemeRecommendationDisplay from '@/components/theme-recommendation-display';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Info } from 'lucide-react';

export default function DashboardPage() {
  const [parsedCvData, setParsedCvData] = useState<ParseCvOutput | null>(null);
  const [themeRecommendation, setThemeRecommendation] = useState<RecommendThemeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCvParsed = (data: ParseCvOutput) => {
    setParsedCvData(data);
  };

  const handleThemeRecommended = (data: RecommendThemeOutput) => {
    setThemeRecommendation(data);
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
