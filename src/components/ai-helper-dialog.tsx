
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
import { rewriteContent, type RewriteContentInput } from '@/ai/flows/ai-content-rewrite';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

interface AiHelperDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contentToRewrite: string;
  onContentRewritten: (newContent: string) => void;
  contextLabel: string; // e.g., "Summary", "Job Description for X"
}

export default function AiHelperDialog({
  isOpen,
  onOpenChange,
  contentToRewrite,
  onContentRewritten,
  contextLabel,
}: AiHelperDialogProps) {
  const [instructions, setInstructions] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCurrentContent(contentToRewrite);
      setInstructions(''); // Reset instructions when dialog opens
    }
  }, [isOpen, contentToRewrite]);

  const handleRewrite = async () => {
    if (!currentContent && !instructions.trim()) {
      toast({ title: 'Error', description: 'Content or instructions are needed for the AI.', variant: 'destructive' });
      return;
    }
    if (!instructions.trim()) {
      toast({ title: 'Info', description: 'Please provide instructions for the AI to refine the content.', variant: 'default' });
      return;
    }


    setIsProcessing(true);
    toast({ title: 'AI is thinking...', description: `Rewriting your ${contextLabel.toLowerCase()}.` });

    try {
      const input: RewriteContentInput = {
        sectionContent: currentContent,
        instructions: instructions,
      };
      const result = await rewriteContent(input);

      if (result.rewrittenContent) {
        onContentRewritten(result.rewrittenContent);
        setCurrentContent(result.rewrittenContent); // Update dialog's view of content
        toast({ title: `${contextLabel} Rewritten!`, description: `Your ${contextLabel.toLowerCase()} has been updated by the AI.` });
        // onOpenChange(false); // Optionally close dialog on success
      } else {
        throw new Error('AI did not return rewritten content.');
      }
    } catch (error) {
      console.error('AI rewrite error:', error);
      toast({ title: 'AI Rewrite Failed', description: `Could not rewrite the ${contextLabel.toLowerCase()}.`, variant: 'destructive' });
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
            AI Content Helper: {contextLabel}
          </DialogTitle>
          <DialogDescription>
            Use the AI to rewrite or enhance the selected content. Provide your instructions below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-content-ai">Current Content</Label>
            <Textarea
              id="current-content-ai"
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)} // Allow editing current content too
              rows={6}
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-instructions">Your Instructions</Label>
            <Textarea
              id="ai-instructions"
              placeholder={`e.g., "Make this ${contextLabel.toLowerCase()} more concise and highlight leadership skills."`}
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
