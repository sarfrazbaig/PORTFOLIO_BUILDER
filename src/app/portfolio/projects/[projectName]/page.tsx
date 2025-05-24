
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePortfolioContext } from '@/contexts/portfolio-context';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import { generateImage, type GenerateImageOutput } from '@/ai/flows/generate-image-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ExternalLink, Lightbulb, Code, Zap, Target, Users, ShieldCheck, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import NextImage from 'next/image'; // Renamed to avoid conflict with ImageIcon
import { Separator } from '@/components/ui/separator';
import AiHelperDialog from '@/components/ai-helper-dialog';
import { useToast } from '@/hooks/use-toast';


type ProjectType = ParseCvOutput['projects'][0] & {
  keyFeatures?: string;
  myRole?: string;
  challengesSolutions?: string;
  projectGoals?: string;
  technologiesUsed?: string;
  // imageDataUri and imagePrompt are now part of ParseCvOutput['projects'][0]
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
  const [isLoadingProjectData, setIsLoadingProjectData] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null); // For AI generation errors
  const [imageLoadError, setImageLoadError] = useState<string | null>(null); // For <Image> component errors

  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiEditConfig, setAiEditConfig] = useState<AiEditConfig | null>(null);
  const { toast } = useToast();

  const decodedProjectName = useMemo(() => {
    return params.projectName ? decodeURIComponent(params.projectName as string) : null;
  }, [params.projectName]);

  useEffect(() => {
    if (cvData && decodedProjectName) {
      const foundIndex = cvData.projects.findIndex(p => p.name === decodedProjectName);
      if (foundIndex !== -1) {
        setProject(cvData.projects[foundIndex] as ProjectType);
        setProjectIndex(foundIndex);
        setImageError(null); // Reset image error when project changes
        setImageLoadError(null);
      } else {
        setProject(null);
        setProjectIndex(null);
      }
    }
    setIsLoadingProjectData(false);
  }, [cvData, decodedProjectName]);

  const handleProjectFieldChange = (field: keyof ProjectType, value: string) => {
    if (projectIndex === null) return;
    updateCvField(`projects.${projectIndex}.${field}`, value);
  };
  
  const openAiDialog = (content: string, onUpdate: (newText: string) => void, label: string) => {
    setAiEditConfig({ content, onUpdate, label });
    setIsAiDialogOpen(true);
  };

  const handleGenerateProjectImage = async () => {
    if (!project || !project.imagePrompt || projectIndex === null) {
      toast({ title: 'Cannot Generate Image', description: 'Project data or image prompt is missing.', variant: 'destructive' });
      return;
    }
    setIsGeneratingImage(true);
    setImageError(null);
    setImageLoadError(null);
    toast({ title: 'Generating Project Image...', description: 'Please wait a moment.' });
    console.log("Attempting to generate image for project:", project.name, "with prompt:", project.imagePrompt);

    try {
      const result: GenerateImageOutput = await generateImage({ prompt: project.imagePrompt });
      if (result.imageDataUri) {
        updateCvField(`projects.${projectIndex}.imageDataUri`, result.imageDataUri);
        toast({ title: 'Image Generated!', description: 'Project image has been updated.' });
      } else {
        const errorMsg = result.error || 'Unknown error during image generation.';
        setImageError(errorMsg);
        toast({ title: 'Image Generation Failed', description: errorMsg, variant: 'destructive', duration: 8000 });
      }
    } catch (error: any) {
      console.error('Error generating project image:', error);
      const errorMsg = error.message || 'Failed to generate project image.';
      setImageError(errorMsg);
      toast({ title: 'Image Generation Error', description: errorMsg, variant: 'destructive', duration: 8000 });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const getProjectField = (fieldName: keyof ProjectType, placeholderKey?: keyof typeof placeholderTexts) => {
    const value = project && project[fieldName];
    if (value) return String(value);
    if (isEditMode) return '';
    return placeholderKey ? placeholderTexts[placeholderKey] : 'Not specified.';
  };

  if (isLoadingProjectData) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
        <p className="text-xl text-muted-foreground mt-4">Loading project details...</p>
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

  let imageSourceToDisplay = `https://placehold.co/800x450.png?text=${encodeURIComponent(project.name || 'Project')}`;
  let altTextForImage = `${project.name || 'Project'} placeholder`;

  if (project.imageDataUri) {
    imageSourceToDisplay = project.imageDataUri;
    altTextForImage = `${project.name || 'Project'} main image`;
  } else if (isGeneratingImage) {
    imageSourceToDisplay = `https://placehold.co/800x450.png?text=Generating...`;
    altTextForImage = `Generating image for ${project.name || 'Project'}`;
  } else if (imageError) { // Error from AI generation
    imageSourceToDisplay = `https://placehold.co/800x450.png?text=AI+Error`;
    altTextForImage = `Error generating image for ${project.name || 'Project'}`;
  } else if (imageLoadError) { // Error from <Image> component itself
     imageSourceToDisplay = `https://placehold.co/800x450.png?text=Load+Fail`;
     altTextForImage = `Failed to load image for ${project.name || 'Project'}`;
  }


  const renderEditableSection = (
    fieldKey: keyof ProjectType,
    icon: React.ReactNode,
    title: string,
    placeholderKey: keyof typeof placeholderTexts,
    rows: number = 4
  ) => {
    const content = getProjectField(fieldKey, placeholderKey);
    return (
      <section id={`project-${fieldKey.toString()}`}>
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">{icon}{title}</h2>
        <div className="relative">
          {isEditMode && projectIndex !== null ? (
            <Textarea
              value={content}
              onChange={(e) => handleProjectFieldChange(fieldKey, e.target.value)}
              placeholder={placeholderTexts[placeholderKey]}
              className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[100px] pr-10"
              rows={rows}
            />
          ) : (
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {content}
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
        {!isEditMode && (content === placeholderTexts[placeholderKey]) && <p className="mt-3 text-sm text-muted-foreground/80 italic">Hint: Use Edit Mode and the AI Helper to expand on this section!</p>}
      </section>
    );
  };
  
  const renderTechnologiesSection = () => {
    const techContent = getProjectField('technologiesUsed', 'technologiesUsed');
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
                placeholder={placeholderTexts.technologiesUsed}
                className="text-muted-foreground bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[80px] pr-10"
                rows={3}
            />
            ) : (
            <div className="flex flex-wrap gap-2">
                {techContent.split(/[,;\n]+/).map((tech: string) => tech.trim() && (
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
                    className="absolute top-0 right-0 text-primary/70 hover:text-primary p-1"
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
          {isEditMode && projectIndex !== null ? (
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
              
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden shadow-lg mb-6 border border-border bg-muted group">
                <NextImage
                  src={imageSourceToDisplay}
                  alt={altTextForImage}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={project.imagePrompt || "project details"}
                  className="transition-transform duration-300 group-hover:scale-105"
                  onError={() => {
                      console.warn("NextImage failed to load src:", imageSourceToDisplay);
                      if (!imageSourceToDisplay.includes('placehold.co')) { // Avoid loop if placehold.co itself fails
                          setImageLoadError("Image element failed to load source.");
                      }
                  }}
                  key={project.imageDataUri || project.name} // Force re-render if URI changes
                />
                {isGeneratingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <Loader2 className="h-12 w-12 text-primary animate-spin"/>
                        <p className="ml-2 text-primary-foreground font-semibold">Generating...</p>
                    </div>
                )}
              </div>
              
              {(imageError || imageLoadError) && !isGeneratingImage && (
                  <p className="text-sm text-destructive mt-2 text-center">
                    {imageError ? `AI Error: ${imageError}` : imageLoadError ? `Display Error: ${imageLoadError}`: ''}
                  </p>
              )}


              {isEditMode && project.imagePrompt && projectIndex !== null && (
                <div className="my-4">
                  <Button onClick={handleGenerateProjectImage} disabled={isGeneratingImage} className="w-full">
                    {isGeneratingImage ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ImageIcon className="mr-2 h-5 w-5" />}
                    {project.imageDataUri ? 'Regenerate Project Image' : 'Generate Project Image'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 text-center">Using prompt: &quot;{project.imagePrompt}&quot;</p>
                </div>
              )}
              
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
            {renderEditableSection('keyFeatures', <Zap className="mr-3 text-accent"/>, 'Key Features', 'keyFeatures', 4)}
            <Separator />
            {renderEditableSection('myRole', <Users className="mr-3 text-accent"/>, 'My Role', 'myRole', 4)}
            <Separator />
            {renderEditableSection('challengesSolutions', <ShieldCheck className="mr-3 text-accent"/>, 'Challenges & Solutions', 'challengesSolutions', 4)}
          </div>

          <aside className="md:col-span-1 space-y-6">
            {renderEditableSection('projectGoals', <Target className="mr-2 text-primary" />, 'Project Goals', 'projectGoals', 3)}
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

