
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react'; // Or Wand2, Bot
import AiHelperDialog from './ai-helper-dialog';

export default function AiHelperButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-xl p-4 h-16 w-16 z-50 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={() => setIsDialogOpen(true)}
        aria-label="AI Content Helper"
      >
        <Sparkles size={28} />
      </Button>
      <AiHelperDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
