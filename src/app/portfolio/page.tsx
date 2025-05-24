
'use client';

import { useState, useRef, useEffect } from 'react';
import { usePortfolioContext } from '@/contexts/portfolio-context';
import { generateImage, type GenerateImageOutput } from '@/ai/flows/generate-image-flow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Linkedin, Github, UserCircle, Sparkles, Upload, Loader2, ArrowDownCircle } from 'lucide-react';
import AiHelperDialog from '@/components/ai-helper-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const getInitials = (name?: string) => {
  if (!name) return '??';
  const names = name.split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

interface AiEditConfig {
  content: string;
  onUpdate: (newText: string) => void;
  label: string;
}

// Define layout components
const HeroSectionFocus: React.FC<HeroSectionProps> = ({
  personalInformation, isEditMode, handleInputChange, handleProfessionChange, profession,
  summary, setCvData, openAiDialog, avatarSrc, handleAvatarUpload, avatarFileInputRef,
  handleGenerateAvatar, isGeneratingAvatar, avatarError
}) => (
  <section
    className={cn(
      "relative overflow-hidden bg-gradient-to-br from-background via-card to-background/80 border-b border-border/30",
      // Spacing applied by parent
    )}
  >
    <div className="absolute inset-0 opacity-20">
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full filter blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full filter blur-3xl animate-pulse-slower" />
    </div>
    <div className="container mx-auto px-6 relative z-10">
      <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
        <div className="md:col-span-2 flex flex-col items-center md:items-start">
          <div className="relative group mb-6">
            <Avatar className="h-48 w-48 md:h-64 md:w-64 border-4 border-primary shadow-2xl group-hover:scale-105 transition-transform duration-300">
              <AvatarImage
                src={avatarSrc}
                alt={personalInformation.name || 'User Avatar'}
                data-ai-hint="profile portrait professional"
                key={avatarSrc} // Force re-render if src changes
              />
              <AvatarFallback className="text-6xl md:text-7xl">{getInitials(personalInformation.name)}</AvatarFallback>
            </Avatar>
            {isGeneratingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Loader2 className="h-16 w-16 text-white animate-spin" />
              </div>
            )}
            {isEditMode && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button onClick={() => avatarFileInputRef.current?.click()} size="icon" variant="outline" className="bg-background/80 hover:bg-background" title="Upload Avatar" disabled={isGeneratingAvatar}>
                  <Upload size={20} />
                </Button>
                <Button onClick={handleGenerateAvatar} size="icon" variant="outline" className="bg-background/80 hover:bg-background" title="Generate Avatar with AI" disabled={isGeneratingAvatar}>
                  {isGeneratingAvatar ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                </Button>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={avatarFileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            className="hidden"
            id="avatar-upload-input-home"
          />
          {isEditMode && avatarError && <p className="text-xs text-destructive mt-1 text-center md:text-left">{avatarError}</p>}

          {!isEditMode && (
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
              {personalInformation.linkedin && (
                <a href={personalInformation.linkedin} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    <Linkedin size={18} className="mr-2" /> LinkedIn
                  </Button>
                </a>
              )}
              {personalInformation.github && (
                <a href={personalInformation.github} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/10">
                    <Github size={18} className="mr-2" /> GitHub
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
        <div className="md:col-span-3 text-center md:text-left">
          {isEditMode ? (
            <Input
              type="text"
              value={personalInformation.name || ''}
              onChange={(e) => handleInputChange('personalInformation.name', e.target.value)}
              className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-3 text-center md:text-left bg-transparent border-2 border-dashed border-primary/50 focus:border-primary tracking-tight"
              placeholder="Your Name"
            />
          ) : (
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-3 tracking-tight">
              {personalInformation.name || "Your Name"}
            </h1>
          )}
          {isEditMode ? (
            <Input
              type="text"
              value={personalInformation.customProfession || profession || ''}
              onChange={handleProfessionChange}
              className="text-xl lg:text-2xl text-primary font-medium mb-6 text-center md:text-left bg-transparent border-2 border-dashed border-primary/30 focus:border-primary"
              placeholder="Your Profession / Tagline"
            />
          ) : (
            (personalInformation.customProfession || profession) && (
              <p className="text-xl lg:text-2xl text-primary font-medium mb-6">
                {personalInformation.customProfession || profession}
              </p>
            )
          )}
          <div className="relative max-w-2xl mx-auto md:mx-0">
            {isEditMode ? (
              <Textarea
                value={summary || ''}
                onChange={(e) => setCvData(prev => prev ? { ...prev, summary: e.target.value } : null)}
                className="text-md lg:text-lg text-muted-foreground leading-relaxed bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[150px] md:min-h-[180px] pr-10"
                placeholder="Craft your professional summary here. Highlight your key strengths and career aspirations..."
                rows={6}
              />
            ) : (
              summary ? (
                <p className="text-md lg:text-lg text-muted-foreground leading-relaxed">
                  {summary}
                </p>
              ) : (
                <p className="text-md lg:text-lg text-muted-foreground leading-relaxed italic">
                  Your professional summary will appear here. Go to Edit Mode to add or use AI to generate it.
                </p>
              )
            )}
            {isEditMode && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-primary/70 hover:text-primary"
                onClick={() => openAiDialog(
                  summary || '',
                  (newText) => setCvData(prev => prev ? { ...prev, summary: newText } : null),
                  'Professional Summary'
                )}
                title="Rewrite Summary with AI"
              >
                <Sparkles size={20} />
              </Button>
            )}
          </div>
          <div className="mt-8 text-center md:text-left">
            <a href="#contact-info">
              <Button size="lg" variant="default" className="group shadow-lg hover:shadow-primary/30 transition-shadow">
                Get In Touch <ArrowDownCircle size={20} className="ml-2 group-hover:translate-y-0.5 transition-transform" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const HeroSectionMinimal: React.FC<HeroSectionProps> = ({
  personalInformation, isEditMode, handleInputChange, handleProfessionChange, profession,
  summary, setCvData, openAiDialog, avatarSrc, handleAvatarUpload, avatarFileInputRef,
  handleGenerateAvatar, isGeneratingAvatar, avatarError
}) => (
  <section
    className={cn(
      "relative overflow-hidden border-b border-border/30 text-center",
       // Spacing applied by parent
    )}
  >
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary/30 rounded-full filter blur-3xl animate-pulse-slow delay-100" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-accent/30 rounded-full filter blur-3xl animate-pulse-slower delay-500" />
    </div>
    <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
      <div className="relative group mb-6 mt-8">
        <Avatar className="h-40 w-40 md:h-48 md:w-48 border-4 border-primary shadow-xl group-hover:scale-105 transition-transform duration-300">
          <AvatarImage src={avatarSrc} alt={personalInformation.name || 'User Avatar'} data-ai-hint="profile portrait" key={avatarSrc} />
          <AvatarFallback className="text-5xl md:text-6xl">{getInitials(personalInformation.name)}</AvatarFallback>
        </Avatar>
        {isGeneratingAvatar && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          </div>
        )}
        {isEditMode && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button onClick={() => avatarFileInputRef.current?.click()} size="sm" variant="outline" className="bg-background/80 hover:bg-background px-2 py-1 text-xs" title="Upload Avatar" disabled={isGeneratingAvatar}>
              <Upload size={16} className="mr-1"/> Upload
            </Button>
            <Button onClick={handleGenerateAvatar} size="sm" variant="outline" className="bg-background/80 hover:bg-background px-2 py-1 text-xs" title="Generate Avatar with AI" disabled={isGeneratingAvatar}>
              {isGeneratingAvatar ? <Loader2 size={16} className="animate-spin mr-1" /> : <Sparkles size={16} className="mr-1" />} AI Gen
            </Button>
          </div>
        )}
      </div>
      <input type="file" ref={avatarFileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
      {isEditMode && avatarError && <p className="text-xs text-destructive mt-1">{avatarError}</p>}

      {isEditMode ? (
        <Input
          type="text"
          value={personalInformation.name || ''}
          onChange={(e) => handleInputChange('personalInformation.name', e.target.value)}
          className="text-3xl lg:text-4xl font-bold text-foreground mb-2 text-center bg-transparent border-2 border-dashed border-primary/50 focus:border-primary tracking-tight"
          placeholder="Your Name"
        />
      ) : (
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 tracking-tight">
          {personalInformation.name || "Your Name"}
        </h1>
      )}
      {isEditMode ? (
        <Input
          type="text"
          value={personalInformation.customProfession || profession || ''}
          onChange={handleProfessionChange}
          className="text-lg lg:text-xl text-primary font-medium mb-4 text-center bg-transparent border-2 border-dashed border-primary/30 focus:border-primary"
          placeholder="Your Profession / Tagline"
        />
      ) : (
        (personalInformation.customProfession || profession) && (
          <p className="text-lg lg:text-xl text-primary font-medium mb-4">
            {personalInformation.customProfession || profession}
          </p>
        )
      )}
      <div className="relative max-w-xl mx-auto">
        {isEditMode ? (
          <Textarea
            value={summary || ''}
            onChange={(e) => setCvData(prev => prev ? { ...prev, summary: e.target.value } : null)}
            className="text-md text-muted-foreground leading-relaxed bg-transparent border-2 border-dashed border-primary/30 focus:border-primary min-h-[120px] pr-10"
            placeholder="Craft your professional summary..."
            rows={5}
          />
        ) : (
           summary ? (
            <p className="text-md text-muted-foreground leading-relaxed">{summary}</p>
             ) : (
            <p className="text-md text-muted-foreground leading-relaxed italic">Your professional summary will appear here.</p>
             )
        )}
        {isEditMode && (
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-primary/70 hover:text-primary"
            onClick={() => openAiDialog(summary || '', (newText) => setCvData(prev => prev ? { ...prev, summary: newText } : null), 'Professional Summary')}
            title="Rewrite Summary with AI">
            <Sparkles size={18} />
          </Button>
        )}
      </div>
       {!isEditMode && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {personalInformation.linkedin && (
            <a href={personalInformation.linkedin} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                <Linkedin size={16} className="mr-1.5" /> LinkedIn
              </Button>
            </a>
          )}
          {personalInformation.github && (
            <a href={personalInformation.github} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-accent/50 text-accent hover:bg-accent/10">
                <Github size={16} className="mr-1.5" /> GitHub
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  </section>
);

interface HeroSectionProps {
  personalInformation: ParseCvOutput['personalInformation'];
  isEditMode: boolean;
  handleInputChange: (path: string, value: string) => void;
  handleProfessionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profession: string | null;
  summary: string | undefined;
  setCvData: React.Dispatch<React.SetStateAction<ParseCvOutput | null>>;
  openAiDialog: (content: string, onUpdate: (newText: string) => void, label: string) => void;
  avatarSrc: string;
  handleAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  avatarFileInputRef: React.RefObject<HTMLInputElement>;
  handleGenerateAvatar: () => void;
  isGeneratingAvatar: boolean;
  avatarError: string | null;
}

interface ParseCvOutput {
  personalInformation: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    avatarDataUri?: string;
    customProfession?: string; // Added for direct edit
  };
  summary?: string;
  experience: Array<any>; // Define more specific types if needed
  education: Array<any>;
  skills: string[];
  projects: Array<any>;
}


export default function PortfolioHomePage() {
  const { cvData, profession: contextProfession, isEditMode, updateCvField, setCvData, theme } = usePortfolioContext();
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiEditConfig, setAiEditConfig] = useState<AiEditConfig | null>(null);

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const { toast } = useToast();

  const [currentLayout, setCurrentLayout] = useState('focus-hero'); // Default layout
  const [currentSpacing, setCurrentSpacing] = useState('py-16 md:py-20'); // Default spacing

  useEffect(() => {
    if (theme?.themeVariables?.layoutStyle) {
      setCurrentLayout(theme.themeVariables.layoutStyle);
    } else {
      setCurrentLayout('focus-hero'); // Fallback
    }

    const spacingScale = theme?.themeVariables?.spacingScale || 'regular';
    const spacingClassesMap: Record<string, string> = {
      compact: 'py-10 md:py-12',
      regular: 'py-16 md:py-20',
      spacious: 'py-20 md:py-28',
    };
    setCurrentSpacing(spacingClassesMap[spacingScale] || spacingClassesMap.regular);

  }, [theme]);


  if (!cvData) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <p className="ml-4 text-lg text-muted-foreground">Loading portfolio data...</p>
    </div>
  );

  const { personalInformation, summary, skills } = cvData;
  const derivedProfession = personalInformation.customProfession || contextProfession;


  const handleInputChange = (path: string, value: string) => {
    updateCvField(path, value);
  };
  
  const handleProfessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     updateCvField('personalInformation.customProfession', e.target.value);
  };

  const openAiDialog = (content: string, onUpdate: (newText: string) => void, label: string) => {
    setAiEditConfig({ content, onUpdate, label });
    setIsAiDialogOpen(true);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      toast({ title: 'No file selected', variant: 'destructive' });
      return;
    }
    const file = event.target.files[0];
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid File Type', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      updateCvField('personalInformation.avatarDataUri', reader.result as string);
      setAvatarError(null);
      toast({ title: 'Avatar Uploaded', description: 'Your avatar has been updated.' });
    };
    reader.onerror = () => {
      toast({ title: 'File Read Error', description: 'Could not read the uploaded avatar image.', variant: 'destructive' });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAvatar = async () => {
    setIsGeneratingAvatar(true);
    setAvatarError(null);
    toast({ title: 'Generating Avatar...', description: 'The AI is creating your new avatar.' });
    const avatarPrompt = `professional headshot avatar for ${personalInformation.name || 'a professional'}, ${derivedProfession || 'in their field'}, ${theme?.previewImagePrompt || 'modern style'}`;
    try {
      const result: GenerateImageOutput = await generateImage({ prompt: avatarPrompt });
      if (result.imageDataUri) {
        updateCvField('personalInformation.avatarDataUri', result.imageDataUri);
        toast({ title: 'Avatar Generated!', description: 'Your new AI avatar is ready.' });
      } else {
        const errorMsg = result.error || 'Unknown error during avatar generation.';
        setAvatarError(errorMsg);
        toast({ title: 'Avatar Generation Failed', description: errorMsg, variant: 'destructive', duration: 8000 });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to generate avatar.';
      setAvatarError(errorMsg);
      toast({ title: 'Avatar Generation Error', description: errorMsg, variant: 'destructive', duration: 8000 });
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const avatarSrc = personalInformation.avatarDataUri || `https://placehold.co/256x256.png?text=${getInitials(personalInformation.name)}`;
  
  const heroProps: HeroSectionProps = {
    personalInformation, isEditMode, handleInputChange, handleProfessionChange,
    profession: derivedProfession, summary, setCvData, openAiDialog, avatarSrc,
    handleAvatarUpload, avatarFileInputRef, handleGenerateAvatar, isGeneratingAvatar, avatarError
  };

  const renderHeroSection = () => {
    switch (currentLayout) {
      case 'minimal-rows':
        return <HeroSectionMinimal {...heroProps} />;
      case 'focus-hero':
      default:
        return <HeroSectionFocus {...heroProps} />;
    }
  };
  
  const contactSkillsLayoutClasses = () => {
    switch (currentLayout) {
      case 'minimal-rows':
        return "flex flex-col items-center text-center space-y-12 md:space-y-16"; // Centered, single column for content below hero
      case 'focus-hero':
      default:
        return "space-y-16 md:space-y-20"; // Standard spacing for sections below hero
    }
  };

  return (
    <>
      <div className={currentSpacing}> {/* Apply dynamic vertical spacing to the hero container */}
        {renderHeroSection()}
      </div>
      
      <div className={cn("container mx-auto px-6", currentSpacing, contactSkillsLayoutClasses())}>
        {(personalInformation.email || personalInformation.phone || isEditMode) &&
          <section id="contact-info" className={cn(currentLayout === 'minimal-rows' ? 'w-full max-w-xl' : '')}>
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center">
                <UserCircle size={36} className="mr-3" />Contact Information
              </h2>
              <p className="text-lg text-muted-foreground mt-2">How to reach me.</p>
            </div>
            <Card className={cn("themed-card shadow-xl border-l-4 border-primary/70 bg-card/80 backdrop-blur-sm", currentLayout === 'minimal-rows' ? 'mx-auto' : 'max-w-3xl mx-auto')}>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-lg">
                {isEditMode ? (
                  <div className="flex items-center space-x-3">
                    <Mail size={22} className="text-muted-foreground flex-shrink-0" />
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
                      <Mail size={22} className="text-muted-foreground group-hover:text-primary flex-shrink-0" />
                      <span>{personalInformation.email}</span>
                    </a>
                  )
                )}
                {isEditMode ? (
                  <div className="flex items-center space-x-3">
                    <Phone size={22} className="text-muted-foreground flex-shrink-0" />
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
                      <Phone size={22} className="text-muted-foreground flex-shrink-0" /> <span>{personalInformation.phone}</span>
                    </p>
                  )
                )}
                {isEditMode && (
                  <div className="flex items-center space-x-3">
                    <Linkedin size={22} className="text-muted-foreground flex-shrink-0" />
                    <Input
                      type="url"
                      value={personalInformation.linkedin || ''}
                      onChange={(e) => handleInputChange('personalInformation.linkedin', e.target.value)}
                      placeholder="LinkedIn Profile URL"
                      className="bg-transparent border-b-2 border-dashed border-primary/30 focus:border-primary"
                    />
                  </div>
                )}
                 {isEditMode && (
                  <div className="flex items-center space-x-3">
                    <Github size={22} className="text-muted-foreground flex-shrink-0" />
                    <Input
                      type="url"
                      value={personalInformation.github || ''}
                      onChange={(e) => handleInputChange('personalInformation.github', e.target.value)}
                      placeholder="GitHub Profile URL"
                      className="bg-transparent border-b-2 border-dashed border-primary/30 focus:border-primary"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        }

        {skills && skills.length > 0 && (
          <section id="skills" className={cn(currentLayout === 'minimal-rows' ? 'w-full max-w-2xl' : '')}>
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center">
                <Sparkles size={36} className="mr-3" />Skills & Expertise
              </h2>
              <p className="text-lg text-muted-foreground mt-2">Key technologies and abilities I bring to the table.</p>
            </div>
            <Card className={cn("themed-card shadow-xl border-l-4 border-accent/70 bg-card/80 backdrop-blur-sm p-6 md:p-8", currentLayout === 'minimal-rows' ? 'mx-auto' : '')}>
              <CardContent className="pt-2">
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-5">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className={cn(
                        "bg-accent/10 text-accent text-md md:text-lg font-semibold px-5 py-2.5 rounded-lg shadow-md",
                        "hover:bg-accent/20 transition-all cursor-default transform hover:scale-105",
                        theme?.cardStyle === 'rounded-elevated' ? 'rounded-xl' : 'rounded-lg',
                        theme?.cardStyle === 'flat-bordered' ? 'border-2 border-accent/30' : ''
                      )}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {isEditMode && <p className="text-center text-sm text-muted-foreground mt-6 italic">(Skills can be added, removed, or reordered on the dedicated Skills page)</p>}
              </CardContent>
            </Card>
          </section>
        )}
        {!skills || skills.length === 0 && isEditMode && (
          <section id="skills-empty-edit" className={cn(currentLayout === 'minimal-rows' ? 'w-full max-w-xl' : '')}>
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center">
                <Sparkles size={36} className="mr-3" />Skills & Expertise
              </h2>
            </div>
            <p className="text-center text-muted-foreground">No skills listed. Visit the <a href="/portfolio/skills" className="text-accent hover:underline font-semibold">Skills page</a> in Edit Mode to add your competencies.</p>
          </section>
        )}
      </div>
      {aiEditConfig && (
        <AiHelperDialog
          isOpen={isAiDialogOpen}
          onOpenChange={setIsAiDialogOpen}
          contentToRewrite={aiEditConfig.content}
          onContentRewritten={aiEditConfig.onUpdate}
          contextLabel={aiEditConfig.label}
        />
      )}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(0.95); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        .animate-pulse-slower {
          animation: pulse-slower 10s infinite ease-in-out;
        }
      `}</style>
    </>
  );
}
