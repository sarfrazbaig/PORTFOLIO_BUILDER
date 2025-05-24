
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePortfolioContext } from '@/contexts/portfolio-context';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Lightbulb, Code, Zap, Target, Users, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

type ProjectType = ParseCvOutput['projects'][0];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cvData } = usePortfolioContext();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cvData && params.projectName) {
      const projectName = decodeURIComponent(params.projectName as string);
      const foundProject = cvData.projects.find(p => p.name === projectName);
      setProject(foundProject || null);
    }
    setIsLoading(false);
  }, [cvData, params.projectName]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <p className="text-xl text-muted-foreground">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-destructive">Project Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The project you are looking for could not be found. It might have been moved or the name changed.
            </p>
            <Button onClick={() => router.push('/portfolio/projects')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 md:py-16 px-6">
      <Button variant="outline" onClick={() => router.push('/portfolio/projects')} className="mb-8 group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:animate-pingOnce" /> Back to All Projects
      </Button>

      <article className="bg-card p-6 md:p-10 rounded-xl shadow-2xl border border-border/50">
        <header className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">{project.name}</h1>
          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="text-accent border-accent hover:bg-accent hover:text-accent-foreground">
                View Live Project <ExternalLink size={18} className="ml-2" />
              </Button>
            </a>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2 space-y-8">
            <section id="project-overview">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Lightbulb className="mr-3 text-accent" />Overview</h2>
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden shadow-lg mb-6 border border-border">
                <Image
                  src={`https://placehold.co/800x450.png`}
                  alt={`${project.name} screenshot`}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                  data-ai-hint="project detail main image"
                />
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.description || 'Detailed project description will go here. This section can be enhanced using AI to elaborate on the project specifics, its impact, and the journey of its creation.'}
              </p>
            </section>
            
            <Separator />

            <section id="project-features">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Zap className="mr-3 text-accent"/>Key Features</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-lg">
                <li>Feature 1: Placeholder for a key feature. AI can help generate this.</li>
                <li>Feature 2: Another placeholder feature.</li>
                <li>Feature 3: More detailed feature description.</li>
              </ul>
               <p className="mt-3 text-sm text-muted-foreground/80 italic">Hint: Use the AI Helper to expand on these features!</p>
            </section>
            
            <Separator />

             <section id="project-role">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Users className="mr-3 text-accent"/>My Role</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Placeholder for describing your specific role and contributions to this project. What were your responsibilities? What did you directly build or manage?
              </p>
               <p className="mt-3 text-sm text-muted-foreground/80 italic">Hint: Use the AI Helper to detail your contributions!</p>
            </section>
            
            <Separator />

            <section id="project-challenges">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><ShieldCheck className="mr-3 text-accent"/>Challenges & Solutions</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Placeholder for discussing any challenges faced during the project and how they were overcome. This is a great place to showcase problem-solving skills.
              </p>
               <p className="mt-3 text-sm text-muted-foreground/80 italic">Hint: Use the AI Helper to articulate challenges and solutions!</p>
            </section>
          </div>

          <aside className="md:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center"><Target className="mr-2 text-primary" />Project Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Placeholder for main project objectives. AI can help define these clearly.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center"><Code className="mr-2 text-primary" />Technologies Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'TailwindCSS', 'TypeScript', 'Genkit'].map(tech => (
                    <span key={tech} className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
                 <p className="mt-3 text-xs text-muted-foreground/80 italic">Update this list with actual technologies used. AI can also help identify technologies if mentioned in the description.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </article>
    </div>
  );
}
