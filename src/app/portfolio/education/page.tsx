
'use client';

import { useState } from 'react'; 
import { usePortfolioContext } from '@/contexts/portfolio-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, CalendarDays, MapPin, Sparkles } from 'lucide-react'; 
import AiHelperDialog from '@/components/ai-helper-dialog'; 
import { cn } from '@/lib/utils';

interface AiEditConfig {
  content: string;
  onUpdate: (newText: string) => void;
  label: string;
}

export default function EducationPage() {
  const { cvData, isEditMode, updateCvField } = usePortfolioContext();
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiEditConfig, setAiEditConfig] = useState<AiEditConfig | null>(null);


  if (!cvData || !cvData.education || cvData.education.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <p className="text-xl text-muted-foreground">No education data found.</p>
      </div>
    );
  }

  const { education } = cvData;

  const handleInputChange = (index: number, field: string, value: string) => {
    updateCvField(`education.${index}.${field}`, value);
  };

  const openAiDialog = (content: string, onUpdate: (newText: string) => void, label: string) => {
    setAiEditConfig({ content, onUpdate, label });
    setIsAiDialogOpen(true);
  };

  const animationDelay = (index: number) => {
    const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500'];
    return delays[index % delays.length];
  };

  return (
    <div className="container mx-auto py-12 md:py-16 px-6">
      <section id="education">
        <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
            <GraduationCap size={40} className="mr-4"/>Education
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            My academic background, qualifications, and educational achievements.
          </p>
        </div>
        <div className="space-y-10 md:space-y-12 max-w-4xl mx-auto">
          {education.map((edu, index) => (
            <div key={index} className={cn('animate-fade-in-up', animationDelay(index))}>
              <Card 
                className="themed-card shadow-lg border-t-4 border-primary bg-card/90 backdrop-blur-sm overflow-hidden hover:-translate-y-1 transition-all duration-300 ease-in-out"
              >
                <CardHeader className="p-6 md:p-8 bg-muted/20">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex-grow">
                       {isEditMode ? (
                        <Input
                          value={edu.degree}
                          onChange={(e) => handleInputChange(index, 'degree', e.target.value)}
                          placeholder="Degree / Certificate"
                          className="text-xl md:text-2xl text-primary font-semibold bg-transparent border-2 border-dashed border-primary/30 focus:border-primary mb-1"
                        />
                      ) : (
                        <CardTitle className="text-xl md:text-2xl text-primary">{edu.degree}</CardTitle>
                      )}
                      {isEditMode ? (
                         <div className="flex items-center mt-1">
                          <MapPin size={16} className="mr-2 opacity-70 text-muted-foreground"/>
                          <Input
                            value={edu.institution}
                            onChange={(e) => handleInputChange(index, 'institution', e.target.value)}
                            placeholder="Institution Name"
                            className="text-md md:text-lg font-medium text-foreground bg-transparent border-2 border-dashed border-primary/30 focus:border-primary"
                          />
                        </div>
                      ) : (
                        <CardDescription className="text-md md:text-lg font-medium text-foreground flex items-center mt-1">
                          <MapPin size={16} className="mr-2 opacity-70"/>{edu.institution}
                        </CardDescription>
                      )}
                    </div>
                    {isEditMode ? (
                      <Input
                        value={edu.dates}
                        onChange={(e) => handleInputChange(index, 'dates', e.target.value)}
                        placeholder="Dates (e.g., 2016 - 2020)"
                        className="text-sm text-muted-foreground bg-transparent border-2 border-dashed border-primary/30 focus:border-primary mt-1 sm:mt-0 w-full sm:w-auto"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1 sm:mt-0 pt-1 whitespace-nowrap bg-secondary px-4 py-2 rounded-full shadow-sm font-medium">
                        <CalendarDays size={16} className="inline mr-2 opacity-70"/>{edu.dates}
                      </p>
                    )}
                  </div>
                </CardHeader>
                { (edu.description || isEditMode) && (
                  <CardContent className="p-6 md:p-8">
                    <div className="relative">
                      {isEditMode ? (
                        <Textarea
                          value={edu.description || ''}
                          onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                          placeholder="Relevant details, achievements, thesis..."
                          className="text-md md:text-lg text-muted-foreground whitespace-pre-line leading-relaxed bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[100px] pr-10"
                          rows={4}
                        />
                      ) : (
                        edu.description && <p className="text-md md:text-lg text-muted-foreground whitespace-pre-line leading-relaxed">{edu.description}</p>
                      )}
                      {isEditMode && edu.description && (
                         <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-0 text-primary/70 hover:text-primary active:scale-90 transition-transform"
                          onClick={() => openAiDialog(
                            edu.description || '',
                            (newText) => handleInputChange(index, 'description', newText),
                            `Description for ${edu.degree}`
                          )}
                          title="Rewrite description with AI"
                        >
                          <Sparkles size={20} />
                        </Button>
                      )}
                       {isEditMode && !edu.description && (
                         <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-0 text-primary/70 hover:text-primary active:scale-90 transition-transform"
                          onClick={() => openAiDialog(
                            '', 
                            (newText) => handleInputChange(index, 'description', newText),
                            `Description for ${edu.degree}`
                          )}
                          title="Generate description with AI"
                        >
                          <Sparkles size={20} />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          ))}
        </div>
      </section>
      {aiEditConfig && (
        <AiHelperDialog
          isOpen={isAiDialogOpen}
          onOpenChange={setIsAiDialogOpen}
          contentToRewrite={aiEditConfig.content}
          onContentRewritten={aiEditConfig.onUpdate}
          contextLabel={aiEditConfig.label}
        />
      )}
    </div>
  );
}
