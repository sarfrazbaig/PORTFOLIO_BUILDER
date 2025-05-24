
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePortfolioContext } from '@/contexts/portfolio-context';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription removed as not used directly
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ExternalLink, Lightbulb, Code, Zap, Target, Users, ShieldCheck, Sparkles } from 'lucide-react'; // Added Sparkles
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import AiHelperDialog from '@/components/ai-helper-dialog'; // Added AiHelperDialog

type ProjectType = ParseCvOutput['projects'][0] & {
  keyFeatures?: string;
  myRole?: string;
  challengesSolutions?: string;
  projectGoals?: string;
  technologiesUsed?: string;
};

const placeholderTexts = {
  keyFeatures: "Feature 1: ...\nFeature 2: ...\nFeature 3: ...",
  myRole: "My responsibilities included...",
  challengesSolutions: "One challenge was... which we solved by...",
  projectGoals: "The main goals were to achieve X, Y, and Z.",
  technologiesUsed: "React, Next.js, Tailwind CSS, TypeScript, Genkit"
};

interface AiEditConfig {
  content: string;
  onUpdate: (newText: string) => void;
  label: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cvData, isEditMode, updateCvField } = usePortfolioContext();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [projectIndex, setProjectIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiEditConfig, setAiEditConfig] = useState<AiEditConfig | null>(null);

  const decodedProjectName = useMemo(() => {
    return params.projectName ? decodeURIComponent(params.projectName as string) : null;
  }, [params.projectName]);

  useEffect(() => {
    if (cvData && decodedProjectName) {
      const foundIndex = cvData.projects.findIndex(p => p.name === decodedProjectName);
      if (foundIndex !== -1) {
        setProject(cvData.projects[foundIndex] as ProjectType);
        setProjectIndex(foundIndex);
      } else {
        setProject(null);
        setProjectIndex(null);
      }
    }
    setIsLoading(false);
  }, [cvData, decodedProjectName]);

  const handleProjectFieldChange = (field: keyof ProjectType, value: string) => {
    if (projectIndex === null) return;
    updateCvField(`projects.${projectIndex}.${field}`, value);
  };
  
  const openAiDialog = (content: string, onUpdate: (newText: string) => void, label: string) => {
    setAiEditConfig({ content, onUpdate, label });
    setIsAiDialogOpen(true);
  };

  const getProjectField = (fieldName: keyof typeof placeholderTexts) => {
    return (project && project[fieldName]) || (isEditMode ? '' : placeholderTexts[fieldName]);
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
              The project named &quot;{decodedProjectName}&quot; could not be found.
            </p>
            <Button onClick={() => router.push('/portfolio/projects')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentProjectName = project?.name || decodedProjectName;

  const renderEditableSection = (
    fieldKey: keyof ProjectType,
    icon: React.ReactNode,
    title: string,
    placeholder: string,
    rows: number = 4
  ) => {
    const content = getProjectField(fieldKey as keyof typeof placeholderTexts);
    return (
      <section id={`project-${fieldKey}`}>
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">{icon}{title}</h2>
        <div className="relative">
          {isEditMode && projectIndex !== null ? (
            <Textarea
              value={content}
              onChange={(e) => handleProjectFieldChange(fieldKey, e.target.value)}
              placeholder={placeholder}
              className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[100px] pr-10"
              rows={rows}
            />
          ) : (
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {content || placeholder}
            </p>
          )}
          {isEditMode && projectIndex !== null && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-0 text-primary/70 hover:text-primary"
              onClick={() => openAiDialog(
                content,
                (newText) => handleProjectFieldChange(fieldKey, newText),
                `${title} for ${project.name}`
              )}
              title={`Edit ${title} with AI`}
            >
              <Sparkles size={20} />
            </Button>
          )}
        </div>
        {!isEditMode && (!content || content === placeholderTexts[fieldKey as keyof typeof placeholderTexts]) && <p className="mt-3 text-sm text-muted-foreground/80 italic">Hint: Use Edit Mode and the AI Helper to expand on this section!</p>}
      </section>
    );
  };
  
  const renderTechnologiesSection = () => {
    const techContent = (project?.technologiesUsed || (isEditMode ? '' : placeholderTexts.technologiesUsed));
    return (
       <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><Code className="mr-2 text-primary" />Technologies Used</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="relative">
            {isEditMode && projectIndex !== null ? (
            <Textarea
                value={techContent}
                onChange={(e) => handleProjectFieldChange('technologiesUsed', e.target.value)}
                placeholder="Comma-separated list of technologies (e.g., React, Node.js, Python)"
                className="text-muted-foreground bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[80px] pr-10"
                rows={3}
            />
            ) : (
            <div className="flex flex-wrap gap-2">
                {techContent.split(',').map((tech: string) => tech.trim() && (
                <span key={tech.trim()} className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium">
                    {tech.trim()}
                </span>
                ))}
            </div>
            )}
            {isEditMode && projectIndex !== null && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 text-primary/70 hover:text-primary p-1" // Adjusted positioning
                    onClick={() => openAiDialog(
                    techContent,
                    (newText) => handleProjectFieldChange('technologiesUsed', newText),
                    `Technologies for ${project.name}`
                    )}
                    title="Edit Technologies with AI"
                >
                    <Sparkles size={18} />
                </Button>
            )}
            </div>
            {!isEditMode && (techContent === placeholderTexts.technologiesUsed) && <p className="mt-3 text-xs text-muted-foreground/80 italic">Update this list with actual technologies used.</p>}
        </CardContent>
        </Card>
    );
  };


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
              onChange={(e) => handleProjectFieldChange('name', e.target.value)}
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
                onChange={(e) => handleProjectFieldChange('url', e.target.value)}
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
              <div className="relative">
                {isEditMode && projectIndex !== null ? (
                  <Textarea
                    value={project.description || ''}
                    onChange={(e) => handleProjectFieldChange('description', e.target.value)}
                    placeholder="Detailed project description..."
                    className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[150px] pr-10"
                    rows={6}
                  />
                ) : (
                  <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                    {project.description || 'Detailed project description will go here.'}
                  </p>
                )}
                {isEditMode && projectIndex !== null && (
                     <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-0 text-primary/70 hover:text-primary"
                        onClick={() => openAiDialog(
                        project.description || '',
                        (newText) => handleProjectFieldChange('description', newText),
                        `Overview for ${project.name}`
                        )}
                        title="Edit Overview with AI"
                    >
                        <Sparkles size={20} />
                    </Button>
                )}
              </div>
            </section>
            
            <Separator />
            {renderEditableSection('keyFeatures', <Zap className="mr-3 text-accent"/>, 'Key Features', placeholderTexts.keyFeatures, 4)}
            <Separator />
            {renderEditableSection('myRole', <Users className="mr-3 text-accent"/>, 'My Role', placeholderTexts.myRole, 4)}
            <Separator />
            {renderEditableSection('challengesSolutions', <ShieldCheck className="mr-3 text-accent"/>, 'Challenges & Solutions', placeholderTexts.challengesSolutions, 4)}
          </div>

          <aside className="md:col-span-1 space-y-6">
            {renderEditableSection('projectGoals', <Target className="mr-2 text-primary" />, 'Project Goals', placeholderTexts.projectGoals, 3)}
            {renderTechnologiesSection()}
          </aside>
        </div>
      </article>
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
