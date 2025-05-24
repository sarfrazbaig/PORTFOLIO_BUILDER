
'use client';

import { useState, useEffect } from 'react';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import type { RecommendThemeOutput } from '@/ai/flows/ai-theme-recommendation';
import { generateCustomThemes, type CustomThemePreferencesInput, type CustomThemeOutput } from '@/ai/flows/ai-custom-theme-generator';
import type { PortfolioTheme } from '@/contexts/portfolio-context';
import CvUploadForm from '@/components/cv-upload-form';
import ParsedCvDisplay from '@/components/parsed-cv-display';
import ThemeRecommendationDisplay from '@/components/theme-recommendation-display';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input as ShadInput } from '@/components/ui/input'; // Renamed to avoid conflict with HTML Input
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Info, Eye, Palette, Sparkles, UploadCloud, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const CV_DATA_KEY = 'cvPortfolioData';
const THEME_RECOMMENDATION_KEY = 'cvPortfolioTheme';

export default function DashboardPage() {
  const [parsedCvData, setParsedCvData] = useState<ParseCvOutput | null>(null);
  const [initialThemeRecommendation, setInitialThemeRecommendation] = useState<RecommendThemeOutput | null>(null);
  const [isLoadingCv, setIsLoadingCv] = useState(false);
  const [customThemePreferences, setCustomThemePreferences] = useState<CustomThemePreferencesInput>({
    vibe: 'Modern & Sleek',
    colorPreference: 'Cool Blues',
    mode: 'system',
    industryInspiration: '',
  });
  const [generatedCustomThemes, setGeneratedCustomThemes] = useState<CustomThemeOutput[]>([]);
  const [isGeneratingThemes, setIsGeneratingThemes] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const storedCvData = localStorage.getItem(CV_DATA_KEY);
    if (storedCvData) {
      try { setParsedCvData(JSON.parse(storedCvData)); }
      catch (e) { console.error("Failed to parse CV data", e); localStorage.removeItem(CV_DATA_KEY); }
    }
    const storedTheme = localStorage.getItem(THEME_RECOMMENDATION_KEY);
    if (storedTheme) {
      try {
        const theme = JSON.parse(storedTheme) as PortfolioTheme;
        // If it's an old theme format (just name/reason), or a new one without themeVariables (less likely but possible)
        // We only set initialThemeRecommendation if it's the basic AI one.
        // Custom themes with themeVariables are handled differently now.
        if (!theme.themeVariables) { 
            setInitialThemeRecommendation({themeName: theme.themeName, reason: theme.reason || ''});
        }
      } catch (e) { console.error("Failed to parse theme recommendation", e); localStorage.removeItem(THEME_RECOMMENDATION_KEY); }
    }
  }, []);

  const handleCvParsed = (data: ParseCvOutput) => {
    setParsedCvData(data);
    localStorage.setItem(CV_DATA_KEY, JSON.stringify(data));
  };

  const handleInitialThemeRecommended = (data: RecommendThemeOutput) => {
    setInitialThemeRecommendation(data);
    // Save the basic recommendation. This might be overwritten if a custom theme is chosen.
    localStorage.setItem(THEME_RECOMMENDATION_KEY, JSON.stringify(data));
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
    setGeneratedCustomThemes([]); // Clear previous custom themes
    toast({ title: "Generating Custom Themes...", description: "The AI is crafting some options for you." });
    try {
      const input: CustomThemePreferencesInput = {
        ...customThemePreferences,
        // Provide some context from CV for theme generation
        currentProfession: parsedCvData?.experience?.[0]?.title || parsedCvData?.summary?.split(' ')[0] || "Professional",
      };
      const result = await generateCustomThemes(input);
      if (result.themes && result.themes.length > 0) {
        setGeneratedCustomThemes(result.themes);
        toast({ title: "Custom Themes Generated!", description: "Choose your favorite to proceed." });
      } else {
        toast({ title: "No Themes Generated", description: "The AI couldn't generate themes. Try adjusting preferences.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Custom theme generation error:", error);
      toast({ title: "Theme Generation Failed", description: "An error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingThemes(false);
    }
  };

  const handleSelectCustomTheme = (theme: CustomThemeOutput) => {
    // Save the full custom theme object, including themeVariables
    const portfolioThemeToSave: PortfolioTheme = {
      themeName: theme.themeName, // e.g., "Ocean Breeze Dark"
      reason: theme.description, // Use AI's description of the custom theme
      themeVariables: theme.themeVariables,
      previewImagePrompt: theme.previewImagePrompt,
    };
    localStorage.setItem(THEME_RECOMMENDATION_KEY, JSON.stringify(portfolioThemeToSave));
    toast({ title: "Theme Selected!", description: `"${theme.themeName}" applied. Redirecting to portfolio...` });
    router.push('/portfolio');
  };
  
  const handleStartOver = () => {
    if (window.confirm("Are you sure you want to clear current CV data and start over?")) {
      setParsedCvData(null);
      setInitialThemeRecommendation(null);
      setGeneratedCustomThemes([]); // Also clear generated themes
      localStorage.removeItem(CV_DATA_KEY);
      localStorage.removeItem(THEME_RECOMMENDATION_KEY);
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

      {/* "Start Over" button is displayed if CV data exists */}
      {parsedCvData && (
        <div className="text-center my-6">
          <Button onClick={handleStartOver} variant="outline" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" />
            Upload New CV / Start Over
          </Button>
        </div>
      )}
      
      {/* CV Upload Form is displayed if no CV data exists */}
      {!parsedCvData && (
        <CvUploadForm
          onCvParsed={handleCvParsed}
          onThemeRecommended={handleInitialThemeRecommended}
          onLoadingChange={handleLoadingChange}
          // currentCvData prop removed as it's implicitly null when this renders
        />
      )}

      {/* Loading spinner while CV is processing */}
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

      {/* Content displayed after CV is parsed and not currently loading CV */}
      {!isLoadingCv && parsedCvData && (
        <>
          {/* Display initial AI theme recommendation if no custom themes have been generated yet */}
          {initialThemeRecommendation && !generatedCustomThemes.length && (
            <ThemeRecommendationDisplay recommendation={initialThemeRecommendation} />
          )}
          <Separator />
          
          {/* Custom Theme Generation Section */}
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
                    {['Professional & Serious', 'Modern & Sleek', 'Creative & Playful', 'Minimalist & Clean'].map(v => (
                      <div key={v} className="flex items-center space-x-2">
                        <RadioGroupItem value={v} id={`vibe-${v.replace(/\s+/g, '-')}`} />
                        <Label htmlFor={`vibe-${v.replace(/\s+/g, '-')}`}>{v}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="colorPreference" className="text-base font-semibold">Color Preference</Label>
                  <RadioGroup id="colorPreference" value={customThemePreferences.colorPreference} onValueChange={(value) => handlePreferenceChange('colorPreference', value)} className="mt-2">
                    {['Cool Blues & Greens', 'Warm Earth Tones', 'Vibrant & Energetic', 'Monochromatic Grays'].map(c => (
                       <div key={c} className="flex items-center space-x-2">
                        <RadioGroupItem value={c} id={`color-${c.replace(/\s+/g, '-')}`} />
                        <Label htmlFor={`color-${c.replace(/\s+/g, '-')}`}>{c}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
              <div>
                <Label htmlFor="mode" className="text-base font-semibold">Light or Dark Mode</Label>
                <RadioGroup id="mode" value={customThemePreferences.mode} onValueChange={(value) => handlePreferenceChange('mode', value)} className="mt-2 flex space-x-4">
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
                    value={customThemePreferences.industryInspiration}
                    onChange={(e) => handlePreferenceChange('industryInspiration', e.target.value)}
                    className="mt-2"
                />
              </div>
              <Button onClick={handleGenerateCustomThemes} disabled={isGeneratingThemes} size="lg" className="w-full">
                {isGeneratingThemes ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Generate Custom Theme Options
              </Button>
            </CardContent>
          </Card>

          {/* Loading spinner while custom themes are generating */}
          {isGeneratingThemes && (
            <Card className="mt-8 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="text-xl font-semibold text-primary">AI is designing themes for you...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Display generated custom themes */}
          {generatedCustomThemes.length > 0 && (
            <div className="space-y-6 mt-8">
              <h2 className="text-2xl font-semibold text-center text-primary">Select Your Custom Theme</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedCustomThemes.map((theme, index) => (
                  <Card key={index} className="shadow-md hover:shadow-xl transition-shadow flex flex-col">
                    <CardHeader>
                      <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4">
                        <Image 
                          src={`https://placehold.co/600x338.png`} // Placeholder image URL
                          alt={`Preview for ${theme.themeName}`} 
                          width={600} 
                          height={338} 
                          className="object-cover w-full h-full"
                          data-ai-hint={theme.previewImagePrompt || "abstract theme"} // Use AI hint from theme data
                        />
                      </div>
                      <CardTitle className="text-xl text-accent">{theme.themeName}</CardTitle>
                      <CardDescription>{theme.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-end">
                       {/* This button used to link to /dashboard/portfolio, now handled by router.push after saving */}
                       <Button onClick={() => handleSelectCustomTheme(theme)} className="w-full mt-auto">
                         Select & View Portfolio <Eye className="ml-2 h-4 w-4"/>
                       </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Display Parsed CV Data */}
          <Separator className="my-8"/>
          <ParsedCvDisplay cvData={parsedCvData} />
        </>
      )}

      {/* Initial placeholder message when no CV data and not loading */}
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

