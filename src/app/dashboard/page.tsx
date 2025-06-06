
'use client';

import { useState, useEffect } from 'react';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import type { RecommendThemeOutput } from '@/ai/flows/ai-theme-recommendation';
import { generateCustomThemes, type CustomThemePreferencesInput, type CustomThemeOutput } from '@/ai/flows/ai-custom-theme-generator';
import { generateImage, type GenerateImageOutput } from '@/ai/flows/generate-image-flow';
import { usePortfolioContext, type PortfolioTheme } from '@/contexts/portfolio-context'; // Import usePortfolioContext
import CvUploadForm from '@/components/cv-upload-form';
import ParsedCvDisplay from '@/components/parsed-cv-display';
import ThemeRecommendationDisplay from '@/components/theme-recommendation-display';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input as ShadInput } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Info, Eye, Palette, Sparkles, UploadCloud, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const CV_DATA_KEY = 'cvPortfolioData';
const AVAILABLE_THEMES_KEY = 'cvPortfolioAvailableThemes'; 

interface CustomThemeWithImageState extends CustomThemeOutput {
  imageDataUri?: string;
  isLoadingImage?: boolean;
  error?: string; 
}

const vibeOptions = [
  'Professional & Serious', 
  'Modern & Sleek', 
  'Creative & Playful', 
  'Minimalist & Clean',
  'Elegant & Sophisticated',
  'Bold & Dynamic',
  'Friendly & Approachable',
  'Tech Forward & Futuristic'
];

const colorPreferenceOptions = [
  'Cool Blues & Greens', 
  'Warm Earth Tones', 
  'Vibrant & Energetic', 
  'Monochromatic Grays',
  'Deep & Rich Jewel Tones',
  'Pastel & Soft Hues',
  'High Contrast Black & White (with one accent)',
  'Nature Inspired (Greens & Browns)'
];


export default function DashboardPage() {
  const [parsedCvData, setParsedCvData] = useState<ParseCvOutput | null>(null);
  const [initialThemeRecommendation, setInitialThemeRecommendation] = useState<RecommendThemeOutput | null>(null);
  const [isLoadingCv, setIsLoadingCv] = useState(false);
  const [customThemePreferences, setCustomThemePreferences] = useState<CustomThemePreferencesInput>({
    vibe: vibeOptions[0],
    colorPreference: colorPreferenceOptions[0],
    mode: 'system',
    industryInspiration: '',
  });
  const [generatedCustomThemesWithImages, setGeneratedCustomThemesWithImages] = useState<CustomThemeWithImageState[]>([]);
  const [isGeneratingThemes, setIsGeneratingThemes] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { setTheme: setActiveTheme } = usePortfolioContext();

  useEffect(() => {
    const storedCvData = localStorage.getItem(CV_DATA_KEY);
    if (storedCvData) {
      try { setParsedCvData(JSON.parse(storedCvData)); }
      catch (e) { console.error("Failed to parse CV data", e); localStorage.removeItem(CV_DATA_KEY); }
    }
    
    const activeThemeFromContext = localStorage.getItem('cvPortfolioTheme'); 
    if (activeThemeFromContext) {
        try {
            const theme = JSON.parse(activeThemeFromContext) as PortfolioTheme;
            if (!theme.themeVariables && !generatedCustomThemesWithImages.length) { 
                setInitialThemeRecommendation({themeName: theme.themeName, reason: theme.description || ''});
            }
        } catch(e) { console.error("Failed to parse active theme for initial display", e); }
    }

    const storedAvailableThemes = localStorage.getItem(AVAILABLE_THEMES_KEY);
    if (storedAvailableThemes) {
        try {
            const themes = JSON.parse(storedAvailableThemes) as CustomThemeWithImageState[];
            setGeneratedCustomThemesWithImages(themes);
        } catch (e) {
            console.error("Failed to parse stored available themes", e);
            localStorage.removeItem(AVAILABLE_THEMES_KEY);
        }
    }
  }, []);

  const handleCvParsed = (data: ParseCvOutput) => {
    setParsedCvData(data);
    localStorage.setItem(CV_DATA_KEY, JSON.stringify(data));
  };

  const handleInitialThemeRecommended = (data: RecommendThemeOutput) => {
    setInitialThemeRecommendation(data);
    const basicTheme: PortfolioTheme = { 
        themeName: data.themeName, 
        description: data.reason, 
        themeVariables: {} as any, 
        previewImagePrompt: '' 
    };
    setActiveTheme(basicTheme); 
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoadingCv(loading);
  };

  const handlePreferenceChange = (field: keyof CustomThemePreferencesInput, value: string) => {
    setCustomThemePreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateCustomThemes = async () => {
    if (!parsedCvData) {
      toast({ title: "CV Data Missing", description: "Please upload and parse your CV first.", variant: "destructive" });
      return;
    }
    setIsGeneratingThemes(true);
    setGeneratedCustomThemesWithImages([]);
    toast({ title: "Generating Custom Themes...", description: "The AI is crafting options." });
    try {
      const input: CustomThemePreferencesInput = {
        ...customThemePreferences,
        currentProfession: parsedCvData?.experience?.[0]?.title || parsedCvData?.summary?.split(' ')[0] || "Professional",
      };
      const result = await generateCustomThemes(input);
      
      if (result.themes && result.themes.length > 0) {
        toast({ title: "Custom Themes Generated!", description: "Now generating preview images..." });
        const themesWithLoadingState: CustomThemeWithImageState[] = result.themes.map(theme => ({ ...theme, isLoadingImage: true, imageDataUri: undefined, error: undefined }));
        
        localStorage.setItem(AVAILABLE_THEMES_KEY, JSON.stringify(themesWithLoadingState.map(t => ({...t, isLoadingImage: undefined, error: undefined, imageDataUri: undefined})))); 
        
        setGeneratedCustomThemesWithImages(themesWithLoadingState);

        themesWithLoadingState.forEach(async (theme, index) => {
          let finalPrompt = theme.previewImagePrompt || "abstract theme representation";
          if (!finalPrompt.toLowerCase().startsWith("generate") && !finalPrompt.toLowerCase().startsWith("photo") && !finalPrompt.toLowerCase().startsWith("image")) {
            finalPrompt = `Generate a conceptual image representing: ${finalPrompt}`;
          }

          if (finalPrompt.trim() !== "") {
            try {
              const imageResult = await generateImage({ prompt: finalPrompt });
              setGeneratedCustomThemesWithImages(prevThemes => {
                const newThemes = [...prevThemes];
                if (newThemes[index]) {
                    newThemes[index] = {
                        ...newThemes[index],
                        imageDataUri: imageResult.imageDataUri,
                        isLoadingImage: false,
                        error: imageResult.imageDataUri ? undefined : imageResult.error || "Failed to generate image.",
                    };
                    const themesToSave = newThemes.map(t => ({...t, isLoadingImage: undefined})); 
                    localStorage.setItem(AVAILABLE_THEMES_KEY, JSON.stringify(themesToSave));
                }
                return newThemes;
              });
              if (imageResult.error && !imageResult.imageDataUri) {
                toast({ title: `Image Gen Error: ${theme.themeName}`, description: imageResult.error, variant: "destructive", duration: 8000 });
              }
            } catch (imgError: any) {
              console.error(`Error generating image for theme ${theme.themeName}:`, imgError);
              toast({ title: `Image Gen Failed: ${theme.themeName}`, description: imgError.message || "Unknown error.", variant: "destructive", duration: 8000 });
              setGeneratedCustomThemesWithImages(prevThemes => {
                const newThemes = [...prevThemes];
                 if (newThemes[index]) {
                    newThemes[index] = { ...newThemes[index], isLoadingImage: false, error: imgError.message || "Image generation process failed." };
                    const themesToSave = newThemes.map(t => ({...t, isLoadingImage: undefined }));
                    localStorage.setItem(AVAILABLE_THEMES_KEY, JSON.stringify(themesToSave));
                }
                return newThemes;
              });
            }
          } else {
            setGeneratedCustomThemesWithImages(prevThemes => {
              const newThemes = [...prevThemes];
              if (newThemes[index]) {
                newThemes[index] = { ...newThemes[index], isLoadingImage: false, error: "No valid prompt for image." };
                const themesToSave = newThemes.map(t => ({...t, isLoadingImage: undefined }));
                localStorage.setItem(AVAILABLE_THEMES_KEY, JSON.stringify(themesToSave));
              }
              return newThemes;
            });
            toast({ title: `Image Skipped: ${theme.themeName}`, description: "No preview image prompt provided.", variant: "default" });
          }
        });
      } else {
        toast({ title: "No Themes Generated", description: "The AI couldn't generate themes. Try adjusting preferences.", variant: "destructive" });
         localStorage.removeItem(AVAILABLE_THEMES_KEY); 
      }
    } catch (error) {
      console.error("Custom theme generation error:", error);
      toast({ title: "Theme Generation Failed", description: "An error occurred. Please try again.", variant: "destructive" });
      localStorage.removeItem(AVAILABLE_THEMES_KEY); 
    } finally {
      setIsGeneratingThemes(false);
    }
  };

  const handleSelectCustomTheme = (themeToApply: CustomThemeWithImageState | undefined) => {
    if (!themeToApply) {
        toast({title: "No theme selected", description: "Please select a theme to apply.", variant: "destructive"});
        return;
    }
    const portfolioThemeToSetActive: PortfolioTheme = {
      themeName: themeToApply.themeName,
      description: themeToApply.description,
      themeVariables: themeToApply.themeVariables,
      previewImagePrompt: themeToApply.previewImagePrompt,
      previewImageDataUri: themeToApply.imageDataUri 
    };
    
    setActiveTheme(portfolioThemeToSetActive); 

    toast({ title: "Theme Selected!", description: `"${themeToApply.themeName}" applied. Redirecting to portfolio...` });
    router.push('/portfolio');
  };
  
  const handleStartOver = () => {
    if (window.confirm("Are you sure you want to clear current CV data and start over?")) {
      setParsedCvData(null);
      setInitialThemeRecommendation(null);
      setGeneratedCustomThemesWithImages([]);
      localStorage.removeItem(CV_DATA_KEY);
      setActiveTheme(null); 
      localStorage.removeItem(AVAILABLE_THEMES_KEY);
      toast({ title: "Data Cleared", description: "Ready for a new CV upload." });
    }
  };

  const isLoading = isLoadingCv || isGeneratingThemes;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Portfolio Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Upload your CV to generate content, then customize your portfolio's look and feel.
        </p>
      </div>

      {parsedCvData && (
        <div className="text-center my-6">
          <Button onClick={handleStartOver} variant="outline" size="lg" className="active:scale-95 transition-transform">
            <RotateCcw className="mr-2 h-5 w-5" />
            Upload New CV / Start Over
          </Button>
        </div>
      )}
      
      {!parsedCvData && (
        <CvUploadForm
          onCvParsed={handleCvParsed}
          onThemeRecommended={handleInitialThemeRecommended}
          onLoadingChange={handleLoadingChange}
        />
      )}

      {isLoadingCv && (
        <Card className="mt-8 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-xl font-semibold text-primary">Processing your CV...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoadingCv && parsedCvData && (
        <>
          {initialThemeRecommendation && generatedCustomThemesWithImages.length === 0 && !isGeneratingThemes && (
            <ThemeRecommendationDisplay recommendation={initialThemeRecommendation} />
          )}
          <Separator />
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center"><Palette className="mr-3 text-primary"/>Customize Your Theme</CardTitle>
              <CardDescription>Tell us your style, and our AI will generate personalized theme options for your portfolio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="vibe" className="text-base font-semibold">Overall Vibe</Label>
                  <RadioGroup id="vibe" value={customThemePreferences.vibe} onValueChange={(value) => handlePreferenceChange('vibe', value)} className="mt-2">
                    {vibeOptions.map(v => (
                      <div key={v} className="flex items-center space-x-2">
                        <RadioGroupItem value={v} id={`vibe-${v.replace(/[^\w-]+/g, '-')}`} />
                        <Label htmlFor={`vibe-${v.replace(/[^\w-]+/g, '-')}`}>{v}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="colorPreference" className="text-base font-semibold">Color Preference</Label>
                  <RadioGroup id="colorPreference" value={customThemePreferences.colorPreference} onValueChange={(value) => handlePreferenceChange('colorPreference', value)} className="mt-2">
                    {colorPreferenceOptions.map(c => (
                       <div key={c} className="flex items-center space-x-2">
                        <RadioGroupItem value={c} id={`color-${c.replace(/[^\w-]+/g, '-')}`} />
                        <Label htmlFor={`color-${c.replace(/[^\w-]+/g, '-')}`}>{c}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
              <div>
                <Label htmlFor="mode" className="text-base font-semibold">Light or Dark Mode</Label>
                <RadioGroup id="mode" value={customThemePreferences.mode} onValueChange={(value) => handlePreferenceChange('mode', value as 'light' | 'dark' | 'system')} className="mt-2 flex space-x-4">
                   {[{value: 'light', label: 'Light'}, {value: 'dark', label: 'Dark'}, {value: 'system', label: 'System Default'}].map(m => (
                     <div key={m.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={m.value} id={`mode-${m.value}`} />
                        <Label htmlFor={`mode-${m.value}`}>{m.label}</Label>
                      </div>
                   ))}
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="industryInspiration" className="text-base font-semibold">Inspiration (Optional)</Label>
                <ShadInput 
                    id="industryInspiration" 
                    placeholder="e.g., Tech startups, art galleries, fashion magazines" 
                    value={customThemePreferences.industryInspiration || ''}
                    onChange={(e) => handlePreferenceChange('industryInspiration', e.target.value)}
                    className="mt-2"
                />
              </div>
              <Button onClick={handleGenerateCustomThemes} disabled={isGeneratingThemes} size="lg" className="w-full active:scale-95 transition-transform">
                {isGeneratingThemes ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Generate Custom Theme Options
              </Button>
            </CardContent>
          </Card>

          {isGeneratingThemes && generatedCustomThemesWithImages.length === 0 && ( 
            <Card className="mt-8 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="text-xl font-semibold text-primary">AI is designing themes for you...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {generatedCustomThemesWithImages.length > 0 && (
            <div className="space-y-6 mt-8">
              <h2 className="text-2xl font-semibold text-center text-primary">Select Your Custom Theme</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {generatedCustomThemesWithImages.map((theme) => (
                  <Card key={theme.themeName} className="shadow-md hover:shadow-xl transition-all duration-300 flex flex-col hover:border-primary">
                    <CardHeader className="p-4">
                      <div className="aspect-video bg-muted rounded-md overflow-hidden mb-3 relative">
                        {theme.isLoadingImage && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          </div>
                        )}
                        <Image 
                          src={
                            theme.isLoadingImage ? `https://placehold.co/600x338.png?text=Loading...` :
                            theme.imageDataUri ? theme.imageDataUri :
                            theme.error ? `https://placehold.co/600x338.png?text=Error` :
                            `https://placehold.co/600x338.png` 
                          }
                          alt={`Preview for ${theme.themeName}`} 
                          width={600} 
                          height={338} 
                          className="object-cover w-full h-full"
                          data-ai-hint={theme.previewImagePrompt || "abstract theme"}
                          onError={(e) => { 
                            e.currentTarget.src = `https://placehold.co/600x338.png?text=LoadFail`;
                            setGeneratedCustomThemesWithImages(prev => {
                                const newThemes = [...prev];
                                const themeIndex = newThemes.findIndex(t => t.themeName === theme.themeName);
                                if(themeIndex > -1 && newThemes[themeIndex]) newThemes[themeIndex].error = "Image element failed to load source.";
                                return newThemes;
                            });
                          }}
                          key={theme.imageDataUri || theme.themeName} 
                        />
                      </div>
                      <CardTitle className="text-xl text-accent">{theme.themeName}</CardTitle>
                      <CardDescription className="text-sm">{theme.description}</CardDescription>
                       {theme.error && !theme.isLoadingImage && (
                        <p className="text-xs text-destructive mt-1">Image Error: {theme.error.length > 100 ? theme.error.substring(0,100) + '...' : theme.error}</p>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-end">
                       <Button onClick={() => handleSelectCustomTheme(theme)} className="w-full mt-auto active:scale-95 transition-transform" size="lg">
                         Apply & View Portfolio <Eye className="ml-2 h-4 w-4"/>
                       </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <Separator className="my-8"/>
          <ParsedCvDisplay cvData={parsedCvData} />
        </>
      )}

      {!isLoading && !parsedCvData && (
         <Card className="mt-8 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Info className="h-12 w-12 text-accent" />
              <p className="text-xl font-semibold text-foreground">Ready to build your portfolio?</p>
              <p className="text-muted-foreground text-center max-w-md">
                Upload your CV using the form above. Your parsed information and theme options will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
