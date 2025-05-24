
'use client';

import { usePortfolioContext } from '@/contexts/portfolio-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function SkillsPage() {
  const { cvData } = usePortfolioContext();

  if (!cvData || !cvData.skills || cvData.skills.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <p className="text-xl text-muted-foreground">No skills data found.</p>
      </div>
    );
  }

  const { skills } = cvData;

  return (
    <div className="container mx-auto py-12 md:py-16 px-6">
      <section id="skills">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
            <Sparkles size={40} className="mr-4"/>Skills & Expertise
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            A showcase of my technical and professional abilities.
          </p>
        </div>
        <Card className="shadow-xl border-l-4 border-primary/70 bg-card/90 backdrop-blur-sm max-w-3xl mx-auto">
          <CardHeader className="p-6 md:p-8 bg-muted/20">
            <CardTitle className="text-xl md:text-2xl text-primary">My Core Competencies</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-5">
              {skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-accent/10 text-accent text-md md:text-lg font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-accent/20 transition-all cursor-default transform hover:scale-105"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
