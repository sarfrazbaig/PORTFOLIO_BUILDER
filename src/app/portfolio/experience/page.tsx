
'use client';

import { useState } from 'react'; 
import { usePortfolioContext } from '@/contexts/portfolio-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, CalendarDays, Sparkles } from 'lucide-react'; 
import AiHelperDialog from '@/components/ai-helper-dialog'; 

interface AiEditConfig {
  content: string;
  onUpdate: (newText: string) => void;
  label: string;
}

export default function ExperiencePage() {
  const { cvData, isEditMode, updateCvField } = usePortfolioContext();
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiEditConfig, setAiEditConfig] = useState<AiEditConfig | null>(null);

  if (!cvData || !cvData.experience || cvData.experience.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <p className="text-xl text-muted-foreground">No experience data found.</p>
      </div>
    );
  }

  const { experience } = cvData;

  const handleInputChange = (index: number, field: string, value: string) => {
    updateCvField(`experience.${index}.${field}`, value);
  };

  const openAiDialog = (content: string, onUpdate: (newText: string) => void, label: string) => {
    setAiEditConfig({ content, onUpdate, label });
    setIsAiDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-12 md:py-16 px-6">
      <section id="experience">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
            <Briefcase size={40} className="mr-4"/>Work Experience
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            My professional journey, detailing roles, responsibilities, and accomplishments.
          </p>
        </div>
        <div className="space-y-10 md:space-y-12 max-w-4xl mx-auto">
          {experience.map((exp, index) => (
            <Card 
              key={index} 
              className="themed-card shadow-lg border-t-4 border-primary bg-card/90 backdrop-blur-sm overflow-hidden hover:-translate-y-1 transition-all duration-300 ease-in-out"
            >
              <CardHeader className="p-6 md:p-8 bg-muted/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex-grow">
                    {isEditMode ? (
                      <Input
                        value={exp.title}
                        onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                        placeholder="Job Title"
                        className="text-xl md:text-2xl text-primary font-semibold bg-transparent border-2 border-dashed border-primary/30 focus:border-primary mb-1"
                      />
                    ) : (
                      <CardTitle className="text-xl md:text-2xl text-primary">{exp.title}</CardTitle>
                    )}
                    {isEditMode ? (
                      <Input
                        value={exp.company}
                        onChange={(e) => handleInputChange(index, 'company', e.target.value)}
                        placeholder="Company Name"
                        className="text-md md:text-lg font-medium text-foreground bg-transparent border-2 border-dashed border-primary/30 focus:border-primary"
                      />
                    ) : (
                      <CardDescription className="text-md md:text-lg font-medium text-foreground">{exp.company}</CardDescription>
                    )}
                  </div>
                  {isEditMode ? (
                     <Input
                        value={exp.dates}
                        onChange={(e) => handleInputChange(index, 'dates', e.target.value)}
                        placeholder="Dates (e.g., Jan 2020 - Present)"
                        className="text-sm text-muted-foreground bg-transparent border-2 border-dashed border-primary/30 focus:border-primary mt-1 sm:mt-0 w-full sm:w-auto"
                      />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1 sm:mt-0 pt-1 whitespace-nowrap bg-secondary px-4 py-2 rounded-full shadow-sm font-medium">
                      <CalendarDays size={16} className="inline mr-2 opacity-70"/>{exp.dates}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="relative">
                  {isEditMode ? (
                    <Textarea
                      value={exp.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      placeholder="Role description and achievements..."
                      className="text-md md:text-lg text-muted-foreground whitespace-pre-line leading-relaxed bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[120px] pr-10"
                      rows={5}
                    />
                  ) : (
                    <p className="text-md md:text-lg text-muted-foreground whitespace-pre-line leading-relaxed">{exp.description}</p>
                  )}
                  {isEditMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-0 text-primary/70 hover:text-primary active:scale-90 transition-transform"
                      onClick={() => openAiDialog(
                        exp.description,
                        (newText) => handleInputChange(index, 'description', newText),
                        `Description for ${exp.title}`
                      )}
                      title="Rewrite description with AI"
                    >
                      <Sparkles size={20} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
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

    