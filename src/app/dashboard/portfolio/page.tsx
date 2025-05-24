
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page is now a redirector to the new /portfolio structure.
// It ensures that any old bookmarks or direct navigation to /dashboard/portfolio
// will be sent to the new main portfolio page.

export default function OldPortfolioPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new main portfolio page
    router.replace('/portfolio');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
      <h1 className="text-2xl font-semibold text-foreground mb-2">Redirecting to your portfolio...</h1>
      <p className="text-muted-foreground">
        Please wait while we take you to the new portfolio page.
      </p>
    </div>
  );
}
