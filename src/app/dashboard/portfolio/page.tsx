
'use client';

import { useEffect, useState } from 'react';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import type { RecommendThemeOutput } from '@/ai/flows/ai-theme-recommendation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, GraduationCap, Lightbulb, Mail, Phone, Linkedin, Github, UserCircle, FileText, Sparkles, Link as LinkIcon, Palette, ExternalLink, Info, ArrowLeft, Loader2, MapPin, CalendarDays } from 'lucide-react';
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
            // Try to infer profession from summary if no direct experience title
            const summaryWords = parsedData.summary.toLowerCase().split(' ');
            const commonTitles = ['engineer', 'developer', 'designer', 'manager', 'analyst', 'specialist', 'consultant', 'architect'];
            let inferredProfession = '';
            for (const title of commonTitles) {
                if (summaryWords.includes(title)) {
                    inferredProfession = title.charAt(0).toUpperCase() + title.slice(1);
                    break;
                }
            }
            setProfession(inferredProfession || "Professional");
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
        <Card className="max-w-lg mx-auto shadow-lg border-destructive bg-destructive/5">
          <CardHeader>
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
              <Info className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive mt-4">Portfolio Data Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-6 text-lg text-destructive-foreground/80">
              It looks like we couldn&apos;t find your CV data or theme recommendation. Please go back to the dashboard and upload your CV first.
            </CardDescription>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="border-destructive text-destructive hover:bg-destructive/10">
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
    <div className={`min-h-screen bg-background text-foreground ${themeClass} flex flex-col antialiased`}>
      
      {/* Site Header */}
      <header className="bg-card/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-primary tracking-tight">{personalInformation.name}</h1>
              {profession && <p className="text-lg text-muted-foreground font-medium">{profession}</p>}
            </div>
            <div className="text-center sm:text-right bg-primary/10 px-4 py-2 rounded-lg shadow-sm">
              <p className="text-xs text-primary/80 uppercase tracking-wider font-semibold">Applied Theme</p>
              <p className="text-lg font-bold text-primary flex items-center justify-center sm:justify-end">
                <Palette size={20} className="mr-2"/>
                {theme.themeName}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero/Introduction Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-card via-background to-background border-b border-border/30">
        <div className="container mx-auto px-6 text-center">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 mx-auto mb-6 border-4 border-primary shadow-xl">
            <AvatarImage src={`https://placehold.co/160x160.png?text=${getInitials(personalInformation.name)}`} alt={personalInformation.name || 'User Avatar'} data-ai-hint="profile portrait"/>
            <AvatarFallback className="text-4xl md:text-5xl">{getInitials(personalInformation.name)}</AvatarFallback>
          </Avatar>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Hello, I&apos;m <span className="text-primary">{personalInformation.name}</span>.
          </h2>
          {summary && (
             <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {summary}
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
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
      
      <main className="container mx-auto py-12 md:py-16 px-6 space-y-16 md:space-y-20 flex-grow">
        
        { (personalInformation.email || personalInformation.phone) && (!summary) && /* Show contact only if no summary */
          <Card className="shadow-xl border-l-4 border-primary/70 bg-card/80 backdrop-blur-sm">
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
            </CardContent>
          </Card>
        }

        {experience && experience.length > 0 && (
          <section id="experience">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center">
                <Briefcase size={36} className="mr-4"/>Work Experience
              </h2>
              <p className="text-lg text-muted-foreground mt-2">My professional journey and accomplishments.</p>
            </div>
            <div className="space-y-10">
              {experience.map((exp, index) => (
                <Card key={index} className="shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-primary bg-card/90 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="p-6 md:p-8 bg-muted/20">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <CardTitle className="text-xl md:text-2xl text-primary">{exp.title}</CardTitle>
                        <CardDescription className="text-md md:text-lg font-medium text-foreground">{exp.company}</CardDescription>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 sm:mt-0 pt-1 whitespace-nowrap bg-secondary px-4 py-2 rounded-full shadow-sm font-medium">
                        <CalendarDays size={16} className="inline mr-2 opacity-70"/>{exp.dates}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                    <p className="text-md md:text-lg text-muted-foreground whitespace-pre-line leading-relaxed">{exp.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
        
        <Separator className="my-12 md:my-16 border-border/50"/>

        {education && education.length > 0 && (
          <section id="education">
             <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center">
                <GraduationCap size={36} className="mr-4"/>Education
              </h2>
              <p className="text-lg text-muted-foreground mt-2">My academic background and qualifications.</p>
            </div>
            <div className="space-y-10">
              {education.map((edu, index) => (
                <Card key={index} className="shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-accent bg-card/90 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="p-6 md:p-8 bg-muted/20">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <CardTitle className="text-xl md:text-2xl text-accent">{edu.degree}</CardTitle>
                          <CardDescription className="text-md md:text-lg font-medium text-foreground">{edu.institution}</CardDescription>
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
        )}

        <Separator className="my-12 md:my-16 border-border/50"/>

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
                    <span key={index} className="bg-primary/10 text-primary text-md md:text-lg font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary/20 transition-all cursor-default transform hover:scale-105">
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <Separator className="my-12 md:my-16 border-border/50"/>

        {projects && projects.length > 0 && (
          <section id="projects">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center">
                <Lightbulb size={36} className="mr-4"/>Featured Projects
              </h2>
              <p className="text-lg text-muted-foreground mt-2">Some of the projects I've worked on.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              {projects.map((project, index) => (
                <Card key={index} className="shadow-lg flex flex-col hover:shadow-2xl transition-shadow duration-300 border-2 border-border/30 hover:border-accent group bg-card/90 backdrop-blur-sm overflow-hidden rounded-xl">
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <Image 
                      src={`https://placehold.co/600x375.png`} 
                      alt={project.name || 'Project image'} 
                      width={600} 
                      height={375} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint="project application screenshot"
                    />
                  </div>
                  <CardHeader className="p-6">
                    <CardTitle className="text-xl md:text-2xl text-primary group-hover:text-accent transition-colors">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex-grow">
                    <p className="text-md text-muted-foreground mb-4 whitespace-pre-line leading-relaxed">{project.description}</p>
                  </CardContent>
                  {project.url && (
                    <CardContent className="p-6 pt-0 border-t border-border/30 mt-auto">
                       <a href={project.url} target="_blank" rel="noopener noreferrer" className="block mt-4">
                        <Button variant="outline" className="w-full group/link text-accent border-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 transform hover:scale-105 py-3 text-md">
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

      <footer className="py-12 mt-16 border-t border-border/30 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <Link href="/dashboard" className="mb-6 inline-block">
            <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
          <p className="text-md text-muted-foreground">
            &copy; {new Date().getFullYear()} {personalInformation.name}. Portfolio crafted with CV Portfolio Pro.
          </p>
           <p className="text-xs text-muted-foreground/70 mt-2">
            Theme: <span className="font-semibold">{theme.themeName}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
