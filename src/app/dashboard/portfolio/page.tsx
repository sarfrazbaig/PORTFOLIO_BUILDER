
'use client';

import { useEffect, useState } from 'react';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import type { RecommendThemeOutput } from '@/ai/flows/ai-theme-recommendation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, GraduationCap, Lightbulb, Mail, Phone, Linkedin, Github, UserCircle, FileText, Sparkles, Link as LinkIcon, Palette, ExternalLink, Info, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const CV_DATA_KEY = 'cvPortfolioData';
const THEME_RECOMMENDATION_KEY = 'cvPortfolioTheme';

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
  const [profession, setProfession] = useState<string | null>(null);


  useEffect(() => {
    const storedCvData = localStorage.getItem(CV_DATA_KEY);
    const storedTheme = localStorage.getItem(THEME_RECOMMENDATION_KEY);
    
    if (storedCvData) {
      try {
        const parsedData = JSON.parse(storedCvData) as ParseCvOutput;
        setCvData(parsedData);
        if (parsedData.experience && parsedData.experience.length > 0) {
          setProfession(parsedData.experience[0].title);
        } else if (parsedData.summary) {
            setProfession(parsedData.summary.split(' ').slice(0,3).join(' ') + "...");
        } else {
            setProfession("Professional");
        }
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
        <Card className="max-w-lg mx-auto shadow-lg border-destructive">
          <CardHeader>
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
              <Info className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive mt-4">Portfolio Data Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-6 text-lg">
              It looks like we couldn&apos;t find your CV data or theme recommendation. Please go back to the dashboard and upload your CV first.
            </CardDescription>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { personalInformation, summary, experience, education, skills, projects } = cvData;
  const themeClass = `theme-${theme.themeName.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`min-h-screen bg-background text-foreground ${themeClass} flex flex-col`}>
      <header className="bg-card/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
             <Avatar className="h-20 w-20 border-4 border-primary shadow-lg">
              <AvatarImage src={`https://placehold.co/120x120.png?text=${getInitials(personalInformation.name)}`} alt={personalInformation.name || 'User Avatar'} data-ai-hint="profile photo"/>
              <AvatarFallback className="text-2xl">{getInitials(personalInformation.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold text-primary">{personalInformation.name}</h1>
              {profession && <p className="text-xl text-muted-foreground font-medium">{profession}</p>}
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground">Applied Theme:</p>
            <p className="text-xl font-semibold text-accent flex items-center justify-center sm:justify-end">
              <Palette size={22} className="mr-2"/>
              {theme.themeName}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4 md:px-6 space-y-16 flex-grow">
        
        { (personalInformation.email || personalInformation.phone || personalInformation.linkedin || personalInformation.github) &&
          <Card className="shadow-xl border-l-4 border-primary">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center"><UserCircle size={28} className="mr-3 text-primary"/>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-lg">
              {personalInformation.email && (
                <a href={`mailto:${personalInformation.email}`} className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors group">
                  <Mail size={20} className="text-muted-foreground group-hover:text-primary" /> <span>{personalInformation.email}</span>
                </a>
              )}
              {personalInformation.phone && (
                <p className="flex items-center space-x-3">
                  <Phone size={20} className="text-muted-foreground" /> <span>{personalInformation.phone}</span>
                </p>
              )}
              {personalInformation.linkedin && (
                <a href={personalInformation.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors group">
                  <Linkedin size={20} className="text-muted-foreground group-hover:text-primary" /> <span>LinkedIn Profile</span> <ExternalLink size={16} className="opacity-60 group-hover:opacity-100 transition-opacity"/>
                </a>
              )}
              {personalInformation.github && (
                <a href={personalInformation.github} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors group">
                  <Github size={20} className="text-muted-foreground group-hover:text-primary" /> <span>GitHub Profile</span> <ExternalLink size={16} className="opacity-60 group-hover:opacity-100 transition-opacity"/>
                </a>
              )}
            </CardContent>
          </Card>
        }

        {summary && (
          <Card className="shadow-xl border-l-4 border-accent">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center"><FileText size={28} className="mr-3 text-accent"/>Professional Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-lg text-muted-foreground whitespace-pre-line leading-relaxed">{summary}</p>
            </CardContent>
          </Card>
        )}

        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center text-primary"><Briefcase size={32} className="mr-4"/>Work Experience</h2>
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <Card key={index} className="shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border">
                  <CardHeader className="bg-muted/30 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <CardTitle className="text-xl text-primary">{exp.title}</CardTitle>
                        <CardDescription className="text-md font-medium text-foreground">{exp.company}</CardDescription>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 sm:mt-0 sm:pt-1 whitespace-nowrap bg-secondary px-3 py-1 rounded-full">{exp.dates}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-md text-muted-foreground whitespace-pre-line leading-relaxed">{exp.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {education && education.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center text-primary"><GraduationCap size={32} className="mr-4"/>Education</h2>
            <div className="space-y-8">
              {education.map((edu, index) => (
                <Card key={index} className="shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border">
                  <CardHeader className="bg-muted/30 p-6">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <CardTitle className="text-xl text-primary">{edu.degree}</CardTitle>
                          <CardDescription className="text-md font-medium text-foreground">{edu.institution}</CardDescription>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 sm:mt-0 sm:pt-1 whitespace-nowrap bg-secondary px-3 py-1 rounded-full">{edu.dates}</p>
                      </div>
                  </CardHeader>
                  {edu.description && (
                    <CardContent className="p-6">
                      <p className="text-md text-muted-foreground whitespace-pre-line leading-relaxed">{edu.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {skills && skills.length > 0 && (
         <Card className="shadow-xl border-l-4 border-primary">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center"><Sparkles size={28} className="mr-3 text-primary"/>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span key={index} className="bg-primary/10 text-primary text-md font-semibold px-5 py-2 rounded-full shadow-sm hover:bg-primary/20 transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center text-primary"><Lightbulb size={32} className="mr-4"/>Featured Projects</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <Card key={index} className="shadow-lg flex flex-col hover:shadow-2xl transition-shadow duration-300 border overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <Image 
                      src={`https://placehold.co/600x400.png`} 
                      alt={project.name || 'Project image'} 
                      width={600} 
                      height={400} 
                      className="rounded-t-md object-cover aspect-video group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint="project application screenshot"
                    />
                  </div>
                  <CardHeader className="p-6">
                    <CardTitle className="text-xl text-primary">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex-grow">
                    <p className="text-md text-muted-foreground mb-4 whitespace-pre-line leading-relaxed">{project.description}</p>
                  </CardContent>
                  {project.url && (
                    <CardContent className="p-6 pt-0 border-t mt-auto">
                       <a href={project.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full group/link text-accent border-accent hover:bg-accent hover:text-accent-foreground">
                            View Project <ExternalLink size={18} className="ml-2 opacity-70 group-hover/link:opacity-100 transition-opacity" />
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

      <footer className="py-10 mt-16 border-t bg-muted/50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Link href="/dashboard" className="mb-4 inline-block">
            <Button variant="ghost" size="lg">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
          <p className="text-md text-muted-foreground">
            &copy; {new Date().getFullYear()} {personalInformation.name}. Portfolio crafted with CV Portfolio Pro.
          </p>
        </div>
      </footer>
    </div>
  );
}

