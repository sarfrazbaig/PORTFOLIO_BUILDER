'use client';

import type { RecommendThemeOutput } from '@/ai/flows/ai-theme-recommendation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, MessageSquare } from 'lucide-react';

interface ThemeRecommendationDisplayProps {
  recommendation: RecommendThemeOutput;
}

export default function ThemeRecommendationDisplay({ recommendation }: ThemeRecommendationDisplayProps) {
  return (
    <Card className="shadow-lg bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <CardHeader>
        <div className="flex items-center mb-2">
          <span className="p-3 bg-primary text-primary-foreground rounded-full mr-4 shadow-md">
            <Award size={28} />
          </span>
          <div>
            <CardTitle className="text-2xl text-primary tracking-tight">AI Theme Recommendation</CardTitle>
            <CardDescription>Our AI suggests the following theme for your portfolio based on your profile.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-foreground">Recommended Theme:</h4>
          <p className="text-2xl font-bold text-accent">{recommendation.themeName}</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-foreground flex items-center">
            <MessageSquare size={20} className="mr-2 text-muted-foreground" />
            Reasoning:
          </h4>
          <p className="text-muted-foreground italic whitespace-pre-line">{recommendation.reason}</p>
        </div>
      </CardContent>
    </Card>
  );
}
