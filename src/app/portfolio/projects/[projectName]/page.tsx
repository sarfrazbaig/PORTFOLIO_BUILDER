
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePortfolioContext } from '@/contexts/portfolio-context';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ExternalLink, Lightbulb, Code, Zap, Target, Users, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
// Link component from Next.js is not used here for direct navigation to external sites
import { Separator } from '@/components/ui/separator';

type ProjectType = ParseCvOutput['projects'][0];

// Define placeholder texts for sections if they don't exist in project data
const placeholderData = {
  keyFeatures: "Feature 1: Placeholder for a key feature. AI can help generate this.\nFeature 2: Another placeholder feature.\nFeature 3: More detailed feature description.",
  myRole: "Placeholder for describing your specific role and contributions to this project. What were your responsibilities? What did you directly build or manage?",
  challengesSolutions: "Placeholder for discussing any challenges faced during the project and how they were overcome. This is a great place to showcase problem-solving skills.",
  projectGoals: "Placeholder for main project objectives. AI can help define these clearly.",
  technologiesUsed: "React, Next.js, TailwindCSS, TypeScript, Genkit" // Example, should be made editable
};


export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cvData, isEditMode, updateCvField } = usePortfolioContext();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [projectIndex, setProjectIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const decodedProjectName = useMemo(() => {
    return params.projectName ? decodeURIComponent(params.projectName as string) : null;
  }, [params.projectName]);

  useEffect(() => {
    if (cvData && decodedProjectName) {
      const foundIndex = cvData.projects.findIndex(p => p.name === decodedProjectName);
      if (foundIndex !== -1) {
        setProject(cvData.projects[foundIndex]);
        setProjectIndex(foundIndex);
      } else {
        setProject(null);
        setProjectIndex(null);
      }
    }
    setIsLoading(false);
  }, [cvData, decodedProjectName]);

  const handleInputChange = (field: keyof ProjectType | 'keyFeatures' | 'myRole' | 'challengesSolutions' | 'projectGoals' | 'technologiesUsed', value: string) => {
    if (projectIndex === null) return;
    // For fields directly on project object (name, description, url)
    if (field === 'name' || field === 'description' || field === 'url') {
         updateCvField(`projects.${projectIndex}.${field}`, value);
    } else {
        // For extended fields that might not be in the original schema
        // We create or update them. These are custom fields for the detail page.
        // Make sure the project object can store these custom fields.
        // The ParseCvOutput['projects'][0] type might need to be extended or use a more general type.
        // For simplicity, let's assume we can add them.
        updateCvField(`projects.${projectIndex}.${field}`, value);
    }
  };
  
  // Helper to get project specific data or placeholder
  const getProjectField = (fieldName: keyof typeof placeholderData) => {
    return (project && (project as any)[fieldName]) || placeholderData[fieldName];
  };


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
              The project named &quot;{decodedProjectName}&quot; could not be found. It might have been moved or the name changed.
            </p>
            <Button onClick={() => router.push('/portfolio/projects')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If project name is edited, the title should reflect the current project name, not the param
  const currentProjectName = project?.name || decodedProjectName;


  return (
    <div className="container mx-auto py-12 md:py-16 px-6">
      <Button variant="outline" onClick={() => router.push('/portfolio/projects')} className="mb-8 group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:animate-pingOnce" /> Back to All Projects
      </Button>

      <article className="bg-card p-6 md:p-10 rounded-xl shadow-2xl border border-border/50">
        <header className="mb-8 md:mb-12">
          {isEditMode ? (
            <Input
              value={project.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Project Name"
              className="text-4xl md:text-5xl font-bold text-primary mb-3 bg-transparent border-2 border-dashed border-primary/30 focus:border-primary"
            />
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">{currentProjectName}</h1>
          )}
          {isEditMode && projectIndex !== null ? (
            <div className="flex items-center gap-2">
              <ExternalLink size={18} className="text-muted-foreground" />
              <Input 
                value={project.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="Project URL (e.g., https://example.com)"
                className="text-accent bg-transparent border-b-2 border-dashed border-accent/50 focus:border-accent"
              />
            </div>
          ) : (
            project.url && (
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="text-accent border-accent hover:bg-accent hover:text-accent-foreground">
                  View Live Project <ExternalLink size={18} className="ml-2" />
                </Button>
              </a>
            )
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2 space-y-8">
            <section id="project-overview">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Lightbulb className="mr-3 text-accent" />Overview</h2>
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden shadow-lg mb-6 border border-border">
                <Image
                  src={`https://placehold.co/800x450.png`}
                  alt={`${project.name || 'Project'} screenshot`}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                  data-ai-hint="project detail main image"
                />
                 {isEditMode && <p className="absolute bottom-2 right-2 text-xs bg-black/50 text-white p-1 rounded">Image upload coming soon</p>}
              </div>
              {isEditMode && projectIndex !== null ? (
                <Textarea
                  value={project.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed project description..."
                  className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[150px]"
                  rows={6}
                />
              ) : (
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {project.description || 'Detailed project description will go here.'}
                </p>
              )}
            </section>
            
            <Separator />

            <section id="project-features">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Zap className="mr-3 text-accent"/>Key Features</h2>
              {isEditMode && projectIndex !== null ? (
                <Textarea
                  value={getProjectField('keyFeatures')}
                  onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
                  placeholder="List key features..."
                  className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[100px]"
                  rows={4}
                />
              ) : (
                 <ul className="list-disc list-inside space-y-2 text-muted-foreground text-lg whitespace-pre-line">
                    {getProjectField('keyFeatures').split('\n').map((feature, i) => feature.trim() && <li key={i}>{feature.replace(/^- /,'')}</li>)}
                 </ul>
              )}
               {!isEditMode && <p className="mt-3 text-sm text-muted-foreground/80 italic">Hint: Use the AI Helper to expand on these features!</p>}
            </section>
            
            <Separator />

             <section id="project-role">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Users className="mr-3 text-accent"/>My Role</h2>
              {isEditMode && projectIndex !== null ? (
                <Textarea
                  value={getProjectField('myRole')}
                  onChange={(e) => handleInputChange('myRole', e.target.value)}
                  placeholder="Describe your role and contributions..."
                  className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[100px]"
                  rows={4}
                />
              ) : (
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {getProjectField('myRole')}
                </p>
              )}
              {!isEditMode && <p className="mt-3 text-sm text-muted-foreground/80 italic">Hint: Use the AI Helper to detail your contributions!</p>}
            </section>
            
            <Separator />

            <section id="project-challenges">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><ShieldCheck className="mr-3 text-accent"/>Challenges & Solutions</h2>
               {isEditMode && projectIndex !== null ? (
                <Textarea
                  value={getProjectField('challengesSolutions')}
                  onChange={(e) => handleInputChange('challengesSolutions', e.target.value)}
                  placeholder="Discuss challenges and solutions..."
                  className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[100px]"
                  rows={4}
                />
              ) : (
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {getProjectField('challengesSolutions')}
                </p>
              )}
               {!isEditMode && <p className="mt-3 text-sm text-muted-foreground/80 italic">Hint: Use the AI Helper to articulate challenges and solutions!</p>}
            </section>
          </div>

          <aside className="md:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center"><Target className="mr-2 text-primary" />Project Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditMode && projectIndex !== null ? (
                  <Textarea
                    value={getProjectField('projectGoals')}
                    onChange={(e) => handleInputChange('projectGoals', e.target.value)}
                    placeholder="Main project objectives..."
                    className="text-muted-foreground bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[80px]"
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground whitespace-pre-line">
                    {getProjectField('projectGoals')}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center"><Code className="mr-2 text-primary" />Technologies Used</CardTitle>
              </CardHeader>
              <CardContent>
                 {isEditMode && projectIndex !== null ? (
                  <Textarea
                    value={(project as any).technologiesUsed || placeholderData.technologiesUsed}
                    onChange={(e) => handleInputChange('technologiesUsed', e.target.value)}
                    placeholder="Comma-separated list of technologies"
                    className="text-muted-foreground bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[80px]"
                    rows={3}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {((project as any).technologiesUsed || placeholderData.technologiesUsed).split(',').map((tech: string) => tech.trim() && (
                      <span key={tech.trim()} className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
                 {!isEditMode && <p className="mt-3 text-xs text-muted-foreground/80 italic">Update this list with actual technologies used. AI can also help identify technologies if mentioned in the description.</p>}
              </CardContent>
            </Card>
          </aside>
        </div>
      </article>
    </div>
  );
}

    