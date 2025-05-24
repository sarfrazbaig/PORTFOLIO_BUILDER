
'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { parseCv, type ParseCvInput, type ParseCvOutput } from '@/ai/flows/cv-parser';
import { recommendTheme, type RecommendThemeInput, type RecommendThemeOutput } from '@/ai/flows/ai-theme-recommendation';
import { UploadCloud, Briefcase, Loader2 } from 'lucide-react';

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const cvUploadSchema = z.object({
  cvFile: z.any() // Changed from z.instanceof(FileList)
    .refine(
      (value): value is FileList => {
        // Check if FileList is available (client-side) and if value is an instance of it
        // This check runs at validation time (client-side for form submission)
        return typeof FileList !== 'undefined' && value instanceof FileList;
      },
      {
        message: "Invalid file input. Please ensure you've selected a file.",
      }
    )
    .refine((files) => files.length > 0, { message: 'CV file is required.' })
    .refine((files) => files.length > 0 && files[0].size <= 5 * 1024 * 1024, { message: 'Max file size is 5MB.' })
    .refine(
      (files) => {
        if (files.length === 0 || !files[0]?.type) return false; // Ensure file exists before checking type
        return ACCEPTED_MIME_TYPES.includes(files[0].type);
      },
      { message: `Invalid file type. Supported: PDF, DOC, DOCX, TXT.` }
    ),
  profession: z.string().min(3, 'Profession is required (min 3 characters).').max(100),
});

type CvUploadFormData = z.infer<typeof cvUploadSchema>;

interface CvUploadFormProps {
  onCvParsed: (data: ParseCvOutput) => void;
  onThemeRecommended: (data: RecommendThemeOutput) => void;
  onLoadingChange: (loading: boolean) => void;
  currentCvData: ParseCvOutput | null;
}

export default function CvUploadForm({ onCvParsed, onThemeRecommended, onLoadingChange, currentCvData }: CvUploadFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CvUploadFormData>({
    resolver: zodResolver(cvUploadSchema),
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (fileList && fileList.length > 0) {
      setValue("cvFile", fileList, { shouldValidate: true });
      setFileName(fileList[0].name);
    } else {
      // Create an empty FileList for consistent type
      const emptyFileList = new DataTransfer().files;
      setValue("cvFile", emptyFileList, { shouldValidate: true });
      setFileName(null);
    }
  };

  const onSubmit: SubmitHandler<CvUploadFormData> = async (data) => {
    setIsProcessing(true);
    onLoadingChange(true);
    toast({ title: 'Processing CV...', description: 'Please wait while we analyze your CV.' });

    try {
      // data.cvFile is now confirmed to be a FileList by Zod validation
      const file = data.cvFile[0]; 
      const reader = new FileReader();

      reader.onloadend = async () => {
        const cvDataUri = reader.result as string;
        
        try {
          const parseCvInput: ParseCvInput = { cvDataUri };
          const parsedCv = await parseCv(parseCvInput);
          onCvParsed(parsedCv);
          toast({ title: 'CV Parsed Successfully!', variant: 'default' });

          try {
            const recommendThemeInput: RecommendThemeInput = {
              cvContent: JSON.stringify(parsedCv.summary + " " + parsedCv.experience.map(e => e.description).join(" ")),
              profession: data.profession,
            };
            const themeRecommendation = await recommendTheme(recommendThemeInput);
            onThemeRecommended(themeRecommendation);
            toast({ title: 'Theme Recommended!', variant: 'default' });
          } catch (themeError) {
            console.error('Theme recommendation error:', themeError);
            toast({ title: 'Theme Recommendation Failed', description: 'Could not recommend a theme.', variant: 'destructive' });
            onThemeRecommended({themeName: 'Default', reason: 'Could not generate a recommendation due to an error.'});
          }
        } catch (cvError) {
          console.error('CV parsing error:', cvError);
          toast({ title: 'CV Parsing Failed', description: 'Please try a different file or check its content.', variant: 'destructive' });
        } finally {
          setIsProcessing(false);
          onLoadingChange(false);
        }
      };
      
      reader.onerror = () => {
        console.error('File reading error');
        toast({ title: 'File Reading Error', description: 'Could not read the uploaded file.', variant: 'destructive' });
        setIsProcessing(false);
        onLoadingChange(false);
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Form submission error:', error);
      toast({ title: 'Submission Error', description: 'An unexpected error occurred.', variant: 'destructive' });
      setIsProcessing(false);
      onLoadingChange(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <UploadCloud className="mr-2 h-6 w-6 text-primary" />
          Upload Your CV
        </CardTitle>
        <CardDescription>
          Provide your CV and profession to get started. We&apos;ll parse it and recommend a portfolio theme.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cvFile" className="text-base">CV Document</Label>
            <Input
              id="cvFile"
              type="file"
              accept={ACCEPTED_MIME_TYPES.join(',')}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-auto p-3"
              {...register('cvFile', { onChange: handleFileChange })} 
              disabled={isProcessing}
            />
            {fileName && <p className="text-sm text-muted-foreground mt-1">Selected file: {fileName}</p>}
            {errors.cvFile && <p className="text-sm text-destructive">{errors.cvFile.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession" className="text-base">Your Profession</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="profession"
                type="text"
                placeholder="e.g., Software Engineer, Graphic Designer"
                className="pl-10"
                {...register('profession')}
                disabled={isProcessing}
              />
            </div>
            {errors.profession && <p className="text-sm text-destructive">{errors.profession.message}</p>}
          </div>

          <Button type="submit" className="w-full text-lg py-6" disabled={isProcessing || !!errors.cvFile || !!errors.profession}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Parse CV & Get Recommendation'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
