
'use client';

import { usePortfolioContext } from '@/contexts/portfolio-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Linkedin, Github, UserCircle, Sparkles, Edit3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const getInitials = (name?: string) => {
  if (!name) return '??';
  const names = name.split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function PortfolioHomePage() {
  const { cvData, profession, isEditMode, updateCvField, setCvData } = usePortfolioContext();

  if (!cvData) return null; 

  const { personalInformation, summary, skills } = cvData;

  const handleInputChange = (path: string, value: string) => {
    updateCvField(path, value);
  };

  // Specific handler for summary to ensure it updates the top-level summary
  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (cvData) {
      setCvData({ ...cvData, summary: e.target.value });
    }
  };
  
  const handleProfessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is a bit more complex as 'profession' is derived.
    // For now, let's assume we want to update the first job title if it exists,
    // or a new field if we decide to store profession explicitly.
    // For simplicity in this step, we'll make the displayed profession editable directly
    // which won't persist back to the original CV structure easily without more logic.
    // A better approach might be to edit the data that *derives* profession (e.g., latest job title).
    // For now, this is a UI-only edit for the 'profession' display.
    // To persist, we would need to update the context's profession state if it were separate.
    // Or, update the field that leads to its derivation (e.g. cvData.experience[0].title)
    if (cvData && cvData.experience && cvData.experience.length > 0) {
        const newExperience = [...cvData.experience];
        newExperience[0] = { ...newExperience[0], title: e.target.value };
        setCvData({ ...cvData, experience: newExperience });
    }
    // If no experience, this won't save back to CV data structure in a meaningful way for profession derivation.
  };


  return (
    <>
      {/* Hero/Introduction Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-card via-background to-background border-b border-border/30">
        <div className="container mx-auto px-6 text-center">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 mx-auto mb-6 border-4 border-primary shadow-xl">
            <AvatarImage 
              src={`https://placehold.co/160x160.png?text=${getInitials(personalInformation.name)}`} 
              alt={personalInformation.name || 'User Avatar'} 
              data-ai-hint="profile portrait"
            />
            <AvatarFallback className="text-4xl md:text-5xl">{getInitials(personalInformation.name)}</AvatarFallback>
          </Avatar>
          
          {isEditMode ? (
            <Input
              type="text"
              value={personalInformation.name || ''}
              onChange={(e) => handleInputChange('personalInformation.name', e.target.value)}
              className="text-4xl md:text-5xl font-extrabold text-foreground mb-2 text-center bg-transparent border-2 border-dashed border-primary/50 focus:border-primary"
              placeholder="Your Name"
            />
          ) : (
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">
              Hello, I&apos;m <span className="text-primary">{personalInformation.name}</span>.
            </h1>
          )}

          {isEditMode ? (
             <Input
              type="text"
              value={profession || ''}
              onChange={handleProfessionChange} // This needs careful consideration for persistence
              className="text-2xl md:text-3xl text-muted-foreground font-medium mb-6 text-center bg-transparent border-2 border-dashed border-primary/30 focus:border-primary"
              placeholder="Your Profession"
            />
          ) : (
            profession && <p className="text-2xl md:text-3xl text-muted-foreground font-medium mb-6">{profession}</p>
          )}
          
          {isEditMode ? (
            <Textarea
              value={summary || ''}
              onChange={handleSummaryChange}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[150px]"
              placeholder="Your professional summary..."
              rows={5}
            />
          ) : (
            summary && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {summary}
              </p>
            )
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {personalInformation.linkedin && (
              <a href={personalInformation.linkedin} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                  <Linkedin size={20} className="mr-2" /> LinkedIn
                </Button>
              </a>
            )}
            {personalInformation.github && (
              <a href={personalInformation.github} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10">
                  <Github size={20} className="mr-2" /> GitHub
                </Button>
              </a>
            )}
             {personalInformation.email && (
              <a href={`mailto:${personalInformation.email}`}>
                <Button variant="outline" size="lg" className="border-foreground/50 text-foreground/80 hover:bg-foreground/10">
                  <Mail size={20} className="mr-2" /> Email Me
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>
      
      <div className="container mx-auto py-12 md:py-16 px-6 space-y-16 md:space-y-20">
        { (personalInformation.email || personalInformation.phone || isEditMode) &&
          <Card className="shadow-xl border-l-4 border-primary/70 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center"><UserCircle size={28} className="mr-3 text-primary"/>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-lg">
              {isEditMode ? (
                <div className="flex items-center space-x-3">
                  <Mail size={20} className="text-muted-foreground" />
                  <Input 
                    type="email" 
                    value={personalInformation.email || ''} 
                    onChange={(e) => handleInputChange('personalInformation.email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="bg-transparent border-b-2 border-dashed border-primary/30 focus:border-primary"
                  />
                </div>
              ) : (
                personalInformation.email && (
                  <a href={`mailto:${personalInformation.email}`} className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors group">
                    <Mail size={20} className="text-muted-foreground group-hover:text-primary" /> 
                    <span>{personalInformation.email}</span>
                  </a>
                )
              )}
              {isEditMode ? (
                <div className="flex items-center space-x-3">
                  <Phone size={20} className="text-muted-foreground" />
                  <Input 
                    type="tel" 
                    value={personalInformation.phone || ''} 
                    onChange={(e) => handleInputChange('personalInformation.phone', e.target.value)}
                    placeholder="Your Phone Number"
                    className="bg-transparent border-b-2 border-dashed border-primary/30 focus:border-primary"
                  />
                </div>
              ) : (
                personalInformation.phone && (
                  <p className="flex items-center space-x-3">
                    <Phone size={20} className="text-muted-foreground" /> <span>{personalInformation.phone}</span>
                  </p>
                )
              )}
            </CardContent>
          </Card>
        }

        {skills && skills.length > 0 && (
         <section id="skills">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center">
                <Sparkles size={36} className="mr-4"/>Skills & Expertise
              </h2>
              <p className="text-lg text-muted-foreground mt-2">Technologies and tools I work with.</p>
            </div>
            <Card className="shadow-xl border-l-4 border-primary/70 bg-card/80 backdrop-blur-sm p-6 md:p-8">
              <CardContent className="pt-2">
                <div className="flex flex-wrap justify-center gap-4">
                  {skills.map((skill, index) => (
                    // Making skills editable would require a more complex UI (e.g., tags input or editing each skill individually)
                    // For now, skills are not directly editable in this pass.
                    <span key={index} className="bg-primary/10 text-primary text-md md:text-lg font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary/20 transition-all cursor-default transform hover:scale-105">
                      {skill}
                    </span>
                  ))}
                </div>
                {isEditMode && <p className="text-center text-sm text-muted-foreground mt-4 italic">(Skills editing coming soon via AI Helper or dedicated interface)</p>}
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </>
  );
}
