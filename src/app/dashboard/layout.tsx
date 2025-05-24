'use client';
import SiteHeader from '@/components/site-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="py-6 px-4 md:px-6 border-t">
        <p className="text-xs text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} CV Portfolio Pro. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
