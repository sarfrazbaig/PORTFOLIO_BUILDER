
'use client';

import { usePortfolioContext } from '@/contexts/portfolio-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap, CalendarDays, MapPin } from 'lucide-react'; // Added MapPin
import { Separator } from '@/components/ui/separator';

export default function EducationPage() {
  const { cvData } = usePortfolioContext();

  if (!cvData || !cvData.education || cvData.education.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <p className="text-xl text-muted-foreground">No education data found.</p>
      </div>
    );
  }

  const { education } = cvData;

  return (
    <div className="container mx-auto py-12 md:py-16 px-6">
      <section id="education">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
            <GraduationCap size={40} className="mr-4"/>Education
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            My academic background, qualifications, and educational achievements.
          </p>
        </div>
        <div className="space-y-10 md:space-y-12 max-w-4xl mx-auto">
          {education.map((edu, index) => (
            <Card 
              key={index} 
              className="shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-primary bg-card/90 backdrop-blur-sm overflow-hidden"
            >
              <CardHeader className="p-6 md:p-8 bg-muted/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-xl md:text-2xl text-primary">{edu.degree}</CardTitle>
                    <CardDescription className="text-md md:text-lg font-medium text-foreground flex items-center mt-1">
                      <MapPin size={16} className="mr-2 opacity-70"/>{edu.institution}
                    </CardDescription>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 sm:mt-0 pt-1 whitespace-nowrap bg-secondary px-4 py-2 rounded-full shadow-sm font-medium">
                    <CalendarDays size={16} className="inline mr-2 opacity-70"/>{edu.dates}
                  </p>
                </div>
              </CardHeader>
              {edu.description && (
                <CardContent className="p-6 md:p-8">
                  <p className="text-md md:text-lg text-muted-foreground whitespace-pre-line leading-relaxed">{edu.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
