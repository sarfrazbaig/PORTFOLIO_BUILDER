
'use client';

import Link from 'next/link';
import { Briefcase, Palette, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortfolioContext } from '@/contexts/portfolio-context';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme as useNextTheme } from 'next-themes'; // Renamed to avoid conflict

export default function PortfolioHeader() {
  const { cvData, theme, profession } = usePortfolioContext();
  const { theme: actualTheme, setTheme: setActualTheme } = useNextTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/portfolio', label: 'Home' },
    { href: '/portfolio/experience', label: 'Experience' },
    { href: '/portfolio/projects', label: 'Projects' },
    // Add more links as new pages are created (e.g., Education, Skills, Contact)
  ];

  return (
    <header className="bg-card/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/portfolio" className="flex items-center space-x-2 group">
              <Briefcase className="h-8 w-8 text-primary group-hover:animate-pulse" />
              <div>
                <span className="font-bold text-xl tracking-tight text-foreground">
                  {cvData?.personalInformation?.name || 'Your Name'}
                </span>
                {profession && <p className="text-xs text-muted-foreground font-medium">{profession}</p>}
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-3">
            {theme && (
              <div className="hidden sm:flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-lg shadow-sm">
                <Palette size={16} className="text-primary/80"/>
                <span className="text-xs font-semibold text-primary">{theme.themeName} Theme</span>
              </div>
            )}
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setActualTheme(actualTheme === 'light' ? 'dark' : 'light')}
                aria-label="Toggle theme"
                className="hidden md:inline-flex"
              >
                <Briefcase className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Menu className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /> {/* Placeholder, use Sun/Moon */}
              </Button>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-screen py-2" : "max-h-0"
          )}
        >
          <nav className="flex flex-col space-y-1 border-t border-border/50 pt-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-primary py-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
             <Button
                variant="ghost"
                onClick={() => setActualTheme(actualTheme === 'light' ? 'dark' : 'light')}
                aria-label="Toggle theme"
                className="w-full justify-start text-muted-foreground hover:text-primary py-3"
              >
                Toggle Theme {/* Placeholder, use Sun/Moon icons */}
              </Button>
            {theme && (
              <div className="sm:hidden flex items-center space-x-2 bg-primary/10 px-3 py-2 rounded-lg shadow-sm mt-2">
                <Palette size={16} className="text-primary/80"/>
                <span className="text-xs font-semibold text-primary">{theme.themeName} Theme</span>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
