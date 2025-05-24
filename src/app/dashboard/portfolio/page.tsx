
'use client';

import { useEffect, useState } from 'react';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import type { RecommendThemeOutput } from '@/ai/flows/ai-theme-recommendation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, GraduationCap, Lightbulb, Mail, Phone, Linkedin, Github, UserCircle, FileText, Sparkles, Link as LinkIcon, MapPin, CalendarDays, Palette, ExternalLink, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; // For placeholder images

const CV_DATA_KEY = 'cvPortfolioData';
const THEME_RECOMMENDATION_KEY = 'cvPortfolioTheme';

// Helper function to create a fallback initial from name
const getInitials = (name?: string) => {
  if (!name) return '??';
  const names = name.split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function PortfolioPage() {
  const [cvData, setCvData] = useState<ParseCvOutput | null>(null);
  const [theme, setTheme] = useState<RecommendThemeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedCvData = localStorage.getItem(CV_DATA_KEY);
    const storedTheme = localStorage.getItem(THEME_RECOMMENDATION_KEY);

    if (storedCvData) {
      try {
        setCvData(JSON.parse(storedCvData));
      } catch (e) {
        console.error("Failed to parse CV data from localStorage", e);
      }
    }

    if (storedTheme) {
       try {
        setTheme(JSON.parse(storedTheme));
      } catch (e) {
        console.error("Failed to parse theme from localStorage", e);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  if (!cvData || !theme) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <Card className="max-w-lg mx-auto shadow-lg">
          <CardHeader>
            <Info className="h-16 w-16 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">Portfolio Data Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-6">
              It looks like we couldn&apos;t find your CV data. Please go back to the dashboard and upload your CV first.
            </CardDescription>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { personalInformation, summary, experience, education, skills, projects } = cvData;

  // Basic theme class application
  const themeClass = `theme-${theme.themeName.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`min-h-screen bg-background text-foreground ${themeClass}`}>
      <header className="bg-card/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
             <Avatar className="h-16 w-16 border-2 border-primary">
              {/* Placeholder for actual image upload functionality */}
              <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(personalInformation.name)}`} alt={personalInformation.name} data-ai-hint="profile picture" />
              <AvatarFallback>{getInitials(personalInformation.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-primary">{personalInformation.name}</h1>
              {/* Optionally, add a profession or title here if available in CV data */}
              <p className="text-md text-muted-foreground">Powered by AI Portfolio Builder</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">Recommended Theme:</p>
            <p className="text-lg font-semibold text-accent flex items-center justify-center md:justify-end">
              <Palette size={20} className="mr-2"/>
              {theme.themeName}
            </p>
          </div>
        </div>
        <Separator/>
      </header>

      <main className="container mx-auto py-8 px-4 md:px-6 space-y-12">
        {/* Contact Information Section */}
         { (personalInformation.email || personalInformation.phone || personalInformation.linkedin || personalInformation.github) &&
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-xl flex items-center"><UserCircle size={24} className="mr-3 text-primary"/>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personalInformation.email && (
                <a href={`mailto:${personalInformation.email}`} className="flex items-center space-x-2 text-sm hover:text-primary transition-colors group">
                  <Mail size={18} className="text-muted-foreground group-hover:text-primary" /> <span>{personalInformation.email}</span>
                </a>
              )}
              {personalInformation.phone && (
                <p className="flex items-center space-x-2 text-sm">
                  <Phone size={18} className="text-muted-foreground" /> <span>{personalInformation.phone}</span>
                </p>
              )}
              {personalInformation.linkedin && (
                <a href={personalInformation.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm hover:text-primary transition-colors group">
                  <Linkedin size={18} className="text-muted-foreground group-hover:text-primary" /> <span>LinkedIn Profile</span> <ExternalLink size={14} className="opacity-50 group-hover:opacity-100"/>
                </a>
              )}
              {personalInformation.github && (
                <a href={personalInformation.github} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm hover:text-primary transition-colors group">
                  <Github size={18} className="text-muted-foreground group-hover:text-primary" /> <span>GitHub Profile</span> <ExternalLink size={14} className="opacity-50 group-hover:opacity-100"/>
                </a>
              )}
            </CardContent>
          </Card>
        }


        {/* Summary Section */}
        {summary && (
          <Card className="shadow-lg">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-xl flex items-center"><FileText size={24} className="mr-3 text-primary"/>Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Experience Section */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center"><Briefcase size={28} className="mr-3 text-primary"/>Work Experience</h2>
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <Card key={index} className="shadow-md overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{exp.title}</CardTitle>
                        <CardDescription className="text-base">{exp.company}</CardDescription>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-nowrap pt-1">{exp.dates}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{exp.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center"><GraduationCap size={28} className="mr-3 text-primary"/>Education</h2>
            <div className="space-y-6">
              {education.map((edu, index) => (
                <Card key={index} className="shadow-md overflow-hidden">
                  <CardHeader>
                     <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{edu.degree}</CardTitle>
                          <CardDescription className="text-base">{edu.institution}</CardDescription>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-nowrap pt-1">{edu.dates}</p>
                      </div>
                  </CardHeader>
                  {edu.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{edu.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-xl flex items-center"><Sparkles size={24} className="mr-3 text-primary"/>Skills</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span key={index} className="bg-accent/10 text-accent text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center"><Lightbulb size={28} className="mr-3 text-primary"/>Projects</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <Card key={index} className="shadow-md flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <Image 
                      src={`https://placehold.co/600x400.png`} 
                      alt={project.name} 
                      width={600} 
                      height={400} 
                      className="rounded-md mb-4 object-cover aspect-video"
                      data-ai-hint="project screenshot"
                    />
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line leading-relaxed">{project.description}</p>
                  </CardContent>
                  {project.url && (
                    <CardContent className="pt-0 border-t mt-auto">
                       <a href={project.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="link" className="px-0 text-accent group">
                            View Project <ExternalLink size={16} className="ml-2 opacity-70 group-hover:opacity-100" />
                        </Button>
                      </a>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="py-8 mt-12 border-t bg-muted/50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {personalInformation.name}. Portfolio created with CV Portfolio Pro.
          </p>
           <Link href="/dashboard" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
        </div>
      </footer>
    </div>
  );
}
