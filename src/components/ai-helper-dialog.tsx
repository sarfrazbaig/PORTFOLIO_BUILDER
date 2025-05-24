
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePortfolioContext } from '@/contexts/portfolio-context';
import { rewriteContent, type RewriteContentInput } from '@/ai/flows/ai-content-rewrite';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

interface AiHelperDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function AiHelperDialog({ isOpen, onOpenChange }: AiHelperDialogProps) {
  const { cvData, setCvData } = usePortfolioContext();
  const [instructions, setInstructions] = useState('');
  const [currentSummary, setCurrentSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (cvData?.summary) {
      setCurrentSummary(cvData.summary);
    }
  }, [cvData?.summary, isOpen]); // Reload summary if dialog opens or cvData.summary changes

  const handleRewrite = async () => {
    if (!cvData || !cvData.summary) {
      toast({ title: 'Error', description: 'No summary found to rewrite.', variant: 'destructive' });
      return;
    }
    if (!instructions.trim()) {
      toast({ title: 'Error', description: 'Please provide instructions for the AI.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    toast({ title: 'AI is thinking...', description: 'Rewriting your summary.' });

    try {
      const input: RewriteContentInput = {
        sectionContent: cvData.summary,
        instructions: instructions,
      };
      const result = await rewriteContent(input);

      if (result.rewrittenContent) {
        const updatedCvData = { ...cvData, summary: result.rewrittenContent };
        setCvData(updatedCvData); // This will also update localStorage via context
        setCurrentSummary(result.rewrittenContent); // Update local state for dialog display
        toast({ title: 'Summary Rewritten!', description: 'Your summary has been updated by the AI.' });
        setInstructions(''); // Clear instructions
        // onOpenChange(false); // Optionally close dialog on success
      } else {
        throw new Error('AI did not return rewritten content.');
      }
    } catch (error) {
      console.error('AI rewrite error:', error);
      toast({ title: 'AI Rewrite Failed', description: 'Could not rewrite the summary.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            AI Content Helper
          </DialogTitle>
          <DialogDescription>
            Let AI help you rewrite your portfolio summary. Provide instructions below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-summary">Current Summary</Label>
            <Textarea
              id="current-summary"
              value={currentSummary}
              readOnly
              rows={5}
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-instructions">Your Instructions</Label>
            <Textarea
              id="ai-instructions"
              placeholder="e.g., 'Make it more concise and highlight my leadership skills.'"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              disabled={isProcessing}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={isProcessing}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleRewrite} disabled={isProcessing || !instructions.trim()}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rewriting...
              </>
            ) : (
              'Rewrite with AI'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
